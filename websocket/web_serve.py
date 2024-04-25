#!/usr/bin/env python
import asyncio
from websockets.server import serve
import requests
import json
import xmlrpc.client
from websockets.exceptions import ConnectionClosedError

class WebSocketServer:
    def __init__(self):
        self.connected = {}

    async def echo(self, websocket,path):
        origin = path.split('&')[0].split('=')[1]
        addr = websocket.remote_address
        self.connected[addr] = websocket
        if  origin == 'client':
            user = path.split('&')[1].split('=')[1]
            password = path.split('&')[2].split('=')[1]
            # if origin != 'server':
            print(user,password)
            # 请求http并将websocket连接传递给http请求
            print(f"New connection from {addr}. Total connections: {len(self.connected)}")
            url = 'http://127.0.0.1:8069'
            db = 'wechat_server'
            common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
            uid = common.authenticate(db, user, password, {})
            if not uid:
                # 断开连接
                await websocket.send('登录失败')
                websocket.close()
            print(f"用户id:{uid}")
            models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
            ip = websocket.remote_address[0]
            port = websocket.remote_address[1]
            print(addr)
            return_data = models.execute_kw(db, uid, password, 'websocket.client', 'create_websocket_client', [addr,ip,port,uid],{})
            websocket_client_id = return_data.get('websocket_client_id')
        # if origin == 'server':
        #     # 接收open函数发送的消息
        #     print('server')
        #     inin_data = await websocket.recv()
        #     print(inin_data)
        try:
            async for message in websocket:
                print(f"Received message from {addr}: {message}")
                # 给指定客户端发送消息
                json_data = json.loads(message)        
                if json_data.get('origin') == 'server':
                    print('server')
                    address = tuple(eval(json_data.get('address')))
                    await self.send_message(address,json_data)
        except ConnectionClosedError:
            print(f"Connection closed from {addr}. Total connections: {len(self.connected)}")
        finally:
            # Unregister.
            del self.connected[addr]
            if origin == 'client':
                return_data = models.execute_kw(db, uid, password, 'websocket.client', 'update_websocket_client_states', [websocket_client_id],{})
    # 处理函数回调
    def handle_data(self, data):
        if data.get('code') == 200:
            return data
        print('连接失败,服务器异常')
        # TODO 增加异常处理
        return False
    
    
    async def send_message(self, addr, message):
        if addr in self.connected:
            await self.connected[addr].send(json.dumps(message))
        else:
            print(f"No connection found for {addr}")

    async def print_connected(self):
        for addr in self.connected:
            print(f"Connected: {addr}")

    async def start(self):
        async with serve(self.echo, 'localhost', 8765):
            print("Server started")
            await asyncio.Future()  # run forever

if __name__ == "__main__":
    server = WebSocketServer()
    asyncio.run(server.start())
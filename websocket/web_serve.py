#!/usr/bin/env python
import asyncio
from websockets.server import serve
import requests
import json

class WebSocketServer:
    def __init__(self):
        self.connected = {}

    async def echo(self, websocket, path):
        # Register.
        
        addr = websocket.remote_address
        self.connected[addr] = websocket
        json_data = json_data = json.loads(await websocket.recv())
        print(f"请求内容：{json_data}")
        user = json_data.get('user')
        password = json_data.get('password')
        # 请求http并将websocket连接传递给http请求
        print(f"New connection from {addr}. Total connections: {len(self.connected)}")
        requests.post('http://localhost:8067/websocket_serve/create_websocket_client', json={'ip': websocket.remote_address[0],'port': websocket.remote_address[1],'user': user, 'password': password})
        try:
            async for message in websocket:
                print(f"Received: {message}")
                if message == 'print_connected':
                    await self.print_connected()
                await websocket.send(message)
        finally:
            # Unregister.
            del self.connected[addr]
            print(f"Connection closed from {addr}. Total connections: {len(self.connected)}")

    async def send_message(self, addr, message):
        if addr in self.connected:
            await self.connected[addr].send(message)
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
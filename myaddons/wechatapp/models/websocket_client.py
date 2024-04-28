from odoo import fields, models, api
from websocket import create_connection
import time
import json
import uuid
class WebsocketClient(models.Model):
    _inherit = "websocket.client"

    wechat_account_ids = fields.One2many("wechat.account", "websocket_client_id", string="微信账号")
    
    
    # 获取websocket客户端启用的微信列表
    def get_wechat_list(self):
        for client in self:
            data = {
                "task_name": "获取微信列表",
                "task_content": {},
                "task_function_type": "client_get_wechat_list",
                "task_context_type": "client",
                "websocket_client_id": self.id,
                "orderID": str(uuid.uuid1())
                }
    def send_client_message(self):
        """
            给客户端发送消息
        """
        # 获取websocket客户端的host和port
        url = self.get_websocket_url()
        ws = create_connection("ws://localhost:8765/?origin=server&user=1&password=1")
        data = {
            "type": "message",
            "message": "Hello, World!",
            "ip": 1,
            "origin": "server",
            "address": self.websocket_remote_address
        }
        ws.send(json.dumps(data))
        time.sleep(2)
        ws.close()
    
    def get_websocket_url(self):
        """
            获取websocket客户端
        """
        websocket_host = self.env["ir.config_parameter"].sudo().get_param("websocket_host")
        websocket_port = self.env["ir.config_parameter"].sudo().get_param("websocket_port")
            
        return f"ws://{websocket_host}:{websocket_port}?user=1&password=1"
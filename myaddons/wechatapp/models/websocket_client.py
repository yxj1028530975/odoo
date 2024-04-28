from odoo import fields, models, api

import uuid
class WebsocketClient(models.Model):
    _inherit = "websocket.client"

    wechat_account_ids = fields.One2many("wechat.account", "websocket_client_id", string="微信账号")
    
    
    # 获取websocket客户端启用的微信列表
    def get_wechat_list(self):
        data_list = []
        for client in self:
            data = {
                "task_name": "获取微信列表",
                "task_content": {},
                "task_function_type": "client_get_wechat_list",
                "task_context_type": "client",
                "websocket_client_id": client.id,
                "orderID": str(uuid.uuid1())
                }
            
            data_list.append(data)
        task_queue_id = self.env["task.queue"].create(data_list)

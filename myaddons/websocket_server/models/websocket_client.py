from odoo import fields, models, api

class WebsocketClient(models.Model):
    _name = "websocket.client"
    _description = "Websocket Client"
    _rec_name = "websocket_client_name"

    websocket_client_name = fields.Char(string="客户端名称")
    websocket_client_host = fields.Char(string="IP", required=True)
    websocket_client_port = fields.Char(string="端口", required=True)
    websocket_remote_address = fields.Char(string="远程地址")
    states = fields.Selection(
        [
            ("connected", "在线"),
            ("disconnected", "离线"),
        ],
        string="States",
        default="disconnected",
    )
    user_id = fields.Many2one("res.users", string="关联用户")

    @api.model
    def create(self, vals):
        # 给name增加编号
        vals["websocket_client_name"] = (
            self.env["ir.sequence"].next_by_code("websocket.client") or "/"
        )
        return super(WebsocketClient, self).create(vals)

    @api.model
    def create_websocket_client(self, addr, ip, port, uid):
        # TODO 按ip和用户分类，端口暂时不考虑
        if (
            websocket_client_id := self.env["websocket.client"]
            .sudo()
            .search(
                [   
                    ("websocket_client_host", "=", ip),
                    # ("websocket_client_port", "=", port),
                    ("user_id", "=", uid),
                ]
            )
        ):
            websocket_client_id.sudo().write({"states": "connected", "websocket_client_port": port, "websocket_remote_address": addr})
        else:
            websocket_client_id = (
                self.env["websocket.client"]
                .sudo()
                .create(
                    {   
                        "websocket_client_host": ip,
                        "websocket_client_port": port,
                        "websocket_remote_address": addr,
                        "states": "connected",
                        "user_id": uid,
                    }
                )
            )
        return {"code": 200, "msg": "连接成功", "websocket_client_id": websocket_client_id.id}
    
    @api.model
    def update_websocket_client_states(self, id):
        """
            更新websocket客户端的状态。
        """
        if websocket_client_id := self.env["websocket.client"].sudo().browse(id):
            websocket_client_id.sudo().write({"states": "disconnected"})
        else:
            return {"code": 400, "msg": "客户端不存在"}
        return {"code": 200, "msg": "客户端状态更新成功"}


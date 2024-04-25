# -*- coding: utf-8 -*-

from odoo import models, fields, api


class WechatAccount(models.Model):
    _name = 'wechat.account'
    _description = 'Wechat Account'

    name = fields.Char(string="微信名称")
    wechat_account_port = fields.Char(string="微信占用端口")
    wechat_process_id = fields.Char(string="进程 ID")
    websocket_client_id = fields.Many2one("websocket.client", string="客户端")
    wechat_states = fields.Selection(
        [("online", "在线"), ("offline", "离线")],
        string="状态",
        default="offline",tracking=True
    )

    @api.depends('value')
    def _value_pc(self):
        for record in self:
            record.value2 = float(record.value) / 100


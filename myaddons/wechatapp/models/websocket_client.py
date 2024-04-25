from odoo import fields, models, api
from websocket import create_connection
import time
import json
class WebsocketClient(models.Model):
    _inherit = "websocket.client"

    wechat_account_ids = fields.One2many("wechat.account", "websocket_client_id", string="微信账号")
# -*- coding: utf-8 -*-

from odoo import models, fields, api


class WechatAddressBook(models.Model):
    _name = 'wechat.address_book'
    _description = 'WechatAddressBook'

    sequence = fields.Integer(string="Sequence")
    name = fields.Char(string="Name", required=True, index=True)
    display_name = fields.Char(string="Display Name", compute="_compute_display_name", store=True)
    wechat_id = fields.Char(string="Wechat ID", required=True, index=True)
    user_name = fields.Char(string="User Name", index=True)
    remark_name = fields.Char(string="Remark Name")
    sex = fields.Selection(
        [("1", "male"), ("2", "female"), ("0", "unknown")], default="1"
    )
    account_type = fields.Selection(
        [
            ("1", "好友"),
            ("2", "群聊"),
        ],
        string="Account Type",
        default="1",
        required=True,
        readonly=True,
    )
    wechat_account_lag_ids = fields.Many2many(
        "wechat.account.lag", string="Wechat Account Lag"
    )
    image_128 = fields.Image("Image", max_width=128, max_height=128)
    country = fields.Char(string="Country")
    province = fields.Char(string="Province")
    area = fields.Char(string="Area")
    signinfo = fields.Char(string="Sign Info")
    head_url = fields.Char(string="Head Url")
    background_image = fields.Char(string="Background Image")
    v3 = fields.Boolean(string="V3", default=False)
    v4 = fields.Boolean(string="V4", default=False)
    from_chat_room = fields.Boolean(string="From Chat Room", default=False)


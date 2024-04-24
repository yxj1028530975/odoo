# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = ['res.config.settings']

    websocket_host = fields.Char(string='IP',default='http://127.0.0.1',config_parameter='websocket_host')
    websocket_port = fields.Char(string='Port',default='8765',config_parameter='websocket_port')
    websocket_ping_interval = fields.Integer(string='Ping Interval (seconds)', default=5,config_parameter='websocket_ping_interval')
    websocket_ping_timeout = fields.Integer(string='Ping Timeout (seconds)', default=5,config_parameter='websocket_ping_timeout')
from odoo import fields, models

class WebsocketClient(models.Model):
    _name = 'websocket.client'
    _description = 'Websocket Client'

    websocket_client_name = fields.Char(string='Name', required=True)
    websocket_client_host = fields.Char(string='Host', required=True)
    websocket_client_port = fields.Char(string='Port', required=True)
    states = fields.Selection([
        ('connected', 'Connected'),
        ('disconnected', 'Disconnected'),
    ], string='States', default='disconnected')
    user_id = fields.Many2one('res.users', string='User')

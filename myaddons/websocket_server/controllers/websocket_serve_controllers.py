# -*- coding: utf-8 -*-
from odoo import http
import logging
from odoo.exceptions import AccessDenied

_logger = logging.getLogger(__name__)
class WebsocketServeControllers(http.Controller):
    @http.route('/websocket_serve/create_websocket_client', auth='public', methods=["GET", "POST"], csrf=False)
    def create_websocket_client(self, **kw):
        json_data = http.request.get_json_data()
        logging.info(f"请求内容：{json_data}")
        # {'ip': websocket.remote_address[0],'port': websocket.remote_address[1],'user': user, 'password': password}
        # 检查用户是否存在并且密码正确
        user_id = http.request.env['res.users'].sudo().browse(json_data.get('user_id'))
        if not user_id:
            return '{"code": 400, "msg": "用户不存在"}'
        ip = json_data.get('ip')
        port = json_data.get('port')
        if (
            websocket_client_id := http.request.env['websocket.client']
            .sudo()
            .search([('websocket_client_host', '=', ip), ('websocket_client_port', '=', port)])
        ):
            websocket_client_id.sudo().write({'websocket_client_host': ip, 'websocket_client_port': port, 'states': 'connected', 'user_id': user_id.id})
        else:
            http.request.env['websocket.client'].sudo().create({'websocket_client_host': ip, 'websocket_client_port': port, 'states': 'connected', 'user_id': user_id.id})
        return '{"code": 200, "msg": "连接成功"}'
        
        


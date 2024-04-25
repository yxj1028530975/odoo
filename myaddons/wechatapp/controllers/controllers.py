# -*- coding: utf-8 -*-
# from odoo import http


# class Wechatapp(http.Controller):
#     @http.route('/wechatapp/wechatapp', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/wechatapp/wechatapp/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('wechatapp.listing', {
#             'root': '/wechatapp/wechatapp',
#             'objects': http.request.env['wechatapp.wechatapp'].search([]),
#         })

#     @http.route('/wechatapp/wechatapp/objects/<model("wechatapp.wechatapp"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('wechatapp.object', {
#             'object': obj
#         })


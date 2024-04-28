# -*- coding: utf-8 -*-
# from odoo import http


# class TaskQueue(http.Controller):
#     @http.route('/task_queue/task_queue', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/task_queue/task_queue/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('task_queue.listing', {
#             'root': '/task_queue/task_queue',
#             'objects': http.request.env['task_queue.task_queue'].search([]),
#         })

#     @http.route('/task_queue/task_queue/objects/<model("task_queue.task_queue"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('task_queue.object', {
#             'object': obj
#         })


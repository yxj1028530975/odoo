from odoo import fields, models, api

class TaskQueue(models.Model):
    _name = "task.queue"
    _description = "Task Queue"
    _rec_name = "task_name"
    
    task_name = fields.Char(string="任务名称")
    task_content = fields.Json(string="任务内容")
    state = fields.Selection(
        [
            ("todo", "待处理"),
            ("doing", "处理中"),
            ("success", "成功"),
            ("fail", "失败"),
        ],
        string="状态",
        default="todo",
    )
    
    task_function_type = fields.Selection(
        [   ("client_start_wechat", "启动微信客户端"),
            ("client_stop_wechat", "关闭微信客户端"),
            ("client_get_wechat_list", "获取微信列表"),
            ("wechat_send_message", "发送消息"),
            ("wechat_send_image", "发送图片"),
            ("wechat_send_file", "发送文件"),
            ("wechat_send_link", "发送链接"),
            ("wechat_send_location", "发送位置"),
            ("wechat_send_mini_program", "发送小程序"),
            ("wechat_send_template_message", "发送模板消息"),
        ],
        string="功能类型",
        default="wechat_send_message",
    )
    
    task_context_type = fields.Selection(
        [
            ("client", "客户端"),
            ("wechat", "微信"),
        ],
        string="任务类型",
        default="wechat",
    )
    websocket_client_id = fields.Many2one("websocket.client", string="客户端")
    
    user_id = fields.Many2one("res.users", string="关联用户",default=lambda self: self.env.user)
    
    orderID = fields.Char(string="任务ID")

    def execute_tasks(self, message):
        ...
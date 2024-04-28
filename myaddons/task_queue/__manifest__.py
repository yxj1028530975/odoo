# -*- coding: utf-8 -*-
{
    'name': "task_queue",

    'summary': "任务队列",

    'description': """
        任务队列
    """,

    "author": "木不易成楊！",
    "website": "http://livetools.top/",
    "category": "wechat/task_queue",
    'version': '0.1',
    'depends': ['base'],
    'data': [
        'security/ir.model.access.csv',
        'views/task_queue_views.xml',
        'views/task_queue_menu.xml',
    ],
    "application": True,
    "installable": True,
}


# -*- coding: utf-8 -*-
{
    'name': "wechatapp",

    'summary': "Short (1 phrase/line) summary of the module's purpose",

    'description': """
Long description of module's purpose
    """,

    "author": "木不易成楊！",
    "website": "http://livetools.top/",
    "category": "wechat/wechatapp",
    'version': '0.1',
    'depends': ['base','websocket_server'],
    'data': [
        'security/ir.model.access.csv',
        'views/wechat_account_views.xml',
        'views/websocket_client_views.xml',
        'views/wechatapp_menu.xml',
    ],
    "application": True,
    "installable": True,
}


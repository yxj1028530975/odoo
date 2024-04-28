# -*- coding: utf-8 -*-
{
    'name': "websocket_server",

    'summary': "客户端管理",

    'description': 
        """
            客户端管理
        """,

    "author": "木不易成楊！",
    "website": "http://livetools.top/",
    "category": "wechat/websocket",
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/res_config_settings_views.xml',
        'data/websocket_client_sequence_data.xml',
        'views/websocket_client_views.xml',
        # 'views/websocket_menu.xml',
    ],
    # only loaded in demonstration mode
    "application": True,
    "installable": True,
}


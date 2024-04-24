# -*- coding: utf-8 -*-
{
    'name': "websocket_serve",

    'summary': "Short (1 phrase/line) summary of the module's purpose",

    'description': 
        """
            Long description of module's purpose
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
        'views/websocket_client_views.xml',
        'views/websocket_menu.xml',
    ],
    # only loaded in demonstration mode
    "application": True,
    "installable": True,
}


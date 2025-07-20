    """
    生产环境配置
    """
    from .settings_base import *

    # SECURITY WARNING: don't run with debug turned on in production!
    DEBUG = False

    ALLOWED_HOSTS = [
        'xcx.euans.xyz',
        'www.xcx.euans.xyz',
        '127.0.0.1',
        'localhost',
    ]

    # Database - 生产环境使用MySQL
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': 'qlxcx',  # 数据库名称
            'USER': 'qlxcx',      # 数据库用户名
            'PASSWORD': 'accpqn7789', # 数据库密码
            'HOST': 'localhost',     # 数据库主机
            'PORT': '3306',          # 数据库端口
            'OPTIONS': {
                'charset': 'utf8mb4',
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }

    # 如果需要使用SQLite（不推荐生产环境），取消下面的注释：
    # DATABASES = {
    #     'default': {
    #         'ENGINE': 'django.db.backends.sqlite3',
    #         'NAME': BASE_DIR / 'db.sqlite3',
    #     }
    # }

    # 邮箱配置 - 生产环境（使用QQ邮箱，自定义后端解决SSL问题）
    EMAIL_BACKEND = 'core.email_backend.SimpleEmailBackend'  # 使用自定义邮件后端
    EMAIL_HOST = 'smtp.qq.com'  # 使用QQ邮箱
    EMAIL_PORT = 587  # 使用TLS端口
    EMAIL_USE_TLS = True
    EMAIL_USE_SSL = False  # 明确禁用SSL，使用TLS
    EMAIL_HOST_USER = '1690076901@qq.com'  # QQ邮箱
    EMAIL_HOST_PASSWORD = 'tvablmptngyvibag'  # QQ邮箱授权码
    EMAIL_TIMEOUT = 30

    # 禁用SSL证书验证（解决服务器环境SSL问题）
    import ssl
    ssl._create_default_https_context = ssl._create_unverified_context

    # CORS设置 - 生产环境限制域名
    CORS_ALLOWED_ORIGINS = [
        "https://xcx.euans.xyz",
        "https://www.xcx.euans.xyz",
    ]

    # 安全设置
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

    # 静态文件收集目录 - 与nginx配置保持一致
    STATIC_ROOT = '/www/wwwroot/xcx2/back/django_back2/staticfiles'

    # 媒体文件目录 - 与nginx配置保持一致
    MEDIA_ROOT = '/www/wwwroot/xcx2/back/django_back2/media'

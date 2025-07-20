"""
阿里云邮件推送服务配置
如果QQ邮箱和163邮箱都不行，可以使用这个配置
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
        'NAME': 'xcx_database',  # 数据库名称
        'USER': 'xcx_user',      # 数据库用户名
        'PASSWORD': 'xcx123456', # 数据库密码
        'HOST': 'localhost',     # 数据库主机
        'PORT': '3306',          # 数据库端口
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# 阿里云邮件推送服务配置
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtpdm.aliyun.com'  # 阿里云邮件推送SMTP服务器
EMAIL_PORT = 80  # 或者使用25端口
EMAIL_USE_TLS = False  # 阿里云邮件推送不使用TLS
EMAIL_HOST_USER = 'your_email@your_domain.com'  # 需要在阿里云配置
EMAIL_HOST_PASSWORD = 'your_smtp_password'  # 阿里云SMTP密码
EMAIL_TIMEOUT = 30

# 如果使用SSL端口
# EMAIL_PORT = 465
# EMAIL_USE_SSL = True
# EMAIL_USE_TLS = False

# CORS设置 - 生产环境限制域名
CORS_ALLOWED_ORIGINS = [
    "https://xcx.euans.xyz",
    "https://www.xcx.euans.xyz",
]

# 安全设置
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# 静态文件收集目录
STATIC_ROOT = '/www/wwwroot/django_back2/staticfiles'

# 媒体文件目录
MEDIA_ROOT = '/www/wwwroot/django_back2/media'

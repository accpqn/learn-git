"""
临时邮件配置 - 用于调试和测试
不发送真实邮件，将验证码记录到日志中
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

# 临时邮件配置 - 输出到控制台和日志
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# 也可以使用文件后端
# EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
# EMAIL_FILE_PATH = BASE_DIR / 'logs' / 'emails'

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

# 临时验证码配置 - 用于测试
TEMP_EMAIL_MODE = True  # 标记这是临时邮件模式

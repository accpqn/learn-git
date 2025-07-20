"""
开发环境配置
"""
from .settings_base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# 邮箱配置 - 开发环境使用控制台后端
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# 如果要测试真实邮件发送，取消下面的注释：
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.qq.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = '1690076901@qq.com'
# EMAIL_HOST_PASSWORD = 'tvablmptngyvibag'
# EMAIL_TIMEOUT = 30

# 开发环境特定设置
CORS_ALLOW_ALL_ORIGINS = True

# 日志级别调整为DEBUG
LOGGING['loggers']['django']['level'] = 'DEBUG'
LOGGING['loggers']['users']['level'] = 'DEBUG'

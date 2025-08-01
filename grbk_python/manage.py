#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

"""
先对某个模块创建模型迁移的文件
python manage.py makemigrations article
执行迁移命令
python manage.py migrate

# 启动服务器
python manage.py runserver
"""


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'grbk_python.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()

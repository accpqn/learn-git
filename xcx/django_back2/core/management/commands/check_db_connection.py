from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Check the database connection'

    def handle(self, *args, **options):
        settings_dict = settings.DATABASES['default']

        self.stdout.write(self.style.SUCCESS("数据库连接信息如下："))
        self.stdout.write(f"  主 机 (HOST):        {settings_dict.get('HOST', 'N/A')}")
        self.stdout.write(f"  数据库名称 (NAME):    {settings_dict.get('NAME', 'N/A')}")
        self.stdout.write(f"  用户名 (USER):        {settings_dict.get('USER', 'N/A')}")
        self.stdout.write(f"  端 口 (PORT):        {settings_dict.get('PORT', 'N/A')}")

        self.stdout.write(self.style.WARNING("------------------------------------------------"))
        self.stdout.write(self.style.WARNING("请将以上“数据库名称”与您的 MySQL 客户端中的信息进行核对。"))

        # 特别检查是否连接到了 SQLite 文件
        if 'sqlite' in settings_dict.get('ENGINE', ''):
            self.stdout.write(self.style.WARNING("您当前使用的是 SQLite 数据库，请确保您的应用程序正确配置为使用 SQLite 数据库。"))
        else:
            self.stdout.write(self.style.SUCCESS("数据库连接检查完成。"))
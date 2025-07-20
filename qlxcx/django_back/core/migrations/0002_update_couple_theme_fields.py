# Generated manually for couple theme fields update

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        # 添加新的颜色字段
        migrations.AddField(
            model_name='coupletheme',
            name='primary_color',
            field=models.CharField(default='#FF69B4', help_text='十六进制颜色代码, e.g., #FF69B4', max_length=7, verbose_name='主色调'),
        ),
        migrations.AddField(
            model_name='coupletheme',
            name='secondary_color',
            field=models.CharField(default='#FF1493', help_text='十六进制颜色代码, e.g., #FF1493', max_length=7, verbose_name='辅助色'),
        ),
        migrations.AddField(
            model_name='coupletheme',
            name='background_color',
            field=models.CharField(default='#FFF5F8', help_text='十六进制颜色代码, e.g., #FFF5F8', max_length=7, verbose_name='背景色'),
        ),
        migrations.AddField(
            model_name='coupletheme',
            name='theme_name',
            field=models.CharField(default='粉色恋人', max_length=50, verbose_name='主题名称'),
        ),
        migrations.AddField(
            model_name='coupletheme',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, verbose_name='创建时间', null=True),
        ),
        # 重命名原有字段
        migrations.RenameField(
            model_name='coupletheme',
            old_name='theme_color',
            new_name='old_theme_color',
        ),
        # 删除旧字段（可选，保留以防数据丢失）
        # migrations.RemoveField(
        #     model_name='coupletheme',
        #     name='old_theme_color',
        # ),
    ]

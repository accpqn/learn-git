# Generated manually for user avatar and bio fields

from django.db import migrations, models
import users.models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_couplebinding_unbound_at_couplebinding_unbound_by_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to=users.models.user_avatar_path, verbose_name='头像文件'),
        ),
        migrations.AddField(
            model_name='user',
            name='bio',
            field=models.TextField(blank=True, max_length=500, verbose_name='个人简介'),
        ),
    ]

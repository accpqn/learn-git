# Generated manually for CoupleBinding requester field change

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_user_avatar_user_bio'),
    ]

    operations = [
        # 修改 requester 字段从 OneToOneField 到 ForeignKey
        migrations.AlterField(
            model_name='couplebinding',
            name='requester',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='initiated_bindings',
                to='users.user',
                verbose_name='发起绑定的用户'
            ),
        ),
    ]

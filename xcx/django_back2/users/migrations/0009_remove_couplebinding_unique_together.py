# Generated manually to remove unique_together constraint

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_alter_couplebinding_requester'),
    ]

    operations = [
        # 移除 unique_together 约束
        migrations.AlterUniqueTogether(
            name='couplebinding',
            unique_together=set(),
        ),
    ]

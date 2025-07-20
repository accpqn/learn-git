# users/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
class DiyUserCreationForm(UserCreationForm):
    """
    自定义用户创建表单，继承自 Django 内置的 UserCreationForm。
    """
    # 新增字段email，类型是EmailField会自动验证输入是否为有效的邮箱格式
    email = forms.EmailField(label="邮箱", required=True)

    class Meta(UserCreationForm.Meta):
        """
        Meta 类用于配置表单。
        """
        # 从父类的 Meta 中继承所有字段
        model = UserCreationForm.Meta.model
        fields = UserCreationForm.Meta.fields + ('email',)


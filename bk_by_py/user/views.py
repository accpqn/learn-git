
# users/views.py
from django.shortcuts import render, redirect
from .forms import DiyUserCreationForm


def register(request):
    """
    处理用户注册的视图函数。
    """
    if request.method == 'POST':
        # 如果是 POST 请求，说明用户提交了表单
        form = DiyUserCreationForm(request.POST)
        if form.is_valid():
            # is_valid() 会自动运行表单中的所有验证规则
            form.save()
            # 保存成功后，重定向到登录页面
            return redirect('login')
    else:
        # 如果是 GET 请求，说明用户想看注册表单
        form = DiyUserCreationForm()

    # 渲染注册页面，并将表单对象传给模板
    return render(request, 'users/register.html', {'form': form})
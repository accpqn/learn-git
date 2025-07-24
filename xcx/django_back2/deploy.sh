#!/bin/bash

# Django后端部署脚本

set -e  # 遇到错误立即退出

echo "开始部署Django后端..."

# 检查Python版本
echo "检查Python版本..."
python3 --version

# 1. 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 2. 升级pip
echo "升级pip..."
pip install --upgrade pip

# 3. 安装依赖
echo "安装Python依赖..."
pip install -r requirements.txt

# 4. 强制使用生产环境配置
SETTINGS_MODULE="djangoProject.settings_prod"
echo "🔧 使用生产环境配置: settings_prod.py (MySQL数据库)"

# 检查配置文件是否存在
if [ ! -f "djangoProject/settings_prod.py" ]; then
    echo "生产环境配置文件不存在: djangoProject/settings_prod.py"
    exit 1
fi

# 5. 创建必要目录
echo "创建必要目录..."
mkdir -p media/avatars
mkdir -p media/products
mkdir -p staticfiles
mkdir -p logs

# 6. 执行数据库迁移
echo "执行数据库迁移..."
python manage.py migrate --settings=$SETTINGS_MODULE

# 7. 收集静态文件
echo "收集静态文件..."
python manage.py collectstatic --noinput --settings=$SETTINGS_MODULE

# 8. 创建超级用户（交互式）
echo "是否创建超级用户? (y/N)"
read -r create_superuser
if [ "$create_superuser" = "y" ] || [ "$create_superuser" = "Y" ]; then
    python manage.py createsuperuser --settings=$SETTINGS_MODULE
fi

# 9. 测试配置
echo "测试Django配置..."
python manage.py check --settings=$SETTINGS_MODULE

# 10. 询问是否启动服务
echo ""
echo "是否启动Django服务? (y/N)"
read -r start_service
if [ "$start_service" = "y" ] || [ "$start_service" = "Y" ]; then
    echo "启动Django服务..."
    ./start.sh
else
    echo "部署完成，未启动服务"
    echo "要启动服务，请运行: ./start.sh"
fi

echo "Django后端部署完成！"
echo "项目目录: $(pwd)"
echo "日志目录: $(pwd)/logs"
echo "配置文件: $SETTINGS_MODULE"

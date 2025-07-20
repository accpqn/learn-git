#!/bin/bash

# Django服务启动脚本

set -e  # 遇到错误立即退出

echo "🚀 启动Django服务..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "❌ 虚拟环境不存在，请先运行 ./deploy.sh"
    exit 1
fi

# 激活虚拟环境
echo "📦 激活虚拟环境..."
source venv/bin/activate

# 强制使用生产环境配置
SETTINGS_MODULE="djangoProject.settings_prod"
echo "📋 使用配置: settings_prod.py (生产环境 - MySQL)"

# 检查配置文件是否存在
if [ ! -f "djangoProject/settings_prod.py" ]; then
    echo "❌ 生产环境配置文件不存在: djangoProject/settings_prod.py"
    exit 1
fi

# 检查是否已经在运行
if [ -f "gunicorn.pid" ]; then
    PID=$(cat gunicorn.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Django服务已在运行 (PID: $PID)"
        echo "如需重启，请先运行 ./stop.sh"
        exit 1
    else
        echo "🧹 清理无效的PID文件"
        rm -f gunicorn.pid
    fi
fi

# 创建必要目录
mkdir -p logs
mkdir -p media/avatars
mkdir -p media/products

# 检查数据库连接
echo "🔍 检查数据库连接..."
python manage.py check --database default --settings=$SETTINGS_MODULE

if [ $? -ne 0 ]; then
    echo "❌ 数据库连接失败，请检查配置"
    exit 1
fi

# 生产环境使用Gunicorn后台启动
echo "🌙 后台启动Gunicorn服务器..."
gunicorn --bind 127.0.0.1:8000 \
         --workers 3 \
         --timeout 120 \
         --access-logfile logs/access.log \
         --error-logfile logs/error.log \
         --pid gunicorn.pid \
         --daemon \
         --env DJANGO_SETTINGS_MODULE=$SETTINGS_MODULE \
         djangoProject.wsgi:application

if [ $? -eq 0 ]; then
    echo "✅ Django服务已在后台启动"
    echo "📁 PID文件: $(pwd)/gunicorn.pid"
    echo "📝 访问日志: $(pwd)/logs/access.log"
    echo "📝 错误日志: $(pwd)/logs/error.log"
    echo "🔍 检查状态: ./status.sh"
    echo "🛑 停止服务: ./stop.sh"
else
    echo "❌ 启动失败，请检查日志"
    exit 1
fi

echo "🎉 Django服务启动完成！"

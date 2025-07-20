#!/bin/bash

# Django服务重启脚本

echo "🔄 重启Django服务..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查脚本是否存在
if [ ! -f "stop.sh" ] || [ ! -f "start.sh" ]; then
    echo "❌ 缺少必要的脚本文件 (stop.sh 或 start.sh)"
    exit 1
fi

# 设置脚本执行权限
chmod +x stop.sh start.sh status.sh 2>/dev/null

echo "🛑 正在停止服务..."
./stop.sh

# 等待服务完全停止
echo "⏳ 等待服务停止..."
sleep 3

# 检查是否还有残留进程
REMAINING=$(ps aux | grep -E "(gunicorn|runserver)" | grep -v grep)
if [ ! -z "$REMAINING" ]; then
    echo "⚠️  发现残留进程，强制清理..."
    pkill -9 -f "gunicorn.*djangoProject" 2>/dev/null || true
    pkill -9 -f "runserver" 2>/dev/null || true
    sleep 2
fi

echo ""
echo "🚀 正在启动服务..."

# 选择启动方式
echo "选择启动方式:"
echo "1. 后台运行 (推荐)"
echo "2. 前台运行"
echo "3. 开发模式"

read -p "请选择 (1-3，默认1): " restart_option

# 默认选择后台运行
if [ -z "$restart_option" ]; then
    restart_option=1
fi

case $restart_option in
    1)
        echo "🌙 后台启动服务..."
        # 直接启动后台服务，不使用交互式脚本
        source venv/bin/activate
        
        # 确定配置文件
        if [ -f "djangoProject/settings_local.py" ]; then
            SETTINGS_MODULE="djangoProject.settings_local"
        elif [ -f "djangoProject/settings_baota.py" ]; then
            SETTINGS_MODULE="djangoProject.settings_baota"
        else
            SETTINGS_MODULE="djangoProject.settings_prod"
        fi
        
        # 创建必要目录
        mkdir -p logs media/avatars media/products
        
        # 启动Gunicorn
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
            echo "✅ 服务已在后台启动"
            sleep 2
            ./status.sh
        else
            echo "❌ 启动失败"
            exit 1
        fi
        ;;
    2)
        echo "🖥️  前台启动服务..."
        echo "按 Ctrl+C 停止服务"
        echo "3" | ./start.sh
        ;;
    3)
        echo "🔧 开发模式启动..."
        echo "按 Ctrl+C 停止服务"
        echo "1" | ./start.sh
        ;;
    *)
        echo "❌ 无效选择，使用默认后台启动"
        echo "3" | ./start.sh
        ;;
esac

echo "🎉 重启完成！"

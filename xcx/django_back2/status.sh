#!/bin/bash

# Django服务状态检查脚本

echo "🔍 检查Django服务状态..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查PID文件
if [ -f "gunicorn.pid" ]; then
    PID=$(cat gunicorn.pid)
    echo "📋 找到PID文件: $PID"
    
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Gunicorn进程正在运行 (PID: $PID)"
        
        # 检查端口占用
        PORT_INFO=$(netstat -tlnp 2>/dev/null | grep :8000 || lsof -ti:8000 2>/dev/null)
        if [ ! -z "$PORT_INFO" ]; then
            echo "✅ 端口8000正在监听"
        else
            echo "⚠️  端口8000未在监听"
        fi
        
        # 显示进程信息
        echo ""
        echo "📊 进程信息:"
        ps aux | grep $PID | grep -v grep
        
        # 显示日志文件大小
        if [ -f "logs/access.log" ]; then
            ACCESS_SIZE=$(du -h logs/access.log | cut -f1)
            echo "📝 访问日志大小: $ACCESS_SIZE"
        fi
        
        if [ -f "logs/error.log" ]; then
            ERROR_SIZE=$(du -h logs/error.log | cut -f1)
            echo "📝 错误日志大小: $ERROR_SIZE"
        fi
        
    else
        echo "❌ PID文件中的进程不存在"
        echo "🧹 清理无效的PID文件"
        rm -f gunicorn.pid
    fi
else
    echo "📋 未找到PID文件"
fi

# 检查所有Django相关进程
echo ""
echo "🔍 查找所有Django相关进程..."
DJANGO_PROCESSES=$(ps aux | grep -E "(gunicorn|runserver)" | grep -v grep)

if [ ! -z "$DJANGO_PROCESSES" ]; then
    echo "📋 找到Django进程:"
    echo "$DJANGO_PROCESSES"
else
    echo "❌ 未找到Django进程"
fi

# 检查端口占用
echo ""
echo "🔍 检查端口8000占用情况..."
PORT_CHECK=$(netstat -tlnp 2>/dev/null | grep :8000 || lsof -ti:8000 2>/dev/null)

if [ ! -z "$PORT_CHECK" ]; then
    echo "📋 端口8000占用情况:"
    echo "$PORT_CHECK"
else
    echo "❌ 端口8000未被占用"
fi

# 检查日志文件
echo ""
echo "📝 日志文件状态:"
if [ -f "logs/access.log" ]; then
    echo "✅ 访问日志存在: logs/access.log"
    echo "   最后10行:"
    tail -n 5 logs/access.log | sed 's/^/   /'
else
    echo "❌ 访问日志不存在"
fi

if [ -f "logs/error.log" ]; then
    echo "✅ 错误日志存在: logs/error.log"
    if [ -s "logs/error.log" ]; then
        echo "   最后5行:"
        tail -n 5 logs/error.log | sed 's/^/   /'
    else
        echo "   (文件为空)"
    fi
else
    echo "❌ 错误日志不存在"
fi

echo ""
echo "🎉 状态检查完成！"

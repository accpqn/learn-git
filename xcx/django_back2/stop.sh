#!/bin/bash

# Django服务停止脚本

echo "🛑 停止Django服务..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 停止标志
STOPPED=false

# 方法1: 通过PID文件停止
if [ -f "gunicorn.pid" ]; then
    PID=$(cat gunicorn.pid)
    echo "📋 找到PID文件: $PID"
    
    if ps -p $PID > /dev/null 2>&1; then
        echo "🔄 正在停止Gunicorn进程 (PID: $PID)..."
        kill $PID
        
        # 等待进程结束
        for i in {1..10}; do
            if ! ps -p $PID > /dev/null 2>&1; then
                echo "✅ Gunicorn进程已停止"
                STOPPED=true
                break
            fi
            echo "⏳ 等待进程结束... ($i/10)"
            sleep 1
        done
        
        # 如果进程仍在运行，强制杀死
        if ps -p $PID > /dev/null 2>&1; then
            echo "⚡ 强制停止进程..."
            kill -9 $PID
            STOPPED=true
        fi
    else
        echo "⚠️  PID文件中的进程不存在"
    fi
    
    # 清理PID文件
    rm -f gunicorn.pid
    echo "🧹 已清理PID文件"
fi

# 方法2: 通过进程名停止所有相关进程
echo "🔍 查找所有Django相关进程..."
DJANGO_PIDS=$(ps aux | grep -E "(gunicorn|runserver)" | grep -v grep | awk '{print $2}')

if [ ! -z "$DJANGO_PIDS" ]; then
    echo "📋 找到Django进程: $DJANGO_PIDS"
    
    for pid in $DJANGO_PIDS; do
        if ps -p $pid > /dev/null 2>&1; then
            echo "🔄 停止进程 $pid..."
            kill $pid
            STOPPED=true
        fi
    done
    
    # 等待所有进程结束
    sleep 2
    
    # 检查是否还有残留进程
    REMAINING_PIDS=$(ps aux | grep -E "(gunicorn|runserver)" | grep -v grep | awk '{print $2}')
    if [ ! -z "$REMAINING_PIDS" ]; then
        echo "⚡ 强制停止残留进程: $REMAINING_PIDS"
        for pid in $REMAINING_PIDS; do
            kill -9 $pid 2>/dev/null || true
        done
        STOPPED=true
    fi
fi

# 方法3: 使用pkill命令
echo "🔍 使用pkill清理残留进程..."
pkill -f "gunicorn.*djangoProject" 2>/dev/null && STOPPED=true
pkill -f "runserver" 2>/dev/null && STOPPED=true

# 检查端口占用
echo "🔍 检查端口8000占用情况..."
PORT_PID=$(lsof -ti:8000 2>/dev/null || netstat -tlnp 2>/dev/null | grep :8000 | awk '{print $7}' | cut -d'/' -f1)

if [ ! -z "$PORT_PID" ]; then
    echo "📋 端口8000被进程 $PORT_PID 占用"
    for pid in $PORT_PID; do
        if ps -p $pid > /dev/null 2>&1; then
            echo "🔄 停止占用端口的进程 $pid..."
            kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
            STOPPED=true
        fi
    done
fi

# 最终检查
sleep 1
FINAL_CHECK=$(ps aux | grep -E "(gunicorn|runserver)" | grep -v grep)

if [ -z "$FINAL_CHECK" ]; then
    if [ "$STOPPED" = true ]; then
        echo "✅ Django服务已成功停止"
    else
        echo "ℹ️  没有发现运行中的Django服务"
    fi
else
    echo "⚠️  仍有Django进程在运行:"
    echo "$FINAL_CHECK"
    echo ""
    echo "如需强制停止所有相关进程，请运行:"
    echo "pkill -9 -f gunicorn"
    echo "pkill -9 -f runserver"
fi

# 清理临时文件
echo "🧹 清理临时文件..."
rm -f gunicorn.pid 2>/dev/null || true

echo "🎉 停止脚本执行完成！"

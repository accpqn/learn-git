#!/usr/bin/env python3
"""
Django项目清理脚本
清理开发过程中产生的临时文件、缓存文件和无用文件
"""

import os
import shutil
import glob

def cleanup_project():
    """清理项目文件"""
    
    # 当前目录
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("开始清理Django项目...")
    
    # 1. 清理Python缓存文件
    print("清理Python缓存文件...")
    cache_patterns = [
        '**/__pycache__',
        '**/*.pyc',
        '**/*.pyo',
        '**/*.pyd',
        '**/.Python'
    ]
    
    for pattern in cache_patterns:
        for path in glob.glob(os.path.join(base_dir, pattern), recursive=True):
            if os.path.isdir(path):
                shutil.rmtree(path)
                print(f"删除目录: {path}")
            elif os.path.isfile(path):
                os.remove(path)
                print(f"删除文件: {path}")
    
    # 2. 清理迁移相关的临时文件
    print("\n清理迁移相关临时文件...")
    migration_files = [
        'MIGRATION_GUIDE.md',
        'MIGRATION_SUCCESS_REPORT.md',
        'add_user_fields.sql',
        'cleanup_old_theme_field.py',
        'migrate_data.py',
        'migrate_data.sql',
        'migrate_database.py',
        'migrate_theme_fields.py',
        'task_protocol.md'
    ]
    
    for file in migration_files:
        file_path = os.path.join(base_dir, file)
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"删除文件: {file}")
    
    # 3. 清理SQL备份文件
    print("\n清理SQL备份文件...")
    sql_files = [
        'qlorder.sql',
        'qlorder_bf.sql'
    ]
    
    for file in sql_files:
        file_path = os.path.join(base_dir, file)
        if os.path.exists(file_path):
            # 移动到backup目录而不是删除
            backup_dir = os.path.join(base_dir, 'backup')
            if not os.path.exists(backup_dir):
                os.makedirs(backup_dir)
            shutil.move(file_path, os.path.join(backup_dir, file))
            print(f"移动到backup: {file}")
    
    # 4. 清理开发环境数据库（可选）
    print("\n处理开发数据库...")
    db_file = os.path.join(base_dir, 'db.sqlite3')
    if os.path.exists(db_file):
        backup_dir = os.path.join(base_dir, 'backup')
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        shutil.copy2(db_file, os.path.join(backup_dir, 'db.sqlite3.backup'))
        print("SQLite数据库已备份到backup目录")
        
        # 询问是否删除开发数据库
        response = input("是否删除开发数据库文件? (y/N): ")
        if response.lower() == 'y':
            os.remove(db_file)
            print("删除开发数据库文件")
    
    # 5. 清理测试产品图片
    print("\n清理测试产品图片...")
    products_dir = os.path.join(base_dir, 'products')
    if os.path.exists(products_dir):
        for file in os.listdir(products_dir):
            if file.endswith(('.jpg', '.png', '.gif')) and not file.startswith('__'):
                file_path = os.path.join(products_dir, file)
                os.remove(file_path)
                print(f"删除测试图片: {file}")
    
    # 6. 清理日志文件
    print("\n清理日志文件...")
    log_patterns = [
        '*.log',
        'logs/*.log'
    ]
    
    for pattern in log_patterns:
        for path in glob.glob(os.path.join(base_dir, pattern)):
            if os.path.isfile(path):
                os.remove(path)
                print(f"删除日志文件: {path}")
    
    print("\n项目清理完成!")
    print("\n保留的重要文件:")
    print("- backup/ (SQL备份)")
    print("- media/avatars/ (用户头像)")
    print("- requirements.txt (依赖列表)")
    print("- deploy.sh (部署脚本)")
    print("- manage.py (Django管理脚本)")
    print("- 所有应用代码和迁移文件")

if __name__ == "__main__":
    cleanup_project()

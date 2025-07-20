#!/usr/bin/env python
"""
手动执行数据库迁移脚本
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoProject.settings')
django.setup()

from django.db import connection

def add_user_fields():
    """
    手动添加用户表的avatar和bio字段
    """
    with connection.cursor() as cursor:
        try:
            # 检查avatar字段是否已存在
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'qlorder' 
                AND TABLE_NAME = 'users_user' 
                AND COLUMN_NAME = 'avatar'
            """)
            
            if not cursor.fetchone():
                print("添加avatar字段...")
                cursor.execute("""
                    ALTER TABLE users_user 
                    ADD COLUMN avatar VARCHAR(100) NULL
                """)
                print("✅ avatar字段添加成功")
            else:
                print("✅ avatar字段已存在")
            
            # 检查bio字段是否已存在
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'qlorder' 
                AND TABLE_NAME = 'users_user' 
                AND COLUMN_NAME = 'bio'
            """)
            
            if not cursor.fetchone():
                print("添加bio字段...")
                cursor.execute("""
                    ALTER TABLE users_user 
                    ADD COLUMN bio TEXT NULL
                """)
                print("✅ bio字段添加成功")
            else:
                print("✅ bio字段已存在")
                
        except Exception as e:
            print(f"❌ 添加字段失败: {e}")
            return False
    
    return True

def update_migration_record():
    """
    更新Django迁移记录
    """
    with connection.cursor() as cursor:
        try:
            # 检查迁移记录是否已存在
            cursor.execute("""
                SELECT id FROM django_migrations 
                WHERE app = 'users' AND name = '0007_user_avatar_user_bio'
            """)
            
            if not cursor.fetchone():
                print("更新Django迁移记录...")
                cursor.execute("""
                    INSERT INTO django_migrations (app, name, applied) 
                    VALUES ('users', '0007_user_avatar_user_bio', NOW())
                """)
                print("✅ 迁移记录更新成功")
            else:
                print("✅ 迁移记录已存在")
                
        except Exception as e:
            print(f"❌ 更新迁移记录失败: {e}")
            return False
    
    return True

def main():
    print("🚀 开始执行数据库迁移...")
    
    # 添加字段
    if add_user_fields():
        print("📝 字段添加完成")
    else:
        print("❌ 字段添加失败，退出")
        return
    
    # 更新迁移记录
    if update_migration_record():
        print("📋 迁移记录更新完成")
    else:
        print("❌ 迁移记录更新失败")
        return
    
    print("🎉 数据库迁移完成！")
    print("现在可以重启Django服务器了")

if __name__ == '__main__':
    main()

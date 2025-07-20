#!/usr/bin/env python
"""
手动执行主题字段迁移脚本
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoProject.settings')
django.setup()

from django.db import connection

def add_theme_fields():
    """
    手动添加主题表的新字段
    """
    with connection.cursor() as cursor:
        try:
            # 检查primary_color字段是否已存在
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'qlorder' 
                AND TABLE_NAME = 'core_coupletheme' 
                AND COLUMN_NAME = 'primary_color'
            """)
            
            if not cursor.fetchone():
                print("添加primary_color字段...")
                cursor.execute("""
                    ALTER TABLE core_coupletheme 
                    ADD COLUMN primary_color VARCHAR(7) DEFAULT '#FF69B4'
                """)
                print("✅ primary_color字段添加成功")
            else:
                print("✅ primary_color字段已存在")
            
            # 检查secondary_color字段是否已存在
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'qlorder' 
                AND TABLE_NAME = 'core_coupletheme' 
                AND COLUMN_NAME = 'secondary_color'
            """)
            
            if not cursor.fetchone():
                print("添加secondary_color字段...")
                cursor.execute("""
                    ALTER TABLE core_coupletheme 
                    ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#FF1493'
                """)
                print("✅ secondary_color字段添加成功")
            else:
                print("✅ secondary_color字段已存在")
                
            # 检查background_color字段是否已存在
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'qlorder' 
                AND TABLE_NAME = 'core_coupletheme' 
                AND COLUMN_NAME = 'background_color'
            """)
            
            if not cursor.fetchone():
                print("添加background_color字段...")
                cursor.execute("""
                    ALTER TABLE core_coupletheme 
                    ADD COLUMN background_color VARCHAR(7) DEFAULT '#FFF5F8'
                """)
                print("✅ background_color字段添加成功")
            else:
                print("✅ background_color字段已存在")
                
            # 检查theme_name字段是否已存在
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'qlorder' 
                AND TABLE_NAME = 'core_coupletheme' 
                AND COLUMN_NAME = 'theme_name'
            """)
            
            if not cursor.fetchone():
                print("添加theme_name字段...")
                cursor.execute("""
                    ALTER TABLE core_coupletheme 
                    ADD COLUMN theme_name VARCHAR(50) DEFAULT '粉色恋人'
                """)
                print("✅ theme_name字段添加成功")
            else:
                print("✅ theme_name字段已存在")
                
            # 检查created_at字段是否已存在
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'qlorder' 
                AND TABLE_NAME = 'core_coupletheme' 
                AND COLUMN_NAME = 'created_at'
            """)
            
            if not cursor.fetchone():
                print("添加created_at字段...")
                cursor.execute("""
                    ALTER TABLE core_coupletheme 
                    ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                """)
                print("✅ created_at字段添加成功")
            else:
                print("✅ created_at字段已存在")
                
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
                WHERE app = 'core' AND name = '0002_update_couple_theme_fields'
            """)
            
            if not cursor.fetchone():
                print("更新Django迁移记录...")
                cursor.execute("""
                    INSERT INTO django_migrations (app, name, applied) 
                    VALUES ('core', '0002_update_couple_theme_fields', NOW())
                """)
                print("✅ 迁移记录更新成功")
            else:
                print("✅ 迁移记录已存在")
                
        except Exception as e:
            print(f"❌ 更新迁移记录失败: {e}")
            return False
    
    return True

def main():
    print("🚀 开始执行主题字段迁移...")
    
    # 添加字段
    if add_theme_fields():
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
    
    print("🎉 主题字段迁移完成！")
    print("现在可以使用完整的主题配置功能了")

if __name__ == '__main__':
    main()

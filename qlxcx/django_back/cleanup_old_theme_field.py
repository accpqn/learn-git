#!/usr/bin/env python
"""
清理旧的theme_color字段
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoProject.settings')
django.setup()

from django.db import connection

def cleanup_old_field():
    """
    清理旧的theme_color字段
    """
    with connection.cursor() as cursor:
        try:
            # 检查old_theme_color字段是否存在
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'qlorder' 
                AND TABLE_NAME = 'core_coupletheme' 
                AND COLUMN_NAME = 'old_theme_color'
            """)
            
            if cursor.fetchone():
                print("删除old_theme_color字段...")
                cursor.execute("""
                    ALTER TABLE core_coupletheme 
                    DROP COLUMN old_theme_color
                """)
                print("✅ old_theme_color字段删除成功")
            else:
                print("✅ old_theme_color字段不存在")
            
            # 检查theme_color字段是否存在
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'qlorder' 
                AND TABLE_NAME = 'core_coupletheme' 
                AND COLUMN_NAME = 'theme_color'
            """)
            
            if cursor.fetchone():
                print("删除theme_color字段...")
                cursor.execute("""
                    ALTER TABLE core_coupletheme 
                    DROP COLUMN theme_color
                """)
                print("✅ theme_color字段删除成功")
            else:
                print("✅ theme_color字段不存在")
                
        except Exception as e:
            print(f"❌ 清理字段失败: {e}")
            return False
    
    return True

def main():
    print("🚀 开始清理旧的主题字段...")
    
    if cleanup_old_field():
        print("📝 字段清理完成")
    else:
        print("❌ 字段清理失败")
        return
    
    print("🎉 旧字段清理完成！")
    print("Django服务器现在应该可以正常启动了")

if __name__ == '__main__':
    main()

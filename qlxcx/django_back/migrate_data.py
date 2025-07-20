#!/usr/bin/env python
"""
数据迁移脚本：从core应用迁移数据到新的menus和orders应用
执行前请确保已经运行了新应用的迁移：
python manage.py makemigrations users menus orders core
python manage.py migrate

然后运行此脚本：
python migrate_data.py
"""

import os
import sys
import django

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoProject.settings')
django.setup()

from django.db import transaction, connection
from django.core.management.color import make_style

style = make_style()

def execute_sql(sql, description):
    """执行SQL语句"""
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
            affected_rows = cursor.rowcount
            print(style.SUCCESS(f"✅ {description} - 影响行数: {affected_rows}"))
            return True
    except Exception as e:
        print(style.ERROR(f"❌ {description} 失败: {str(e)}"))
        return False

def check_table_exists(table_name):
    """检查表是否存在"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = %s
        """, [table_name])
        return cursor.fetchone()[0] > 0

def get_table_count(table_name):
    """获取表中的记录数"""
    if not check_table_exists(table_name):
        return 0
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        return cursor.fetchone()[0]

def migrate_data():
    """执行数据迁移"""
    print(style.HTTP_INFO("🚀 开始数据迁移..."))
    
    # 检查源表是否存在
    source_tables = [
        'core_menucategory',
        'core_product', 
        'core_demandorder',
        'core_demandorderitem',
        'core_orderreview'
    ]
    
    print(style.HTTP_INFO("\n📊 检查源表数据..."))
    for table in source_tables:
        count = get_table_count(table)
        print(f"  {table}: {count} 条记录")
    
    # 检查目标表是否存在
    target_tables = [
        'menus_menucategory',
        'menus_product',
        'orders_demandorder', 
        'orders_demandorderitem',
        'orders_orderreview'
    ]
    
    print(style.HTTP_INFO("\n🎯 检查目标表..."))
    for table in target_tables:
        exists = check_table_exists(table)
        status = "✅ 存在" if exists else "❌ 不存在"
        print(f"  {table}: {status}")
        if not exists:
            print(style.ERROR(f"错误：目标表 {table} 不存在，请先运行迁移命令"))
            return False
    
    try:
        with transaction.atomic():
            print(style.HTTP_INFO("\n🔄 开始数据迁移..."))
            
            # 1. 迁移菜单分类 (core_menucategory -> menus_menucategory)
            if get_table_count('core_menucategory') > 0:
                sql = """
                INSERT INTO menus_menucategory 
                (id, binding_id, name, description, sort_order, created_at, updated_at)
                SELECT 
                    id, 
                    binding_id, 
                    name, 
                    description,
                    0 as sort_order,
                    created_at, 
                    updated_at
                FROM core_menucategory
                WHERE NOT EXISTS (
                    SELECT 1 FROM menus_menucategory WHERE menus_menucategory.id = core_menucategory.id
                )
                """
                execute_sql(sql, "迁移菜单分类数据")
            
            # 2. 迁移商品 (core_product -> menus_product)  
            if get_table_count('core_product') > 0:
                sql = """
                INSERT INTO menus_product 
                (id, category_id, name, description, price, image_url, image, is_active, sort_order, created_at, updated_at)
                SELECT 
                    id,
                    category_id,
                    name,
                    description, 
                    price,
                    NULL as image_url,
                    image,
                    is_active,
                    0 as sort_order,
                    created_at,
                    updated_at
                FROM core_product
                WHERE NOT EXISTS (
                    SELECT 1 FROM menus_product WHERE menus_product.id = core_product.id
                )
                """
                execute_sql(sql, "迁移商品数据")
            
            # 3. 迁移订单 (core_demandorder -> orders_demandorder)
            if get_table_count('core_demandorder') > 0:
                sql = """
                INSERT INTO orders_demandorder 
                (id, creator_id, binding_id, status, notes, total_price, created_at, updated_at)
                SELECT 
                    id,
                    creator_id,
                    binding_id, 
                    status,
                    notes,
                    total_price,
                    created_at,
                    updated_at
                FROM core_demandorder
                WHERE NOT EXISTS (
                    SELECT 1 FROM orders_demandorder WHERE orders_demandorder.id = core_demandorder.id
                )
                """
                execute_sql(sql, "迁移订单数据")
            
            # 4. 迁移订单项 (core_demandorderitem -> orders_demandorderitem)
            if get_table_count('core_demandorderitem') > 0:
                sql = """
                INSERT INTO orders_demandorderitem 
                (id, order_id, product_id, quantity, price, actual_price, receiver_notes)
                SELECT 
                    id,
                    order_id,
                    product_id,
                    quantity, 
                    price,
                    actual_price,
                    receiver_notes
                FROM core_demandorderitem
                WHERE NOT EXISTS (
                    SELECT 1 FROM orders_demandorderitem WHERE orders_demandorderitem.id = core_demandorderitem.id
                )
                """
                execute_sql(sql, "迁移订单项数据")
            
            # 5. 迁移订单评价 (core_orderreview -> orders_orderreview)
            if get_table_count('core_orderreview') > 0:
                sql = """
                INSERT INTO orders_orderreview 
                (id, order_id, creator_id, rating, comment, created_at)
                SELECT 
                    id,
                    order_id,
                    creator_id,
                    rating,
                    comment, 
                    created_at
                FROM core_orderreview
                WHERE NOT EXISTS (
                    SELECT 1 FROM orders_orderreview WHERE orders_orderreview.id = core_orderreview.id
                )
                """
                execute_sql(sql, "迁移订单评价数据")
            
            print(style.SUCCESS("\n🎉 数据迁移完成！"))
            
            # 显示迁移后的统计
            print(style.HTTP_INFO("\n📈 迁移后统计："))
            print(f"  menus_menucategory: {get_table_count('menus_menucategory')} 条记录")
            print(f"  menus_product: {get_table_count('menus_product')} 条记录") 
            print(f"  orders_demandorder: {get_table_count('orders_demandorder')} 条记录")
            print(f"  orders_demandorderitem: {get_table_count('orders_demandorderitem')} 条记录")
            print(f"  orders_orderreview: {get_table_count('orders_orderreview')} 条记录")
            
            return True
            
    except Exception as e:
        print(style.ERROR(f"\n💥 迁移失败: {str(e)}"))
        return False

def cleanup_old_tables():
    """清理旧表（可选）"""
    print(style.WARNING("\n⚠️  是否要删除旧的core应用中的表？"))
    print("这将删除以下表：")
    print("  - core_menucategory")
    print("  - core_product") 
    print("  - core_demandorder")
    print("  - core_demandorderitem")
    print("  - core_orderreview")
    
    confirm = input("输入 'yes' 确认删除，其他任意键取消: ")
    
    if confirm.lower() == 'yes':
        tables_to_drop = [
            'core_demandorderitem',  # 先删除有外键的表
            'core_orderreview',
            'core_demandorder', 
            'core_product',
            'core_menucategory'
        ]
        
        print(style.HTTP_INFO("\n🗑️  删除旧表..."))
        for table in tables_to_drop:
            if check_table_exists(table):
                execute_sql(f"DROP TABLE {table}", f"删除表 {table}")
            else:
                print(style.WARNING(f"⚠️  表 {table} 不存在，跳过"))
        
        print(style.SUCCESS("✅ 旧表清理完成"))
    else:
        print(style.HTTP_INFO("🔄 保留旧表，迁移完成"))

if __name__ == '__main__':
    print(style.HTTP_INFO("=" * 60))
    print(style.HTTP_INFO("🔄 情侣点餐系统 - 数据迁移脚本"))
    print(style.HTTP_INFO("=" * 60))
    
    # 执行迁移
    success = migrate_data()
    
    if success:
        # 询问是否清理旧表
        cleanup_old_tables()
        print(style.SUCCESS("\n🎊 迁移流程全部完成！"))
    else:
        print(style.ERROR("\n💔 迁移失败，请检查错误信息"))
        sys.exit(1)

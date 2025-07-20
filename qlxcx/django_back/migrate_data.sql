-- =====================================================
-- 情侣点餐系统 - 数据迁移SQL脚本
-- 从core应用迁移数据到新的menus和orders应用
-- =====================================================

-- 注意：执行此脚本前请确保已经运行了Django迁移：
-- python manage.py makemigrations users menus orders core
-- python manage.py migrate

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. 迁移菜单分类数据
-- core_menucategory -> menus_menucategory
-- =====================================================

INSERT INTO menus_menucategory 
(id, binding_id, name, description, sort_order, created_at, updated_at)
SELECT 
    id, 
    binding_id, 
    name, 
    description,
    0 as sort_order,  -- 新增字段，默认为0
    created_at, 
    updated_at
FROM core_menucategory
WHERE NOT EXISTS (
    SELECT 1 FROM menus_menucategory 
    WHERE menus_menucategory.id = core_menucategory.id
);

-- =====================================================
-- 2. 迁移商品数据  
-- core_product -> menus_product
-- =====================================================

INSERT INTO menus_product 
(id, category_id, name, description, price, image_url, image, is_active, sort_order, created_at, updated_at)
SELECT 
    id,
    category_id,
    name,
    description, 
    price,
    NULL as image_url,  -- 新增字段，暂时为空
    image,
    is_active,
    0 as sort_order,    -- 新增字段，默认为0
    created_at,
    updated_at
FROM core_product
WHERE NOT EXISTS (
    SELECT 1 FROM menus_product 
    WHERE menus_product.id = core_product.id
);

-- =====================================================
-- 3. 迁移订单数据
-- core_demandorder -> orders_demandorder  
-- =====================================================

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
    SELECT 1 FROM orders_demandorder 
    WHERE orders_demandorder.id = core_demandorder.id
);

-- =====================================================
-- 4. 迁移订单项数据
-- core_demandorderitem -> orders_demandorderitem
-- =====================================================

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
    SELECT 1 FROM orders_demandorderitem 
    WHERE orders_demandorderitem.id = core_demandorderitem.id
);

-- =====================================================
-- 5. 迁移订单评价数据
-- core_orderreview -> orders_orderreview
-- =====================================================

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
    SELECT 1 FROM orders_orderreview 
    WHERE orders_orderreview.id = core_orderreview.id
);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 迁移完成后的数据统计查询
-- =====================================================

SELECT '迁移完成统计' as info;

SELECT 
    'menus_menucategory' as table_name,
    COUNT(*) as record_count
FROM menus_menucategory
UNION ALL
SELECT 
    'menus_product' as table_name,
    COUNT(*) as record_count  
FROM menus_product
UNION ALL
SELECT 
    'orders_demandorder' as table_name,
    COUNT(*) as record_count
FROM orders_demandorder
UNION ALL
SELECT 
    'orders_demandorderitem' as table_name,
    COUNT(*) as record_count
FROM orders_demandorderitem
UNION ALL
SELECT 
    'orders_orderreview' as table_name,
    COUNT(*) as record_count
FROM orders_orderreview;

-- =====================================================
-- 可选：删除旧表（请谨慎执行）
-- 如果确认迁移成功，可以取消注释以下语句来删除旧表
-- =====================================================

/*
-- 删除旧表（注意顺序，先删除有外键依赖的表）
DROP TABLE IF EXISTS core_demandorderitem;
DROP TABLE IF EXISTS core_orderreview; 
DROP TABLE IF EXISTS core_demandorder;
DROP TABLE IF EXISTS core_product;
DROP TABLE IF EXISTS core_menucategory;

SELECT '旧表已删除' as cleanup_status;
*/

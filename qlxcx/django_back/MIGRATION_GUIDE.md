# 🔄 数据迁移指南

## 📋 概述

本指南将帮助你将现有的数据从 `core` 应用迁移到新的 `menus` 和 `orders` 应用。

## 🎯 迁移目标

- `core_menucategory` → `menus_menucategory`
- `core_product` → `menus_product`  
- `core_demandorder` → `orders_demandorder`
- `core_demandorderitem` → `orders_demandorderitem`
- `core_orderreview` → `orders_orderreview`

## 📊 当前数据状态

根据数据库分析，当前有以下数据需要迁移：

- **core_menucategory**: 1条记录 (水果分类)
- **core_product**: 1条记录 (苹果商品)
- **core_demandorder**: 0条记录
- **core_demandorderitem**: 0条记录
- **core_orderreview**: 0条记录

## 🚀 执行步骤

### 步骤1: 更新users模型（解绑优化）

```bash
cd django_back
python manage.py makemigrations users
python manage.py migrate users
```

### 步骤2: 创建新应用的数据库表

```bash
python manage.py makemigrations menus
python manage.py makemigrations orders  
python manage.py makemigrations core
python manage.py migrate
```

### 步骤3: 执行数据迁移

#### 方法A: 使用Python脚本（推荐）

```bash
python migrate_data.py
```

#### 方法B: 使用SQL脚本

```bash
# 连接到MySQL数据库
mysql -u root -p qlorder

# 执行迁移脚本
source migrate_data.sql;
```

#### 方法C: 手动SQL执行

如果上述方法都有问题，可以手动执行以下SQL：

```sql
-- 1. 迁移菜单分类
INSERT INTO menus_menucategory 
(id, binding_id, name, description, sort_order, created_at, updated_at)
SELECT id, binding_id, name, description, 0, created_at, updated_at
FROM core_menucategory;

-- 2. 迁移商品
INSERT INTO menus_product 
(id, category_id, name, description, price, image_url, image, is_active, sort_order, created_at, updated_at)
SELECT id, category_id, name, description, price, NULL, image, is_active, 0, created_at, updated_at
FROM core_product;

-- 3. 迁移订单（如果有数据）
INSERT INTO orders_demandorder 
(id, creator_id, binding_id, status, notes, total_price, created_at, updated_at)
SELECT id, creator_id, binding_id, status, notes, total_price, created_at, updated_at
FROM core_demandorder;

-- 4. 迁移订单项（如果有数据）
INSERT INTO orders_demandorderitem 
(id, order_id, product_id, quantity, price, actual_price, receiver_notes)
SELECT id, order_id, product_id, quantity, price, actual_price, receiver_notes
FROM core_demandorderitem;

-- 5. 迁移订单评价（如果有数据）
INSERT INTO orders_orderreview 
(id, order_id, creator_id, rating, comment, created_at)
SELECT id, order_id, creator_id, rating, comment, created_at
FROM core_orderreview;
```

### 步骤4: 验证迁移结果

```sql
-- 检查迁移后的数据
SELECT 'menus_menucategory' as table_name, COUNT(*) as count FROM menus_menucategory
UNION ALL
SELECT 'menus_product', COUNT(*) FROM menus_product
UNION ALL  
SELECT 'orders_demandorder', COUNT(*) FROM orders_demandorder
UNION ALL
SELECT 'orders_demandorderitem', COUNT(*) FROM orders_demandorderitem
UNION ALL
SELECT 'orders_orderreview', COUNT(*) FROM orders_orderreview;
```

预期结果：
- `menus_menucategory`: 1条记录
- `menus_product`: 1条记录
- 其他表: 0条记录

### 步骤5: 测试新API

```bash
# 启动开发服务器
python manage.py runserver

# 测试新的API端点
curl http://127.0.0.1:8000/api/menus/categories/
curl http://127.0.0.1:8000/api/menus/products/
curl http://127.0.0.1:8000/api/orders/demand-orders/
```

### 步骤6: 清理旧表（可选）

⚠️ **警告**: 只有在确认迁移成功且新功能正常工作后才执行此步骤！

```sql
-- 删除旧表
DROP TABLE IF EXISTS core_demandorderitem;
DROP TABLE IF EXISTS core_orderreview;
DROP TABLE IF EXISTS core_demandorder; 
DROP TABLE IF EXISTS core_product;
DROP TABLE IF EXISTS core_menucategory;
```

## 🔧 故障排除

### 问题1: 外键约束错误

如果遇到外键约束错误，可以临时禁用：

```sql
SET FOREIGN_KEY_CHECKS = 0;
-- 执行迁移SQL
SET FOREIGN_KEY_CHECKS = 1;
```

### 问题2: 表不存在

确保已经运行了所有迁移：

```bash
python manage.py showmigrations
python manage.py migrate --fake-initial
```

### 问题3: 数据重复

如果重复执行迁移，脚本会自动跳过已存在的记录。

## 📱 前端更新

迁移完成后，前端API路径已自动更新：

- 菜单API: `/api/core/` → `/api/menus/`
- 订单API: `/api/core/` → `/api/orders/`
- 主题API: 保持 `/api/core/theme/`

## ✅ 验证清单

- [ ] 用户模型更新完成（解绑优化）
- [ ] 新应用数据库表创建成功
- [ ] 数据迁移完成，无错误
- [ ] 新API端点正常响应
- [ ] 前端功能正常工作
- [ ] 旧表清理完成（可选）

## 🆘 需要帮助？

如果遇到问题，请检查：

1. Django迁移状态: `python manage.py showmigrations`
2. 数据库连接: 确保数据库配置正确
3. 权限问题: 确保数据库用户有足够权限
4. 日志信息: 查看Django和数据库日志

---

**重要提醒**: 在生产环境执行前，请务必备份数据库！

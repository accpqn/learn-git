-- 手动添加用户头像和个人简介字段
-- 请在MySQL数据库中执行此SQL

-- 添加头像字段
ALTER TABLE users_user ADD COLUMN avatar VARCHAR(100) NULL;

-- 添加个人简介字段  
ALTER TABLE users_user ADD COLUMN bio TEXT NULL;

-- 查看表结构确认字段已添加
DESCRIBE users_user;

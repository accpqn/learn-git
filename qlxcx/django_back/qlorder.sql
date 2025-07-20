/*
 Navicat Premium Data Transfer

 Source Server         : acc
 Source Server Type    : MySQL
 Source Server Version : 80019
 Source Host           : localhost:3306
 Source Schema         : qlorder

 Target Server Type    : MySQL
 Target Server Version : 80019
 File Encoding         : 65001

 Date: 20/06/2025 10:16:56
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for auth_group
-- ----------------------------
DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE `auth_group`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of auth_group
-- ----------------------------
INSERT INTO `auth_group` VALUES (2, '内容管理员');

-- ----------------------------
-- Table structure for auth_group_permissions
-- ----------------------------
DROP TABLE IF EXISTS `auth_group_permissions`;
CREATE TABLE `auth_group_permissions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `auth_group_permissions_group_id_permission_id_0cd325b0_uniq`(`group_id` ASC, `permission_id` ASC) USING BTREE,
  INDEX `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of auth_group_permissions
-- ----------------------------
INSERT INTO `auth_group_permissions` VALUES (6, 2, 24);
INSERT INTO `auth_group_permissions` VALUES (7, 2, 25);
INSERT INTO `auth_group_permissions` VALUES (8, 2, 26);
INSERT INTO `auth_group_permissions` VALUES (9, 2, 27);
INSERT INTO `auth_group_permissions` VALUES (10, 2, 28);

-- ----------------------------
-- Table structure for auth_permission
-- ----------------------------
DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE `auth_permission`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `auth_permission_content_type_id_codename_01ab375a_uniq`(`content_type_id` ASC, `codename` ASC) USING BTREE,
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 64 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of auth_permission
-- ----------------------------
INSERT INTO `auth_permission` VALUES (1, 'Can add log entry', 1, 'add_logentry');
INSERT INTO `auth_permission` VALUES (2, 'Can change log entry', 1, 'change_logentry');
INSERT INTO `auth_permission` VALUES (3, 'Can delete log entry', 1, 'delete_logentry');
INSERT INTO `auth_permission` VALUES (4, 'Can view log entry', 1, 'view_logentry');
INSERT INTO `auth_permission` VALUES (5, 'Can add permission', 2, 'add_permission');
INSERT INTO `auth_permission` VALUES (6, 'Can change permission', 2, 'change_permission');
INSERT INTO `auth_permission` VALUES (7, 'Can delete permission', 2, 'delete_permission');
INSERT INTO `auth_permission` VALUES (8, 'Can view permission', 2, 'view_permission');
INSERT INTO `auth_permission` VALUES (9, 'Can add group', 3, 'add_group');
INSERT INTO `auth_permission` VALUES (10, 'Can change group', 3, 'change_group');
INSERT INTO `auth_permission` VALUES (11, 'Can delete group', 3, 'delete_group');
INSERT INTO `auth_permission` VALUES (12, 'Can view group', 3, 'view_group');
INSERT INTO `auth_permission` VALUES (13, 'Can add content type', 4, 'add_contenttype');
INSERT INTO `auth_permission` VALUES (14, 'Can change content type', 4, 'change_contenttype');
INSERT INTO `auth_permission` VALUES (15, 'Can delete content type', 4, 'delete_contenttype');
INSERT INTO `auth_permission` VALUES (16, 'Can view content type', 4, 'view_contenttype');
INSERT INTO `auth_permission` VALUES (17, 'Can add session', 5, 'add_session');
INSERT INTO `auth_permission` VALUES (18, 'Can change session', 5, 'change_session');
INSERT INTO `auth_permission` VALUES (19, 'Can delete session', 5, 'delete_session');
INSERT INTO `auth_permission` VALUES (20, 'Can view session', 5, 'view_session');
INSERT INTO `auth_permission` VALUES (21, 'Can add 用户', 6, 'add_user');
INSERT INTO `auth_permission` VALUES (22, 'Can change 用户', 6, 'change_user');
INSERT INTO `auth_permission` VALUES (23, 'Can delete 用户', 6, 'delete_user');
INSERT INTO `auth_permission` VALUES (24, 'Can view 用户', 6, 'view_user');
INSERT INTO `auth_permission` VALUES (25, 'Can add 情侣绑定', 7, 'add_couplebinding');
INSERT INTO `auth_permission` VALUES (26, 'Can change 情侣绑定', 7, 'change_couplebinding');
INSERT INTO `auth_permission` VALUES (27, 'Can delete 情侣绑定', 7, 'delete_couplebinding');
INSERT INTO `auth_permission` VALUES (28, 'Can view 情侣绑定', 7, 'view_couplebinding');
INSERT INTO `auth_permission` VALUES (29, 'Can add 商品', 8, 'add_product');
INSERT INTO `auth_permission` VALUES (30, 'Can change 商品', 8, 'change_product');
INSERT INTO `auth_permission` VALUES (31, 'Can delete 商品', 8, 'delete_product');
INSERT INTO `auth_permission` VALUES (32, 'Can view 商品', 8, 'view_product');
INSERT INTO `auth_permission` VALUES (33, 'Can add 菜单分类', 9, 'add_menucategory');
INSERT INTO `auth_permission` VALUES (34, 'Can change 菜单分类', 9, 'change_menucategory');
INSERT INTO `auth_permission` VALUES (35, 'Can delete 菜单分类', 9, 'delete_menucategory');
INSERT INTO `auth_permission` VALUES (36, 'Can view 菜单分类', 9, 'view_menucategory');
INSERT INTO `auth_permission` VALUES (37, 'Can add 需求订单项', 10, 'add_demandorderitem');
INSERT INTO `auth_permission` VALUES (38, 'Can change 需求订单项', 10, 'change_demandorderitem');
INSERT INTO `auth_permission` VALUES (39, 'Can delete 需求订单项', 10, 'delete_demandorderitem');
INSERT INTO `auth_permission` VALUES (40, 'Can view 需求订单项', 10, 'view_demandorderitem');
INSERT INTO `auth_permission` VALUES (41, 'Can add 需求订单', 11, 'add_demandorder');
INSERT INTO `auth_permission` VALUES (42, 'Can change 需求订单', 11, 'change_demandorder');
INSERT INTO `auth_permission` VALUES (43, 'Can delete 需求订单', 11, 'delete_demandorder');
INSERT INTO `auth_permission` VALUES (44, 'Can view 需求订单', 11, 'view_demandorder');
INSERT INTO `auth_permission` VALUES (45, 'Can add 情侣主题', 12, 'add_coupletheme');
INSERT INTO `auth_permission` VALUES (46, 'Can change 情侣主题', 12, 'change_coupletheme');
INSERT INTO `auth_permission` VALUES (47, 'Can delete 情侣主题', 12, 'delete_coupletheme');
INSERT INTO `auth_permission` VALUES (48, 'Can view 情侣主题', 12, 'view_coupletheme');
INSERT INTO `auth_permission` VALUES (49, 'Can add 订单评价', 13, 'add_orderreview');
INSERT INTO `auth_permission` VALUES (50, 'Can change 订单评价', 13, 'change_orderreview');
INSERT INTO `auth_permission` VALUES (51, 'Can delete 订单评价', 13, 'delete_orderreview');
INSERT INTO `auth_permission` VALUES (52, 'Can view 订单评价', 13, 'view_orderreview');
INSERT INTO `auth_permission` VALUES (53, 'Can add 邮箱验证码', 14, 'add_emailverificationcode');
INSERT INTO `auth_permission` VALUES (54, 'Can change 邮箱验证码', 14, 'change_emailverificationcode');
INSERT INTO `auth_permission` VALUES (55, 'Can delete 邮箱验证码', 14, 'delete_emailverificationcode');
INSERT INTO `auth_permission` VALUES (56, 'Can view 邮箱验证码', 14, 'view_emailverificationcode');
INSERT INTO `auth_permission` VALUES (57, 'Can add 商品分类', 15, 'add_category');
INSERT INTO `auth_permission` VALUES (58, 'Can change 商品分类', 15, 'change_category');
INSERT INTO `auth_permission` VALUES (59, 'Can delete 商品分类', 15, 'delete_category');
INSERT INTO `auth_permission` VALUES (60, 'Can view 商品分类', 15, 'view_category');
INSERT INTO `auth_permission` VALUES (61, 'Can add 商品', 16, 'add_product');
INSERT INTO `auth_permission` VALUES (62, 'Can change 商品', 16, 'change_product');
INSERT INTO `auth_permission` VALUES (63, 'Can delete 商品', 16, 'delete_product');
INSERT INTO `auth_permission` VALUES (64, 'Can view 商品', 16, 'view_product');

-- ----------------------------
-- Table structure for core_coupletheme
-- ----------------------------
DROP TABLE IF EXISTS `core_coupletheme`;
CREATE TABLE `core_coupletheme`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `background_image` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `theme_color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `binding_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `binding_id`(`binding_id` ASC) USING BTREE,
  CONSTRAINT `core_coupletheme_binding_id_594803bf_fk_users_couplebinding_id` FOREIGN KEY (`binding_id`) REFERENCES `users_couplebinding` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of core_coupletheme
-- ----------------------------

-- ----------------------------
-- Table structure for core_demandorder
-- ----------------------------
DROP TABLE IF EXISTS `core_demandorder`;
CREATE TABLE `core_demandorder`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `total_price` decimal(10, 2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `binding_id` bigint NOT NULL,
  `creator_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `core_demandorder_binding_id_5ffd0643_fk_users_couplebinding_id`(`binding_id` ASC) USING BTREE,
  INDEX `core_demandorder_creator_id_46ae203b_fk_users_user_id`(`creator_id` ASC) USING BTREE,
  CONSTRAINT `core_demandorder_binding_id_5ffd0643_fk_users_couplebinding_id` FOREIGN KEY (`binding_id`) REFERENCES `users_couplebinding` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `core_demandorder_creator_id_46ae203b_fk_users_user_id` FOREIGN KEY (`creator_id`) REFERENCES `users_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of core_demandorder
-- ----------------------------

-- ----------------------------
-- Table structure for core_demandorderitem
-- ----------------------------
DROP TABLE IF EXISTS `core_demandorderitem`;
CREATE TABLE `core_demandorderitem`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int UNSIGNED NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `actual_price` decimal(10, 2) NULL DEFAULT NULL,
  `receiver_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `core_demandorderitem_order_id_76f88ae3_fk_core_demandorder_id`(`order_id` ASC) USING BTREE,
  INDEX `core_demandorderitem_product_id_dd2437d9_fk_core_product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `core_demandorderitem_order_id_76f88ae3_fk_core_demandorder_id` FOREIGN KEY (`order_id`) REFERENCES `core_demandorder` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `core_demandorderitem_product_id_dd2437d9_fk_core_product_id` FOREIGN KEY (`product_id`) REFERENCES `core_product` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `core_demandorderitem_chk_1` CHECK (`quantity` >= 0)
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of core_demandorderitem
-- ----------------------------

-- ----------------------------
-- Table structure for core_menucategory
-- ----------------------------
DROP TABLE IF EXISTS `core_menucategory`;
CREATE TABLE `core_menucategory`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `binding_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `core_menucategory_binding_id_3f7933af_fk_users_couplebinding_id`(`binding_id` ASC) USING BTREE,
  CONSTRAINT `core_menucategory_binding_id_3f7933af_fk_users_couplebinding_id` FOREIGN KEY (`binding_id`) REFERENCES `users_couplebinding` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of core_menucategory
-- ----------------------------
INSERT INTO `core_menucategory` VALUES (5, '水果', '水果描述', '2025-06-19 10:44:07.322564', '2025-06-19 10:44:07.322564', 3);

-- ----------------------------
-- Table structure for core_orderreview
-- ----------------------------
DROP TABLE IF EXISTS `core_orderreview`;
CREATE TABLE `core_orderreview`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rating` smallint UNSIGNED NOT NULL,
  `comment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `created_at` datetime(6) NOT NULL,
  `creator_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `order_id`(`order_id` ASC) USING BTREE,
  UNIQUE INDEX `core_orderreview_order_id_creator_id_f46c20e3_uniq`(`order_id` ASC, `creator_id` ASC) USING BTREE,
  INDEX `core_orderreview_creator_id_db1c3301_fk_users_user_id`(`creator_id` ASC) USING BTREE,
  CONSTRAINT `core_orderreview_creator_id_db1c3301_fk_users_user_id` FOREIGN KEY (`creator_id`) REFERENCES `users_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `core_orderreview_order_id_9c7614de_fk_core_demandorder_id` FOREIGN KEY (`order_id`) REFERENCES `core_demandorder` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `core_orderreview_chk_1` CHECK (`rating` >= 0)
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of core_orderreview
-- ----------------------------

-- ----------------------------
-- Table structure for core_product
-- ----------------------------
DROP TABLE IF EXISTS `core_product`;
CREATE TABLE `core_product`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `price` decimal(10, 2) NOT NULL,
  `image` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `core_product_category_id_b9d8ff9f_fk_core_menucategory_id`(`category_id` ASC) USING BTREE,
  CONSTRAINT `core_product_category_id_b9d8ff9f_fk_core_menucategory_id` FOREIGN KEY (`category_id`) REFERENCES `core_menucategory` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of core_product
-- ----------------------------
INSERT INTO `core_product` VALUES (3, '苹果', '苹果描述', 4.00, '', 1, '2025-06-19 10:44:27.143697', '2025-06-19 10:44:27.143697', 5);

-- ----------------------------
-- Table structure for django_admin_log
-- ----------------------------
DROP TABLE IF EXISTS `django_admin_log`;
CREATE TABLE `django_admin_log`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `object_repr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `action_flag` smallint UNSIGNED NOT NULL,
  `change_message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content_type_id` int NULL DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `django_admin_log_content_type_id_c4bce8eb_fk_django_co`(`content_type_id` ASC) USING BTREE,
  INDEX `django_admin_log_user_id_c564eba6_fk_users_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `django_admin_log_chk_1` CHECK (`action_flag` >= 0)
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of django_admin_log
-- ----------------------------
INSERT INTO `django_admin_log` VALUES (1, '2025-06-18 09:14:16.813757', '5', 'scc', 1, '[{\"added\": {}}]', 6, 4);
INSERT INTO `django_admin_log` VALUES (2, '2025-06-18 09:15:46.303953', '5', 'scc', 2, '[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Email address\", \"Staff status\", \"Last login\"]}}]', 6, 4);
INSERT INTO `django_admin_log` VALUES (3, '2025-06-18 09:27:53.357547', '1', 'scc -> admin_demo (请求中)', 1, '[{\"added\": {}}]', 7, 4);
INSERT INTO `django_admin_log` VALUES (4, '2025-06-18 09:30:42.919716', '1', 'scc -> admin_demo (绑定成功)', 2, '[{\"changed\": {\"fields\": [\"\\u7ed1\\u5b9a\\u72b6\\u6001\"]}}]', 7, 4);
INSERT INTO `django_admin_log` VALUES (5, '2025-06-18 09:34:46.092465', '5', 'scc', 2, '[]', 6, 4);
INSERT INTO `django_admin_log` VALUES (6, '2025-06-19 04:16:57.617994', '5', 'scc', 3, '', 6, 4);
INSERT INTO `django_admin_log` VALUES (7, '2025-06-19 04:45:26.578542', '6', 'testuser', 3, '', 6, 4);
INSERT INTO `django_admin_log` VALUES (8, '2025-06-19 04:49:24.402961', '7', '2135444266', 3, '', 6, 4);
INSERT INTO `django_admin_log` VALUES (9, '2025-06-19 10:37:44.683519', '2', '2135444266 -> admin_demo (绑定成功)', 1, '[{\"added\": {}}]', 7, 4);
INSERT INTO `django_admin_log` VALUES (10, '2025-06-19 10:38:47.130391', '1', '奶茶', 1, '[{\"added\": {}}]', 9, 4);
INSERT INTO `django_admin_log` VALUES (11, '2025-06-19 10:39:08.910413', '2', '山东菜', 1, '[{\"added\": {}}]', 9, 4);
INSERT INTO `django_admin_log` VALUES (12, '2025-06-19 10:39:23.684950', '3', '湖南菜', 1, '[{\"added\": {}}]', 9, 4);
INSERT INTO `django_admin_log` VALUES (13, '2025-06-19 10:39:38.900083', '4', '甜品', 1, '[{\"added\": {}}]', 9, 4);
INSERT INTO `django_admin_log` VALUES (14, '2025-06-19 10:40:24.674095', '1', '柠檬水', 1, '[{\"added\": {}}]', 8, 4);
INSERT INTO `django_admin_log` VALUES (15, '2025-06-19 10:40:56.846179', '2', '拔丝地瓜', 1, '[{\"added\": {}}]', 8, 4);
INSERT INTO `django_admin_log` VALUES (16, '2025-06-19 10:43:11.756665', '9', 'acc2', 1, '[{\"added\": {}}]', 6, 4);
INSERT INTO `django_admin_log` VALUES (17, '2025-06-19 10:43:28.060332', '9', 'acc2', 2, '[{\"changed\": {\"fields\": [\"\\u90ae\\u7bb1\\u5730\\u5740\"]}}]', 6, 4);
INSERT INTO `django_admin_log` VALUES (18, '2025-06-19 10:43:43.251739', '3', 'acc2 -> user_demo (绑定成功)', 1, '[{\"added\": {}}]', 7, 4);
INSERT INTO `django_admin_log` VALUES (19, '2025-06-19 10:44:07.323848', '5', '水果', 1, '[{\"added\": {}}]', 9, 4);
INSERT INTO `django_admin_log` VALUES (20, '2025-06-19 10:44:27.144698', '3', '苹果', 1, '[{\"added\": {}}]', 8, 4);
INSERT INTO `django_admin_log` VALUES (21, '2025-06-20 01:44:53.201250', '4', '2135444266 -> acceuan (绑定成功)', 1, '[{\"added\": {}}]', 7, 4);

-- ----------------------------
-- Table structure for django_content_type
-- ----------------------------
DROP TABLE IF EXISTS `django_content_type`;
CREATE TABLE `django_content_type`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `django_content_type_app_label_model_76bd3d3b_uniq`(`app_label` ASC, `model` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of django_content_type
-- ----------------------------
INSERT INTO `django_content_type` VALUES (1, 'admin', 'logentry');
INSERT INTO `django_content_type` VALUES (3, 'auth', 'group');
INSERT INTO `django_content_type` VALUES (2, 'auth', 'permission');
INSERT INTO `django_content_type` VALUES (4, 'contenttypes', 'contenttype');
INSERT INTO `django_content_type` VALUES (12, 'core', 'coupletheme');
INSERT INTO `django_content_type` VALUES (11, 'core', 'demandorder');
INSERT INTO `django_content_type` VALUES (10, 'core', 'demandorderitem');
INSERT INTO `django_content_type` VALUES (9, 'core', 'menucategory');
INSERT INTO `django_content_type` VALUES (13, 'core', 'orderreview');
INSERT INTO `django_content_type` VALUES (8, 'core', 'product');
INSERT INTO `django_content_type` VALUES (15, 'products', 'category');
INSERT INTO `django_content_type` VALUES (16, 'products', 'product');
INSERT INTO `django_content_type` VALUES (5, 'sessions', 'session');
INSERT INTO `django_content_type` VALUES (7, 'users', 'couplebinding');
INSERT INTO `django_content_type` VALUES (14, 'users', 'emailverificationcode');
INSERT INTO `django_content_type` VALUES (6, 'users', 'user');

-- ----------------------------
-- Table structure for django_migrations
-- ----------------------------
DROP TABLE IF EXISTS `django_migrations`;
CREATE TABLE `django_migrations`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of django_migrations
-- ----------------------------
INSERT INTO `django_migrations` VALUES (1, 'contenttypes', '0001_initial', '2025-06-18 08:41:20.171122');
INSERT INTO `django_migrations` VALUES (2, 'contenttypes', '0002_remove_content_type_name', '2025-06-18 08:41:20.352056');
INSERT INTO `django_migrations` VALUES (3, 'auth', '0001_initial', '2025-06-18 08:41:20.797340');
INSERT INTO `django_migrations` VALUES (4, 'auth', '0002_alter_permission_name_max_length', '2025-06-18 08:41:20.890501');
INSERT INTO `django_migrations` VALUES (5, 'auth', '0003_alter_user_email_max_length', '2025-06-18 08:41:20.896795');
INSERT INTO `django_migrations` VALUES (6, 'auth', '0004_alter_user_username_opts', '2025-06-18 08:41:20.904059');
INSERT INTO `django_migrations` VALUES (7, 'auth', '0005_alter_user_last_login_null', '2025-06-18 08:41:20.910304');
INSERT INTO `django_migrations` VALUES (8, 'auth', '0006_require_contenttypes_0002', '2025-06-18 08:41:20.916165');
INSERT INTO `django_migrations` VALUES (9, 'auth', '0007_alter_validators_add_error_messages', '2025-06-18 08:41:20.923574');
INSERT INTO `django_migrations` VALUES (10, 'auth', '0008_alter_user_username_max_length', '2025-06-18 08:41:20.930191');
INSERT INTO `django_migrations` VALUES (11, 'auth', '0009_alter_user_last_name_max_length', '2025-06-18 08:41:20.936647');
INSERT INTO `django_migrations` VALUES (12, 'auth', '0010_alter_group_name_max_length', '2025-06-18 08:41:20.952699');
INSERT INTO `django_migrations` VALUES (13, 'auth', '0011_update_proxy_permissions', '2025-06-18 08:41:20.960658');
INSERT INTO `django_migrations` VALUES (14, 'auth', '0012_alter_user_first_name_max_length', '2025-06-18 08:41:20.967191');
INSERT INTO `django_migrations` VALUES (15, 'users', '0001_initial', '2025-06-18 08:41:21.671515');
INSERT INTO `django_migrations` VALUES (16, 'admin', '0001_initial', '2025-06-18 08:41:21.867268');
INSERT INTO `django_migrations` VALUES (17, 'admin', '0002_logentry_remove_auto_add', '2025-06-18 08:41:21.873659');
INSERT INTO `django_migrations` VALUES (18, 'admin', '0003_logentry_add_action_flag_choices', '2025-06-18 08:41:21.884112');
INSERT INTO `django_migrations` VALUES (19, 'sessions', '0001_initial', '2025-06-18 08:41:21.941249');
INSERT INTO `django_migrations` VALUES (20, 'users', '0002_populate_groups', '2025-06-18 09:03:30.943417');
INSERT INTO `django_migrations` VALUES (21, 'users', '0003_populate_groups', '2025-06-18 09:03:30.950383');
INSERT INTO `django_migrations` VALUES (22, 'core', '0001_initial', '2025-06-18 09:47:11.079479');
INSERT INTO `django_migrations` VALUES (23, 'core', '0002_demandorderitem_actual_price_and_more', '2025-06-19 01:43:01.553714');
INSERT INTO `django_migrations` VALUES (24, 'users', '0004_emailverificationcode', '2025-06-19 03:48:55.552339');
INSERT INTO `django_migrations` VALUES (25, 'products', '0001_initial', '2025-06-19 08:30:58.770674');

-- ----------------------------
-- Table structure for django_session
-- ----------------------------
DROP TABLE IF EXISTS `django_session`;
CREATE TABLE `django_session`  (
  `session_key` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `session_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`) USING BTREE,
  INDEX `django_session_expire_date_a5c62663`(`expire_date` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of django_session
-- ----------------------------
INSERT INTO `django_session` VALUES ('2qomo5a5efudrputg8pz06sfm2262zzo', '.eJxVjMsOwiAQRf-FtSGWoTxcuvcbCMMMUjWQlHZl_HfbpAvd3nPOfYsQ16WEtfMcJhIXocXpd8OYnlx3QI9Y702mVpd5Qrkr8qBd3hrx63q4fwcl9rLVNisfvcHsEDWgpbN1xuqUtVJgLIykyBEMKTKjQe03MQOnEQaTHLD4fAHrxThL:1uRolV:6QDLz-DX10DslLoybgQd31FZCKd-xiITKTo9cB_t4mk', '2025-07-02 09:07:29.984479');
INSERT INTO `django_session` VALUES ('cr1qro24du0qc5ko57e4tglu715wuau8', '.eJxVjMsOwiAQRf-FtSGWoTxcuvcbCMMMUjWQlHZl_HfbpAvd3nPOfYsQ16WEtfMcJhIXocXpd8OYnlx3QI9Y702mVpd5Qrkr8qBd3hrx63q4fwcl9rLVNisfvcHsEDWgpbN1xuqUtVJgLIykyBEMKTKjQe03MQOnEQaTHLD4fAHrxThL:1uSQno:vc2nOeanUD5ytwQ00WzrZED4THMbZXWNBh9jm3v_3vM', '2025-07-04 01:44:24.679573');

-- ----------------------------
-- Table structure for products_category
-- ----------------------------
DROP TABLE IF EXISTS `products_category`;
CREATE TABLE `products_category`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `owner_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `products_category_name_owner_id_0c54f06e_uniq`(`name` ASC, `owner_id` ASC) USING BTREE,
  INDEX `products_category_owner_id_e41a2488_fk_users_user_id`(`owner_id` ASC) USING BTREE,
  CONSTRAINT `products_category_owner_id_e41a2488_fk_users_user_id` FOREIGN KEY (`owner_id`) REFERENCES `users_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products_category
-- ----------------------------

-- ----------------------------
-- Table structure for products_product
-- ----------------------------
DROP TABLE IF EXISTS `products_product`;
CREATE TABLE `products_product`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `image` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `price` decimal(10, 2) NOT NULL,
  `is_available` tinyint(1) NOT NULL,
  `category_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `products_product_category_id_9b594869_fk_products_category_id`(`category_id` ASC) USING BTREE,
  CONSTRAINT `products_product_category_id_9b594869_fk_products_category_id` FOREIGN KEY (`category_id`) REFERENCES `products_category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products_product
-- ----------------------------

-- ----------------------------
-- Table structure for users_couplebinding
-- ----------------------------
DROP TABLE IF EXISTS `users_couplebinding`;
CREATE TABLE `users_couplebinding`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `binding_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `receiver_id` bigint NOT NULL,
  `requester_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `requester_id`(`requester_id` ASC) USING BTREE,
  UNIQUE INDEX `users_couplebinding_requester_id_receiver_id_3ca293db_uniq`(`requester_id` ASC, `receiver_id` ASC) USING BTREE,
  UNIQUE INDEX `binding_token`(`binding_token` ASC) USING BTREE,
  INDEX `users_couplebinding_receiver_id_92533129_fk_users_user_id`(`receiver_id` ASC) USING BTREE,
  CONSTRAINT `users_couplebinding_receiver_id_92533129_fk_users_user_id` FOREIGN KEY (`receiver_id`) REFERENCES `users_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `users_couplebinding_requester_id_c153588a_fk_users_user_id` FOREIGN KEY (`requester_id`) REFERENCES `users_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users_couplebinding
-- ----------------------------
INSERT INTO `users_couplebinding` VALUES (3, 'active', NULL, '2025-06-19 10:43:43.250471', '2025-06-19 10:43:43.250471', 3, 9);
INSERT INTO `users_couplebinding` VALUES (4, 'active', NULL, '2025-06-20 01:44:53.200248', '2025-06-20 01:44:53.200248', 4, 8);

-- ----------------------------
-- Table structure for users_emailverificationcode
-- ----------------------------
DROP TABLE IF EXISTS `users_emailverificationcode`;
CREATE TABLE `users_emailverificationcode`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `code` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `is_used` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users_emailverificationcode
-- ----------------------------
INSERT INTO `users_emailverificationcode` VALUES (1, '2135444266@qq.com', '222776', '2025-06-19 04:06:34.580348', '2025-06-19 04:16:34.580348', 1);
INSERT INTO `users_emailverificationcode` VALUES (2, '2135444266@qq.com', '943730', '2025-06-19 04:28:40.472085', '2025-06-19 04:38:40.472085', 1);
INSERT INTO `users_emailverificationcode` VALUES (3, '2135444266@qq.com', '480040', '2025-06-19 04:45:57.172538', '2025-06-19 04:55:57.172538', 1);
INSERT INTO `users_emailverificationcode` VALUES (4, '2135444266@qq.com', '850707', '2025-06-19 04:48:48.220312', '2025-06-19 04:58:48.220312', 1);
INSERT INTO `users_emailverificationcode` VALUES (5, '2135444266@qq.com', '411699', '2025-06-19 05:13:58.482623', '2025-06-19 05:23:58.482623', 1);
INSERT INTO `users_emailverificationcode` VALUES (6, '2135444266@qq.com', '822346', '2025-06-19 05:17:43.861931', '2025-06-19 05:27:43.861931', 1);
INSERT INTO `users_emailverificationcode` VALUES (7, '2135444266@qq.com', '081225', '2025-06-19 05:20:12.105238', '2025-06-19 05:30:12.105238', 1);
INSERT INTO `users_emailverificationcode` VALUES (8, '2135444266@qq.com', '463945', '2025-06-19 05:51:01.194725', '2025-06-19 06:01:01.194725', 1);
INSERT INTO `users_emailverificationcode` VALUES (9, '2135444266@qq.com', '927947', '2025-06-19 05:53:32.057689', '2025-06-19 06:03:32.057689', 1);
INSERT INTO `users_emailverificationcode` VALUES (10, '1690076901@qq.com', '419757', '2025-06-19 05:54:48.858970', '2025-06-19 06:04:48.858970', 1);
INSERT INTO `users_emailverificationcode` VALUES (11, '2135444266@qq.com', '811603', '2025-06-19 06:41:07.866599', '2025-06-19 06:51:07.866599', 1);
INSERT INTO `users_emailverificationcode` VALUES (12, '2135444266@qq.com', '458018', '2025-06-20 01:40:50.435629', '2025-06-20 01:50:50.435629', 1);

-- ----------------------------
-- Table structure for users_user
-- ----------------------------
DROP TABLE IF EXISTS `users_user`;
CREATE TABLE `users_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `last_login` datetime(6) NULL DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `first_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `last_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `openid` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `openid`(`openid` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users_user
-- ----------------------------
INSERT INTO `users_user` VALUES (2, 'pbkdf2_sha256$600000$UeGh9DGNSs4kpScXKtSuMu$QN8LZ2ZRfNU4Fn/a6qkTHfk+UpWd0V6wfitLQoJ/iWA=', '2025-06-18 09:06:32.959932', 0, 'admin_demo', '', '', '', 1, 1, '2025-06-18 09:03:30.504156', NULL, '');
INSERT INTO `users_user` VALUES (3, 'pbkdf2_sha256$600000$USIWjcfmYyZfVpQYJOwjUX$+N2Kjoqbsgt+H/5OMTzSD4HScP7QLPDekBdDPAQSMjA=', NULL, 0, 'user_demo', '', '', '', 0, 1, '2025-06-18 09:03:30.722082', NULL, '');
INSERT INTO `users_user` VALUES (4, 'pbkdf2_sha256$600000$H8PshepHzi5EFUqkIdTUoT$8S3xnsGTfG0vhnB5Yqt6htW+qnDOyvrhjBeOZHf+iFc=', '2025-06-20 01:44:24.673598', 1, 'acceuan', '', '', '1690076901@qq.com', 1, 1, '2025-06-18 09:04:39.227943', NULL, '');
INSERT INTO `users_user` VALUES (8, 'pbkdf2_sha256$600000$gr3lQbXqU0aVcUMxaUz2KV$43GwEl1kS5pgvhJDYMjQQnOGHF6/W4fM4do+/lz999g=', NULL, 0, '2135444266', '', '', '2135444266@qq.com', 0, 1, '2025-06-19 05:14:20.744528', NULL, '');
INSERT INTO `users_user` VALUES (9, 'pbkdf2_sha256$600000$ZCP5eBGl5TKW0BO95PpfLS$IJ7PTxX+BrILICo/6aHXAd0DpGkrk6CEAdPbyEtwWPM=', NULL, 0, 'acc2', '', '', 'pqnokm@outlook.com', 0, 1, '2025-06-19 10:43:00.000000', NULL, '');

-- ----------------------------
-- Table structure for users_user_groups
-- ----------------------------
DROP TABLE IF EXISTS `users_user_groups`;
CREATE TABLE `users_user_groups`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_user_groups_user_id_group_id_b88eab82_uniq`(`user_id` ASC, `group_id` ASC) USING BTREE,
  INDEX `users_user_groups_group_id_9afc8d0e_fk_auth_group_id`(`group_id` ASC) USING BTREE,
  CONSTRAINT `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `users_user_groups_user_id_5f6f5a90_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users_user_groups
-- ----------------------------
INSERT INTO `users_user_groups` VALUES (1, 2, 2);

-- ----------------------------
-- Table structure for users_user_user_permissions
-- ----------------------------
DROP TABLE IF EXISTS `users_user_user_permissions`;
CREATE TABLE `users_user_user_permissions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_user_user_permissions_user_id_permission_id_43338c45_uniq`(`user_id` ASC, `permission_id` ASC) USING BTREE,
  INDEX `users_user_user_perm_permission_id_0b93982e_fk_auth_perm`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `users_user_user_permissions_user_id_20aca447_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users_user_user_permissions
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;

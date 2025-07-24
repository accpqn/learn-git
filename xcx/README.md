# 情侣点餐小程序

## 项目概述

情侣点餐小程序是一个专为情侣设计的微信小程序点餐系统，提供温馨的双人用餐体验。该项目采用前后端分离架构，用户可以通过邮箱验证码注册登录，绑定情侣关系，共同浏览菜单、下单点餐，并支持个性化主题配置。

## 技术架构

### 后端技术栈
- Django 4.2.7 - Python Web框架
- Django REST Framework - RESTful API框架
- MySQL 8.0 - 关系型数据库
- JWT认证 - 用户身份验证
- Gunicorn - WSGI HTTP服务器

### 前端技术栈
- uni-app - 跨平台开发框架
- Vue.js 3 - 前端框架
- Pinia - 状态管理
- uview-plus - UI组件库

### 部署环境
- 阿里云服务器 CentOS 7 - 操作系统
- 
## 核心功能模块

### 1. 用户认证系统

#### 邮箱验证码登录
- 无需密码，使用邮箱验证码进行注册和登录
- 验证码有效期10分钟，支持重发机制
- 自动创建用户账户，简化注册流程

#### JWT Token认证
- 使用Access Token和Refresh Token双重认证
- Token自动刷新机制，提升用户体验
- 统一的权限控制和API保护

### 2. 情侣绑定系统

#### 绑定机制
- 通过邮箱发起绑定请求
- 支持接受、拒绝、取消绑定操作
- 一对一绑定关系，确保数据隔离

#### 绑定状态管理
- requesting - 请求中
- active - 绑定成功
- rejected - 已拒绝
- unbound - 已解绑

### 3. 菜单管理系统

#### 私有菜单
- 每个情侣拥有独立的菜单系统
- 支持菜单分类管理
- 商品信息包含名称、价格、图片、描述

#### 数据隔离
- 基于情侣绑定关系的数据权限控制
- 确保不同情侣间数据完全隔离

### 4. 订单管理系统

#### 需求订单流程
- 一方发起订单需求
- 另一方接收并处理订单
- 支持订单状态跟踪和管理

#### 订单状态流转
- PENDING - 待处理
- CONFIRMED - 已确认
- ORDERED - 已下单
- COMPLETED - 已完成
- RATED - 已评价
- CANCELLED - 已取消

#### 订单评价
- 评论内容记录
- 评价后订单状态更新

### 5. 主题配置系统

#### 动态主题切换
- 基于CSS变量的主题系统
- 支持主色调、辅助色、背景色配置
- 实时预览和应用效果

#### 预设主题
- 浪漫粉色主题
- 温馨橙色主题
- 支持自定义主题创建


## 数据库设计

### 用户表 (User)
```sql
- id: 主键
- username: 用户名
- email: 邮箱地址（唯一）
- avatar: 头像文件
- bio: 个人简介
- password: 密码（加密存储）
```

### 情侣绑定表 (CoupleBinding)
```sql
- id: 主键
- requester: 发起用户
- receiver: 接收用户
- status: 绑定状态
- created_at: 创建时间
- updated_at: 更新时间
```

### 菜单分类表 (MenuCategory)
```sql
- id: 主键
- binding: 所属情侣绑定
- name: 分类名称
- description: 描述
- sort_order: 排序
```

### 商品表 (Product)
```sql
- id: 主键
- category: 所属分类
- name: 商品名称
- price: 价格
- image: 商品图片
- description: 商品描述
- is_active: 是否上架
```

### 订单表 (DemandOrder)
```sql
- id: 主键
- creator: 创建人
- binding: 所属情侣绑定
- status: 订单状态
- total_price: 总价
- notes: 备注
- created_at: 创建时间
```

### 订单项表 (DemandOrderItem)
```sql
- id: 主键
- order: 所属订单
- product: 商品
- quantity: 数量
- price: 单价
- actual_price: 实际价格
- receiver_notes: 接收方备注
```

## API接口设计

### 用户相关接口
```
POST /api/users/send-code/          # 发送验证码
POST /api/users/verify-and-login/   # 验证码登录
POST /api/users/login/              # 密码登录
GET  /api/users/me/                 # 获取用户信息
PUT  /api/users/update-profile/     # 更新用户信息
POST /api/users/upload-avatar/      # 上传头像
```

### 情侣绑定接口
```
POST /api/users/send-binding-request/    # 发起绑定请求
GET  /api/users/pending-bindings/        # 获取待处理请求
POST /api/users/{id}/respond-binding/    # 响应绑定请求
GET  /api/users/binding-info/            # 获取绑定信息
POST /api/users/{id}/unbind/             # 解除绑定
```

### 菜单管理接口
```
GET    /api/menus/categories/       # 获取菜单分类
POST   /api/menus/categories/       # 创建菜单分类
PUT    /api/menus/categories/{id}/  # 更新菜单分类
DELETE /api/menus/categories/{id}/  # 删除菜单分类

GET    /api/menus/products/         # 获取商品列表
POST   /api/menus/products/         # 创建商品
PUT    /api/menus/products/{id}/    # 更新商品
DELETE /api/menus/products/{id}/    # 删除商品
```

### 订单管理接口
```
GET  /api/orders/                   # 获取订单列表
POST /api/orders/                   # 创建订单
GET  /api/orders/sent/              # 获取发出的订单
GET  /api/orders/received/          # 获取收到的订单
PATCH /api/orders/{id}/update-status/ # 更新订单状态
POST /api/orders/{id}/add-review/   # 添加订单评价
```

### 主题配置接口
```
GET   /api/core/themes/             # 获取主题配置
PATCH /api/core/themes/             # 更新主题配置
```

## 前端架构设计

### 状态管理 (Pinia)
```javascript
// 用户状态
userStore: {
  userInfo,      // 用户信息
  token,         // 认证令牌
  isLoggedIn     // 登录状态
}

// 主题状态
themeStore: {
  currentTheme,  // 当前主题
  presetThemes,  // 预设主题
  cssVariables   // CSS变量
}

// 购物车状态
cartStore: {
  items,         // 购物车商品
  totalItems,    // 商品总数
  totalPrice     // 总价格
}

// 情侣状态
coupleStore: {
  bindingInfo,   // 绑定信息
  partnerInfo    // 伴侣信息
}
```

### 组件化设计
```
components/
├── ProductItem.vue      # 商品项组件
├── OrderCard.vue        # 订单卡片组件
├── ColorPicker.vue      # 颜色选择器
└── QuickMenuAccess.vue  # 快捷菜单访问
```

### 页面路由
```
pages/
├── home/               # 首页
├── ordering/           # 点餐页
├── order/              # 订单管理
├── user/               # 用户中心
├── settings/           # 设置页面
└── public/             # 公共页面（登录等）
```

## 部署架构

### 自动化部署
```bash
# 部署脚本
./deploy.sh     # 一键部署
./start.sh      # 启动服务
./stop.sh       # 停止服务
./status.sh     # 检查状态
./restart.sh    # 重启服务
```

## 安全特性

### 认证安全
- JWT Token双重认证机制
- Token自动刷新和过期处理
- 邮箱验证码防暴力破解

### 数据安全
- 基于绑定关系的数据隔离
- SQL注入防护
- XSS攻击防护
- CSRF保护

### 传输安全
- HTTPS加密传输
- CORS跨域配置
- 安全头设置

## 性能优化

### 后端优化
- 数据库查询优化
- 静态文件CDN加速
- Gunicorn多进程部署
- 数据库连接池

### 前端优化
- 图片懒加载
- 组件按需加载
- 本地存储缓存
- 请求防抖处理

## 项目特色

### 业务创新
- 专为情侣设计的点餐场景
- 双人协同的订单处理流程
- 个性化主题配置系统
- 私有化菜单管理

### 技术亮点
- 现代化的前后端分离架构
- 基于JWT的无状态认证
- 动态主题系统实现
- 跨平台兼容性处理

### 用户体验
- 无密码邮箱验证登录
- 直观的情侣绑定流程
- 流畅的主题切换体验
- 温馨的视觉设计风格

## 扩展规划

### 功能扩展
- 实时聊天功能
- 智能推荐算法
- 社交分享功能
- 第三方支付集成

### 技术升级
- 微服务架构改造
- Redis缓存系统
- 容器化部署
- 监控告警系统

## 项目结构

```
project/
├── django_back2/           # Django后端
│   ├── users/             # 用户模块
│   ├── menus/             # 菜单模块
│   ├── orders/            # 订单模块
│   ├── core/              # 核心功能模块
│   ├── djangoProject/     # 项目配置
│   ├── media/             # 媒体文件
│   ├── templates/         # 邮件模板
│   ├── requirements.txt   # Python依赖
│   ├── deploy.sh          # 部署脚本
│   ├── start.sh           # 启动脚本
│   └── manage.py          # Django管理脚本
└── uniapp_front/          # uni-app前端
    ├── pages/             # 页面文件
    ├── components/        # 组件文件
    ├── store/             # 状态管理
    ├── api/               # API接口
    ├── utils/             # 工具函数
    ├── static/            # 静态资源
    ├── package.json       # 前端依赖
    └── manifest.json      # 应用配置
```
## 快速体验
### 小程序前端已经上传微信小程序开发平台
### 后端已部署到云服务器
### 此二维码仅小程序体验版扫码体验请备注来意

![图片描述](http://euans.xyz/uploads/album/photos/09c0da3f-fcb4-493a-a936-323f97f5b407.jpg)
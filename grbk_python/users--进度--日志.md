# 用户模块  
  
## 当前存在的问题  
- 7.26----  
- 接口能跑通但是个别存在问题  
- 注册和登录接口返回的两个token不一致，不知道正不正常  
- 更新资料接口仅仅测试邮箱和简介字段，不知道修改邮箱合不合理  
- 没有测试登出之后的token是否可用  
- 还有就是返回格式不一致问题  
- 头像上传之后数据库的字段没有更新
- 用户登录之后，数据库表的最后登录字段没有更新

## 功能  
- 用户注册  
- 用户登录/登出  
- 用户资料管理（头像、个人简介等）  
- 密码修改  

## API接口文档  

### 1. 用户注册  
接口地址: POST /api/v1/auth/register/  
请求参数:  
{  
  "username": "string", // 用户名，必填，唯一  
  "email": "string", // 邮箱，必填，唯一  
  "password": "string", // 密码，必填，最少8位  
  "password_confirm": "string" // 确认密码，必填，需与密码一致  
}  
  
成功响应 (201):  
{  
  "message": "注册成功",  
  "user": {  
    "id": 1,  
    "username": "testuser",  
    "email": "test@example.com"  
  },  
  "tokens": {  
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",  
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."  
  }  
}  
  
失败响应 (400):  
{  
  "message": "注册失败",  
  "errors": {  
    "username": ["A user with that username already exists."],  
    "email": ["This field must be unique."],  
    "password": ["This password is too common."]  
  }  
}  
  
测试示例:  
curl -X POST http://127.0.0.1:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \  
  -d '{  
    "username": "testuser",  
    "email": "test@example.com",  
    "password": "testpassword123",  
    "password_confirm": "testpassword123"  
  }'  

### 2. 用户登录  
接口地址: POST /api/v1/auth/login/  
请求参数:  
{  
  "username": "string", // 用户名，必填  
  "password": "string" // 密码，必填  
}  
  
成功响应 (200):  
{  
  "message": "登录成功",  
  "user": {  
    "id": 1,  
    "username": "testuser",  
    "email": "test@example.com"  
  },  
  "tokens": {  
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",  
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."  
  }  
}  
  
失败响应 (401):  
{  
  "message": "用户名或密码错误"  
}  
  
测试示例:  
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \  
  -d '{  
    "username": "testuser",  
    "password": "testpassword123"  
  }'  

### 3. Token 刷新  
接口地址: POST /api/v1/auth/token/refresh/  
请求参数:  
{  
  "refresh": "string" // Refresh Token，必填  
}  
  
成功响应 (200):  
{  
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",  
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." // 如果启用了轮换  
}  
  
失败响应 (401):  
{  
  "detail": "Token is invalid or expired",  
  "code": "token_not_valid"  
}  
  
测试示例:  
curl -X POST http://127.0.0.1:8000/api/v1/auth/token/refresh/ \
  -H "Content-Type: application/json" \  
  -d '{  
    "refresh": "your_refresh_token_here"  
  }'  
  
注意: 以下所有接口都需要在请求头中包含有效的 Access Token  

### 4. 获取用户资料  
接口地址: GET /api/v1/profile/  
权限: 需要认证  
请求头: Authorization: Bearer <access_token>  
  
成功响应 (200):  
{  
  "message": "获取用户资料成功",  
  "user": {  
    "id": 1,  
    "username": "testuser",  
    "email": "test@example.com",  
    "avatar": null,  
    "avatar_url": null,  
    "bio": "这是我的个人简介",  
    "date_joined": "2025-07-26T07:42:39.508828Z",  
    "last_login": "2025-07-26T08:30:15.123456Z"  
  }  
}  
  
未认证响应 (401):  
{  
  "detail": "Authentication credentials were not provided."  
}  
  
测试示例:  
curl -X GET http://127.0.0.1:8000/api/v1/profile/ \
  -H "Authorization: Bearer your_access_token_here"  

### 5. 更新用户资料  
接口地址: PUT /api/v1/profile/update/  
权限: 需要认证  
请求头: Authorization: Bearer <access_token>, Content-Type: application/json  
请求参数:  
{  
  "email": "string", // 邮箱，可选  
  "bio": "string" // 个人简介，可选  
}  
  
成功响应 (200):  
{  
  "message": "资料更新成功",  
  "user": {  
    "id": 1,  
    "username": "testuser",  
    "email": "updated@example.com",  
    "avatar": null,  
    "avatar_url": null,  
    "bio": "更新后的个人简介",  
    "date_joined": "2025-07-26T07:42:39.508828Z",  
    "last_login": null  
  }  
}  
  
失败响应 (400):  
{  
  "message": "资料更新失败",  
  "errors": {  
    "email": ["This field must be unique."]  
  }  
}  
  
测试示例:  
curl -X PUT http://127.0.0.1:8000/api/v1/profile/update/ \
  -H "Content-Type: application/json" \  
  -H "Authorization: Bearer your_access_token_here" \  
  -d '{  
    "email": "updated@example.com",  
    "bio": "这是更新后的个人简介"  
  }'  

### 6. 头像上传  
接口地址: PUT /api/v1/profile/update/  
权限: 需要认证  
请求头: Authorization: Bearer <access_token>, Content-Type: multipart/form-data  
请求参数 (表单数据):  
- email: 邮箱 (可选)  
- bio: 个人简介 (可选)  
- avatar: 图片文件 (可选，支持 jpg, png, gif)  
  
成功响应 (200):  
{  
  "message": "资料更新成功",  
  "user": {  
    "id": 1,  
    "username": "testuser",  
    "email": "test@example.com",  
    "avatar": "avatars/testuser_avatar.jpg",  
    "avatar_url": "http://127.0.0.1:8000/media/avatars/testuser_avatar.jpg",  
    "bio": "个人简介",  
    "date_joined": "2025-07-26T07:42:39.508828Z",  
    "last_login": null  
  }  
}  
  
测试示例:  
curl -X PUT http://127.0.0.1:8000/api/v1/profile/update/ \
  -H "Authorization: Bearer your_access_token_here" \  
  -F "email=test@example.com" \  
  -F "bio=新的个人简介" \  
  -F "avatar=@/path/to/your/image.jpg"  

### 7. 修改密码  
接口地址: POST /api/v1/password/change/  
权限: 需要认证  
请求头: Authorization: Bearer <access_token>, Content-Type: application/json  
请求参数:  
{  
  "old_password": "string", // 当前密码，必填  
  "new_password": "string", // 新密码，必填  
  "new_password_confirm": "string" // 确认新密码，必填  
}  
  
成功响应 (200):  
{  
  "message": "密码修改成功"  
}  
  
失败响应 (400):  
{  
  "message": "密码修改失败",  
  "errors": {  
    "old_password": ["当前密码不正确"],  
    "new_password": ["两次输入的新密码不一致"]  
  }  
}  
  
测试示例:  
curl -X POST http://127.0.0.1:8000/api/v1/password/change/ \
  -H "Content-Type: application/json" \  
  -H "Authorization: Bearer your_access_token_here" \  
  -d '{  
    "old_password": "oldpassword123",  
    "new_password": "newpassword456",  
    "new_password_confirm": "newpassword456"  
  }'  

### 8. 获取用户信息  
接口地址: GET /api/v1/info/  
权限: 需要认证  
请求头: Authorization: Bearer <access_token>  
  
成功响应 (200):  
{  
  "id": 1,  
  "username": "testuser",  
  "email": "test@example.com",  
  "avatar": "http://127.0.0.1:8000/media/avatars/testuser_avatar.jpg",  
  "bio": "个人简介",  
  "date_joined": "2025-07-26T07:42:39.508828Z"  
}  
  
测试示例:  
curl -X GET http://127.0.0.1:8000/api/v1/info/ \
  -H "Authorization: Bearer your_access_token_here"  

### 9. 用户登出  
接口地址: POST /api/v1/auth/logout/  
权限: 需要认证  
请求头: Authorization: Bearer <access_token>, Content-Type: application/json  
请求参数:  
{  
  "refresh": "string" // Refresh Token，必填  
}  
  
成功响应 (200):  
{  
  "message": "登出成功"  
}  
  
失败响应 (400):  
{  
  "message": "登出失败: Token is invalid or expired"  
}  
  
测试示例:  
curl -X POST http://127.0.0.1:8000/api/v1/auth/logout/ \
  -H "Content-Type: application/json" \  
  -H "Authorization: Bearer your_access_token_here" \  
  -d '{  
    "refresh": "your_refresh_token_here"  
  }'
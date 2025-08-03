# 文章模块  
  
## 当前存在的问题  
- 7.29----  
- [x] 已解决：中文标题无法生成有效 slug 的问题（使用 pypinyin 库）
- [x] 已解决：可以重复创建相同标题的文章问题（添加标题唯一性验证）
- [x] 已解决：用户可以手动修改 slug 字段问题（移除 slug 字段的手动设置）
- [x] 已解决：创建/更新文章返回数据过多问题（使用简化序列化器）

- 7.30----
- [ ] 需要添加：文章分类和标签功能
- [ ] git_articale_list虽然可以根据status筛选，但是针对admin后台没有一种接口获取所有的文章
- [ ] 文章内容没有使用大数据量测试
## 功能  
- 文章创建
- 文章列表查看（支持状态过滤、搜索、作者过滤）
- 文章详情查看
- 文章更新（仅作者可编辑）
- 文章删除（仅作者可删除）
- 文章状态管理（草稿/已发布）
- 文章统计信息
## API接口文档  

### 1. 文章列表  
接口地址: GET /api/v1/articles/  
权限: 无需认证（仅显示已发布文章），认证用户可查看所有状态文章  
请求参数 (Query Parameters):  
- status: 文章状态过滤 (published/draft)，默认 published  
- search: 搜索关键词（标题、内容、摘要）  
- author: 作者用户名过滤  

成功响应 (200):  
{  
  "message": "获取文章列表成功",  
  "count": 10,  
  "articles": [  
    {  
      "id": 1,  
      "title": "Python 编程入门",  
      "slug": "python-bian-cheng-ru-men",  
      "summary": "这是一篇关于 Python 编程的入门教程",  
      "author": {  
        "id": 1,  
        "username": "testuser",  
        "email": "test@example.com"  
      },  
      "status": "published",  
      "view_count": 100,  
      "created_at": "2025-07-29T10:00:00Z",  
      "updated_at": "2025-07-29T10:00:00Z",  
      "published_at": "2025-07-29T10:00:00Z"  
    }  
  ]  
}  

测试示例:  
curl -X GET "http://127.0.0.1:8000/api/v1/articles/"  


### 2. 文章详情  
接口地址: GET /api/v1/articles/<slug>/  
权限: 无需认证（仅已发布文章），认证用户可查看自己的草稿  

成功响应 (200):  
{  
  "message": "获取文章详情成功",  
  "article": {  
    "id": 22,  
    "title": "7-30日everyday测试2",  
    "slug": "7-30-ri-everyday-ce-shi-2",  
    "summary": "测试summary",  
    "content": "文章管理：创建、编辑、删除、发布文章分类系统：文章分类管理标签系统：文章标签功能文章状态：草稿、发布、归档SEO 优化：URL slug、meta 描述阅读统计：浏览量统计评论统文章评论功能（可选",  
    "author": {  
      "id": 10,  
      "username": "test3",  
      "email": "test3@example.com"  
    },  
    "status": "published",  
    "view_count": 1,  
    "created_at": "2025-07-30T13:38:08.767102Z",  
    "updated_at": "2025-07-30T13:40:06.057179Z",  
    "published_at": "2025-07-30T13:40:06.057179Z"  
  }  
}  

失败响应 (404):  
{  
  "message": "文章不存在"  
}  

测试示例:  
curl -X GET "http://127.0.0.1:8000/api/v1/articles/7-30-ri-everyday-ce-shi-2/"  

### 3. 创建文章  
接口地址: POST /api/v1/articles/create/  
权限: 需要认证  
请求头: Authorization: Bearer <access_token>, Content-Type: application/json  
请求参数:  
{  
  "title": "string", // 文章标题，必填，最少5个字符，不能重复  
  "summary": "string", // 文章摘要，可选  
  "content": "string", // 文章内容，必填，最少5个字符  
  "status": "string" // 文章状态，可选，默认 draft (draft/published)  
}  

成功响应 (201):  
{  
  "message": "文章创建成功",  
  "article": {  
    "id": 22,  
    "title": "7-30日everyday测试2",  
    "slug": "7-30-ri-everyday-ce-shi-2",  
    "author": {  
      "id": 10,  
      "username": "test3",  
      "email": "test3@example.com"  
    },  
    "status": "published",  
    "created_at": "2025-07-30T13:38:08.767102Z",  
    "updated_at": "2025-07-30T13:38:08.767102Z"  
  }  
}  

失败响应 (400):  
{  
  "message": "文章创建失败",  
  "errors": {  
    "title": ["文章标题已存在，请使用不同的标题"],  
    "content": ["文章内容至少需要5个字符"]  
  }  
}  

测试示例:  
curl -X POST "http://127.0.0.1:8000/api/v1/articles/create/" \
  -H "Content-Type: application/json" \  
  -H "Authorization: Bearer your_access_token_here" \  
  -d '{  
    "title": "Django REST API 开发指南",  
    "summary": "详细介绍如何使用 Django REST Framework 开发 API",  
    "content": "在这篇文章中，我们将学习如何使用 Django REST Framework...",  
    "status": "draft"  
  }'  
 

### 4. 更新文章  
接口地址: PUT /api/v1/articles/<slug>/update/  
权限: 需要认证，仅作者可编辑  
请求头: Authorization: Bearer <access_token>, Content-Type: application/json  
请求参数:  
{  
  "title": "string", // 文章标题，可选  
  "summary": "string", // 文章摘要，可选  
  "content": "string", // 文章内容，可选  
  "status": "string" // 文章状态，可选 (draft/published)  
}  

成功响应 (200):  
{  
  "message": "文章更新成功",  
  "article": {  
    "id": 22,  
    "title": "7-30日everyday测试2",  
    "slug": "7-30-ri-everyday-ce-shi-2",  
    "author": {  
      "id": 10,  
      "username": "test3",  
      "email": "test3@example.com"  
    },  
    "status": "published",  
    "created_at": "2025-07-30T13:38:08.767102Z",  
    "updated_at": "2025-07-30T13:50:25.640727Z"  
  }  
}  

失败响应 (403):  
{  
  "message": "您只能编辑自己的文章"  
}  

失败响应 (404):  
{  
  "message": "文章不存在"  
}  

测试示例:  
curl -X PUT "http://127.0.0.1:8000/api/v1/articles/wo-de-xin-wen-zhang/update/" \
  -H "Content-Type: application/json" \  
  -H "Authorization: Bearer your_access_token_here" \  
  -d '{  
    "title": "更新后的文章标题",  
    "status": "published"  
  }'  


### 5. 删除文章  
接口地址: DELETE /api/v1/articles/<slug>/delete/  
权限: 需要认证，仅作者可删除  
请求头: Authorization: Bearer <access_token>  

成功响应 (200):  
{  
  "message": "文章《我的文章标题》删除成功"  
}  

失败响应 (403):  
{  
  "message": "您只能删除自己的文章"  
}  

失败响应 (404):  
{  
  "message": "文章不存在"  
}  

测试示例:  
curl -X DELETE "http://127.0.0.1:8000/api/v1/articles/test2/delete/" \
  -H "Authorization: Bearer your_access_token_here"  

### 6. 我的文章列表  
接口地址: GET /api/v1/articles/my/  
权限: 需要认证  
请求头: Authorization: Bearer <access_token>  

成功响应 (200):  
{  
  "message": "获取我的文章列表成功",  
  "count": 5,  
  "articles": [  
    {  
      "id": 22,  
      "title": "7-30日everyday测试2",  
      "slug": "7-30-ri-everyday-ce-shi-2",  
      "summary": "测试summary",  
      "author": {  
        "id": 10,  
        "username": "test3",  
        "email": "test3@example.com"  
      },  
      "status": "published",  
      "view_count": 0,  
      "created_at": "2025-07-30T13:38:08.767102Z",  
      "updated_at": "2025-07-30T13:38:08.767102Z",  
      "published_at": "2025-07-30T13:38:08.767102Z"  
    }  
  ]  
}  

测试示例:  
curl -X GET "http://127.0.0.1:8000/api/v1/articles/my/" \
  -H "Authorization: Bearer your_access_token_here"  

### 7. 文章统计信息  
接口地址: GET /api/v1/articles/stats/  
权限: 无需认证（基础统计），认证用户可查看个人统计  

成功响应 (200):  
{  
  "message": "获取统计信息成功",  
  "stats": {  
    "total_articles": 50,  
    "total_drafts": 10,  
    "total_views": 1000,  
    // 以下字段仅认证用户可见  
    "my_articles": 5,  
    "my_published": 3,  
    "my_drafts": 2  
  }  
}  

测试示例:  
# 获取公开统计  
curl -X GET "http://127.0.0.1:8000/api/v1/articles/stats/"  

# 获取包含个人统计的信息  
curl -X GET "http://127.0.0.1:8000/api/v1/articles/stats/" \
  -H "Authorization: Bearer your_access_token_here"  

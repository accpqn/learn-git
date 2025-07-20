#!/usr/bin/env python
"""
项目演示脚本 - 用于答辩展示
"""
import os
import sys
import django
import requests
import json
from datetime import datetime

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoProject.settings_prod')

try:
    django.setup()
    print("✅ Django环境初始化成功")
except Exception as e:
    print(f"❌ Django环境初始化失败: {e}")
    sys.exit(1)

from users.models import User, Couple, EmailVerificationCode
from menus.models import Category, Product
from orders.models import Order, OrderItem
from django.utils import timezone

class ProjectDemo:
    def __init__(self):
        self.base_url = "https://xcx.euans.xyz/api"
        self.demo_email = "demo@example.com"
        
    def print_section(self, title):
        """打印章节标题"""
        print("\n" + "="*60)
        print(f"🎯 {title}")
        print("="*60)
    
    def demo_database_structure(self):
        """演示数据库结构"""
        self.print_section("数据库结构展示")
        
        print("📊 数据库表统计:")
        print(f"   用户数量: {User.objects.count()}")
        print(f"   情侣数量: {Couple.objects.count()}")
        print(f"   商品数量: {Product.objects.count()}")
        print(f"   订单数量: {Order.objects.count()}")
        
        print("\n📋 用户表结构:")
        if User.objects.exists():
            user = User.objects.first()
            print(f"   ID: {user.id}")
            print(f"   邮箱: {user.email}")
            print(f"   昵称: {user.nickname}")
            print(f"   情侣ID: {user.couple_id}")
            print(f"   创建时间: {user.created_at}")
        
        print("\n🍽️ 商品表结构:")
        if Product.objects.exists():
            product = Product.objects.first()
            print(f"   ID: {product.id}")
            print(f"   名称: {product.name}")
            print(f"   价格: ¥{product.price}")
            print(f"   分类: {product.category.name if product.category else '无'}")
            print(f"   是否可用: {'是' if product.is_available else '否'}")
    
    def demo_api_endpoints(self):
        """演示API接口"""
        self.print_section("API接口展示")
        
        endpoints = [
            ("POST", "/users/send-code/", "发送验证码"),
            ("POST", "/users/verify-and-login/", "验证码登录"),
            ("GET", "/users/profile/", "获取用户信息"),
            ("POST", "/users/bind-couple/", "绑定情侣"),
            ("GET", "/menus/categories/", "获取菜单分类"),
            ("GET", "/menus/products/", "获取商品列表"),
            ("POST", "/orders/", "创建订单"),
            ("GET", "/orders/", "获取订单列表"),
            ("GET", "/core/themes/", "获取主题配置"),
        ]
        
        print("🔗 API接口列表:")
        for method, endpoint, description in endpoints:
            print(f"   {method:6} {endpoint:25} - {description}")
    
    def demo_email_verification(self):
        """演示邮箱验证功能"""
        self.print_section("邮箱验证功能演示")
        
        print("📧 邮箱验证码系统:")
        print("   1. 用户输入邮箱地址")
        print("   2. 系统生成6位随机验证码")
        print("   3. 发送HTML格式的精美邮件")
        print("   4. 验证码10分钟内有效")
        print("   5. 验证成功后自动登录")
        
        # 展示验证码生成逻辑
        print("\n🔢 验证码生成示例:")
        from users.models import EmailVerificationCode
        import random
        import string
        
        demo_code = ''.join(random.choices(string.digits, k=6))
        print(f"   生成的验证码: {demo_code}")
        print(f"   有效期: 10分钟")
        print(f"   邮件模板: templates/email/verification_code.html")
    
    def demo_couple_binding(self):
        """演示情侣绑定功能"""
        self.print_section("情侣绑定功能演示")
        
        print("💕 情侣绑定流程:")
        print("   1. 用户A创建情侣账户，获得绑定码")
        print("   2. 用户B输入绑定码，加入情侣")
        print("   3. 两人共享菜单和订单数据")
        print("   4. 支持解绑和重新绑定")
        
        # 展示绑定码生成
        import random
        import string
        demo_bind_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        print(f"\n🔗 绑定码示例: {demo_bind_code}")
        
        if Couple.objects.exists():
            couple = Couple.objects.first()
            users = couple.users.all()
            print(f"\n👫 情侣示例:")
            print(f"   绑定码: {couple.bind_code}")
            print(f"   成员数量: {users.count()}")
            for i, user in enumerate(users, 1):
                print(f"   用户{i}: {user.email}")
    
    def demo_order_system(self):
        """演示订单系统"""
        self.print_section("订单系统演示")
        
        print("🛒 订单处理流程:")
        print("   1. 浏览菜单，选择商品")
        print("   2. 添加到购物车")
        print("   3. 确认订单信息")
        print("   4. 提交订单")
        print("   5. 订单状态跟踪")
        
        if Order.objects.exists():
            order = Order.objects.first()
            items = order.items.all()
            print(f"\n📋 订单示例:")
            print(f"   订单号: {order.id}")
            print(f"   用户: {order.user.email}")
            print(f"   总金额: ¥{order.total_amount}")
            print(f"   状态: {order.get_status_display()}")
            print(f"   创建时间: {order.created_at}")
            print(f"   商品数量: {items.count()}")
            
            for item in items[:3]:  # 显示前3个商品
                print(f"     - {item.product.name} x{item.quantity} = ¥{item.price * item.quantity}")
    
    def demo_theme_system(self):
        """演示主题系统"""
        self.print_section("主题系统演示")
        
        print("🎨 主题配置功能:")
        print("   1. 多种预设主题色彩")
        print("   2. 自定义主色调")
        print("   3. 实时预览效果")
        print("   4. 情侣共享主题")
        
        themes = [
            {"name": "浪漫粉", "primary": "#FF69B4", "secondary": "#FFB6C1"},
            {"name": "温馨橙", "primary": "#FF7F50", "secondary": "#FFA07A"},
            {"name": "清新绿", "primary": "#98FB98", "secondary": "#90EE90"},
            {"name": "优雅紫", "primary": "#DDA0DD", "secondary": "#E6E6FA"},
        ]
        
        print("\n🌈 预设主题:")
        for theme in themes:
            print(f"   {theme['name']}: 主色 {theme['primary']}, 辅色 {theme['secondary']}")
    
    def demo_deployment(self):
        """演示部署架构"""
        self.print_section("部署架构演示")
        
        print("🚀 部署环境:")
        print("   服务器: 阿里云ECS (CentOS 7)")
        print("   域名: xcx.euans.xyz")
        print("   SSL证书: Let's Encrypt")
        print("   Web服务器: Nginx")
        print("   应用服务器: Gunicorn")
        print("   数据库: MySQL 8.0")
        
        print("\n📁 目录结构:")
        print("   /www/wwwroot/xcx2/back/django_back2/")
        print("   ├── djangoProject/     # Django配置")
        print("   ├── users/            # 用户模块")
        print("   ├── menus/            # 菜单模块")
        print("   ├── orders/           # 订单模块")
        print("   ├── core/             # 核心模块")
        print("   ├── media/            # 媒体文件")
        print("   ├── staticfiles/      # 静态文件")
        print("   └── logs/             # 日志文件")
        
        print("\n🔧 管理脚本:")
        print("   ./deploy.sh   - 一键部署")
        print("   ./start.sh    - 启动服务")
        print("   ./stop.sh     - 停止服务")
        print("   ./status.sh   - 状态检查")
    
    def demo_security_features(self):
        """演示安全特性"""
        self.print_section("安全特性演示")
        
        print("🔒 安全措施:")
        print("   1. JWT Token认证")
        print("   2. 邮箱验证登录")
        print("   3. HTTPS加密传输")
        print("   4. CORS跨域控制")
        print("   5. SQL注入防护")
        print("   6. XSS攻击防护")
        print("   7. 数据验证和过滤")
        
        print("\n🛡️ 权限控制:")
        print("   - 用户只能访问自己的数据")
        print("   - 情侣可以共享特定数据")
        print("   - 管理员有完整权限")
        print("   - API接口权限验证")
    
    def run_full_demo(self):
        """运行完整演示"""
        print("🎭 情侣点餐小程序 - 项目演示")
        print(f"演示时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        self.demo_database_structure()
        self.demo_api_endpoints()
        self.demo_email_verification()
        self.demo_couple_binding()
        self.demo_order_system()
        self.demo_theme_system()
        self.demo_deployment()
        self.demo_security_features()
        
        print("\n" + "="*60)
        print("🎉 演示完成！")
        print("="*60)
        print("\n📝 项目特色总结:")
        print("   ✅ 完整的全栈开发")
        print("   ✅ 创新的情侣绑定机制")
        print("   ✅ 优雅的邮箱验证登录")
        print("   ✅ 美观的用户界面设计")
        print("   ✅ 稳定的服务器部署")
        print("   ✅ 完善的安全防护")
        print("\n💡 技术亮点:")
        print("   🔧 Django REST Framework")
        print("   📱 微信小程序开发")
        print("   🗄️ MySQL数据库设计")
        print("   🌐 Nginx + Gunicorn部署")
        print("   🔐 JWT + 邮箱双重认证")
        print("   📧 SMTP邮件服务集成")

def main():
    """主函数"""
    demo = ProjectDemo()
    
    print("选择演示内容:")
    print("1. 完整演示")
    print("2. 数据库结构")
    print("3. API接口")
    print("4. 邮箱验证")
    print("5. 情侣绑定")
    print("6. 订单系统")
    print("7. 主题系统")
    print("8. 部署架构")
    print("9. 安全特性")
    
    choice = input("\n请选择 (1-9): ").strip()
    
    if choice == "1":
        demo.run_full_demo()
    elif choice == "2":
        demo.demo_database_structure()
    elif choice == "3":
        demo.demo_api_endpoints()
    elif choice == "4":
        demo.demo_email_verification()
    elif choice == "5":
        demo.demo_couple_binding()
    elif choice == "6":
        demo.demo_order_system()
    elif choice == "7":
        demo.demo_theme_system()
    elif choice == "8":
        demo.demo_deployment()
    elif choice == "9":
        demo.demo_security_features()
    else:
        print("❌ 无效选择")

if __name__ == '__main__':
    main()

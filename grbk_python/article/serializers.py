from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Article

User = get_user_model()

class AuthorSerializer(serializers.ModelSerializer):
    """作者信息序列化器"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ArticleListSerializer(serializers.ModelSerializer):
    """文章列表序列化器
        用于后台展示文章的，不需要展示content，因为content内容很多影响性能
    """
    author = AuthorSerializer(read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'summary', 'author', 'status', 
            'view_count', 'created_at', 'updated_at', 'published_at'
        ]

class ArticleDetailSerializer(serializers.ModelSerializer):
    """文章详情序列化器"""
    author = AuthorSerializer(read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'summary', 'content', 'author', 
            'status', 'view_count', 'created_at', 'updated_at', 'published_at'
        ]

class ArticleCreateUpdateSerializer(serializers.ModelSerializer):
    """文章创建/更新序列化器
    
        只包含可以修改的字段，author、creat_at等日期自动生成
    """
    
    class Meta:
        model = Article
        fields = ['title', 'summary', 'content', 'status']
        # 目前暂定，slug不能手动修改
    
    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("文章标题至少需要5个字符")
        
        # 检查标题是否重复（排除当前文章）
        instance = getattr(self, 'instance', None)
        if Article.objects.filter(title=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("文章标题已存在，请使用不同的标题")
        
        return value
    
    def validate_content(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("文章内容至少需要5个字符")
        return value


class ArticleSimpleSerializer(serializers.ModelSerializer):
    """文章简化序列化器 - 用于创建/更新操作的返回"""
    author = AuthorSerializer(read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'author', 'status', 'created_at', 'updated_at'
        ]

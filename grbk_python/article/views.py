from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, F, Sum
from .models import Article
from .serializers import (
    ArticleListSerializer,
    ArticleDetailSerializer,
    ArticleCreateUpdateSerializer,
    ArticleSimpleSerializer
)


class ArticleListView(APIView):
    """文章列表视图"""
    permission_classes = [AllowAny]

    def get(self, request):
        # 获取查询参数
        status_filter = request.query_params.get('status', 'published')
        search = request.query_params.get('search', '')
        author = request.query_params.get('author', '')

        # 基础查询
        queryset = Article.objects.select_related('author')

        # 状态过滤
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # 搜索功能
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(summary__icontains=search)
            )

        # 作者过滤
        if author:
            queryset = queryset.filter(author__username__icontains=author)

        # 如果不是认证用户，只显示已发布的文章
        if not request.user.is_authenticated:
            queryset = queryset.filter(status='published')

        # 序列化数据
        serializer = ArticleListSerializer(queryset, many=True, context={'request': request})

        return Response({
            'message': '获取文章列表成功',
            'count': queryset.count(),
            'articles': serializer.data
        })


class ArticleDetailView(APIView):
    """文章详情视图"""
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            article = Article.objects.select_related('author').get(slug=slug)

            # 如果不是认证用户且文章未发布，返回404
            if not request.user.is_authenticated and article.status != 'published':
                return Response({
                    'message': '文章不存在'
                }, status=status.HTTP_404_NOT_FOUND)

            # 增加浏览量
            Article.objects.filter(pk=article.pk).update(view_count=F('view_count') + 1)

            # 重新获取文章（包含更新后的浏览量）
            article.refresh_from_db()

            serializer = ArticleDetailSerializer(article, context={'request': request})

            return Response({
                'message': '获取文章详情成功',
                'article': serializer.data
            })

        except Article.DoesNotExist:
            return Response({
                'message': '文章不存在'
            }, status=status.HTTP_404_NOT_FOUND)


class ArticleCreateView(APIView):
    """文章创建视图"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ArticleCreateUpdateSerializer(data=request.data)

        if serializer.is_valid():
            article = serializer.save(author=request.user)

            # 返回简化的文章信息
            simple_serializer = ArticleSimpleSerializer(article, context={'request': request})

            return Response({
                'message': '文章创建成功',
                'article': simple_serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'message': '文章创建失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ArticleUpdateView(APIView):
    """文章更新视图"""
    permission_classes = [IsAuthenticated]

    def put(self, request, slug):
        try:
            article = Article.objects.get(slug=slug)

            # 检查权限：只有作者可以更新自己的文章
            if article.author != request.user:
                return Response({
                    'message': '您只能编辑自己的文章'
                }, status=status.HTTP_403_FORBIDDEN)

            serializer = ArticleCreateUpdateSerializer(article, data=request.data, partial=True)

            if serializer.is_valid():
                updated_article = serializer.save()

                # 返回简化的文章信息
                simple_serializer = ArticleSimpleSerializer(updated_article, context={'request': request})

                return Response({
                    'message': '文章更新成功',
                    'article': simple_serializer.data
                })

            return Response({
                'message': '文章更新失败',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Article.DoesNotExist:
            return Response({
                'message': '文章不存在'
            }, status=status.HTTP_404_NOT_FOUND)


class ArticleDeleteView(APIView):
    """文章删除视图"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, slug):
        try:
            article = Article.objects.get(slug=slug)

            # 检查权限：只有作者可以删除自己的文章
            if article.author != request.user:
                return Response({
                    'message': '您只能删除自己的文章'
                }, status=status.HTTP_403_FORBIDDEN)

            article_title = article.title
            article.delete()

            return Response({
                'message': f'文章《{article_title}》删除成功'
            })

        except Article.DoesNotExist:
            return Response({
                'message': '文章不存在'
            }, status=status.HTTP_404_NOT_FOUND)


# 获取当前用户的文章列表
class MyArticlesView(APIView):
    """我的文章列表"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        articles = Article.objects.filter(author=request.user).order_by('-created_at')
        serializer = ArticleListSerializer(articles, many=True, context={'request': request})

        return Response({
            'message': '获取我的文章列表成功',
            'count': articles.count(),
            'articles': serializer.data
        })


# 统计信息
@api_view(['GET'])
@permission_classes([AllowAny])
def article_stats(request):
    """文章统计信息"""
    stats = {
        'total_articles': Article.objects.filter(status='published').count(),
        'total_drafts': Article.objects.filter(status='draft').count(),
        'total_views': Article.objects.filter(status='published').aggregate(
            total=Sum('view_count')
        )['total'] or 0,
    }

    # 如果是认证用户，添加个人统计
    if request.user.is_authenticated:
        stats['my_articles'] = Article.objects.filter(author=request.user).count()
        stats['my_published'] = Article.objects.filter(author=request.user, status='published').count()
        stats['my_drafts'] = Article.objects.filter(author=request.user, status='draft').count()

    return Response({
        'message': '获取统计信息成功',
        'stats': stats
    })

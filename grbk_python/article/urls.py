from django.urls import path
from . import views

app_name = 'article'

urlpatterns = [
    # 文章 CRUD
    path('articles/', views.ArticleListView.as_view(), name='article_list'),
    path('articles/create/', views.ArticleCreateView.as_view(), name='article_create'),
    path('articles/<slug:slug>/', views.ArticleDetailView.as_view(), name='article_detail'),
    path('articles/<slug:slug>/update/', views.ArticleUpdateView.as_view(), name='article_update'),
    path('articles/<slug:slug>/delete/', views.ArticleDeleteView.as_view(), name='article_delete'),

    # 我的文章
    path('my-articles/', views.MyArticlesView.as_view(), name='my_articles'),

    # 统计信息
    path('stats/', views.article_stats, name='article_stats'),
]

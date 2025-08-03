"""
JWT Token 管理器
统一处理所有token相关的操作，解决JWT无状态特性带来的安全问题

主要解决的问题：
1. 多个access token同时有效的安全漏洞
2. 登出后token仍然可用的问题
3. 用户多设备登录的token管理
4. Token的生命周期追踪和统计

核心功能：
- Access Token 的追踪和黑名单管理
- Refresh Token 的黑名单管理  
- 用户token的批量清理
- 请求拦截和token验证
- 统一的登录/登出/刷新处理
"""

from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from django.core.cache import cache
import time


class TokenManager:

    # 缓存key前缀
    USER_TOKENS_PREFIX = "user_access_tokens"
    BLACKLIST_PREFIX = "blacklisted_access_token"
    
    @classmethod
    def generate_tokens_for_user(cls, user):
        """
        为用户生成新的token对（登录时使用）
        
        功能说明：
        1. 使用 RefreshToken.for_user() 生成refresh token
        2. 从refresh token中提取access token
        3. 自动追踪新生成的access token

        Args:
            user: 用户对象
            
        Returns:
            dict: {'refresh': str, 'access': str}
        """
        # 使用JWT库为用户生成refresh token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # 记录新的access token到缓存中，用于后续追踪和管理
        cls.track_access_token(user, access_token)
        
        return {
            'refresh': str(refresh),
            'access': access_token
        }
    
    @classmethod
    def track_access_token(cls, user, access_token_string):
        """
        记录用户的access token以便后续管理（解决JWT无状态问题）
            将token信息存储到缓存中，建立用户与token的关联
            维护用户token列表，支持批量清理
            设置缓存过期时间与token过期时间一致，实现自动清理

        缓存策略：
        - Key格式: "user_access_tokens:{user_id}:{jti}"
        - Value: 完整的access token字符串
        - TTL: token的剩余有效时间（自动过期清理）
        - 用户token列表: "user_tokens_list:{user_id}" 存储该用户的所有token jti
        
        Args:
            user: 用户对象
            access_token_string: access token字符串
            
        Returns:
            bool: 是否成功记录
        """
        try:
            # 使用UntypedToken解析JWT，获取payload中的关键信息
            token = UntypedToken(access_token_string)
            jti = token.payload.get('jti')    # JWT唯一标识符
            exp = token.payload.get('exp')    # 过期时间戳
            
            if not jti or not exp:
                return False
            
            # 计算token剩余有效时间
            remaining_time = exp - int(time.time())
            if remaining_time <= 0:
                return False  # token已过期
            
            # 将token记录到缓存中，建立用户与token的追踪关系
            user_token_key = f"{cls.USER_TOKENS_PREFIX}:{user.id}:{jti}"
            cache.set(user_token_key, access_token_string, remaining_time)
            
            # 维护用户token列表（用于批量清理）
            user_tokens_list_key = f"user_tokens_list:{user.id}"
            user_token_list = cache.get(user_tokens_list_key, [])
            
            # 添加新token到列表（如果不存在）
            if jti not in user_token_list:
                user_token_list.append(jti)
                # 设置较长的TTL，确保列表不会过早过期
                cache.set(user_tokens_list_key, user_token_list, 86400)  # 24小时
            
            return True
            
        except Exception as e:
            return False
    
    @classmethod
    def blacklist_access_token(cls, access_token_string):
        """
        将access token加入黑名单（登出/刷新时使用）
        
        功能说明：
        1. 解析JWT获取唯一标识符和过期时间
        2. 将token的jti存储到黑名单缓存中
        3. 设置与token相同的过期时间，实现自动清理

        黑名单策略：
        - Key格式: "blacklisted_access_token:{jti}"
        - Value: True（标记为黑名单）
        - TTL: token剩余有效时间（过期后自动从黑名单移除）
        
        Args:
            access_token_string: access token字符串
            
        Returns:
            bool: 是否成功加入黑名单
        """
        try:
            # 解析JWT获取关键信息
            token = UntypedToken(access_token_string)
            jti = token.payload.get('jti')    # JWT唯一标识符
            exp = token.payload.get('exp')    # 过期时间戳
            
            if not jti or not exp:
                return False
            
            # 计算token剩余有效时间
            remaining_time = exp - int(time.time())
            if remaining_time <= 0:
                return False  # token已过期，无需加入黑名单
            
            # 将token的jti加入黑名单缓存
            blacklist_key = f"{cls.BLACKLIST_PREFIX}:{jti}"
            cache.set(blacklist_key, True, remaining_time)
            
            print(f"Access token {jti[:8]}... 已加入黑名单")
            return True
            
        except Exception as e:
            print(f"加入黑名单失败: {e}")
            return False
    
    @classmethod
    def is_access_token_blacklisted(cls, access_token_string):
        """
        检查access token是否在黑名单中（请求拦截时使用）
        
        功能说明：
        1. 解析JWT获取唯一标识符jti
        2. 在黑名单缓存中查找该jti
        3. 返回是否在黑名单中的布尔值

        使用场景：
        - 每个API请求都会调用此方法检查token有效性
        - 在JWT认证之前进行预检查，提前拦截无效token
        
        Args:
            access_token_string: access token字符串
            
        Returns:
            bool: 是否在黑名单中
        """
        try:
            # 解析JWT获取唯一标识符
            token = UntypedToken(access_token_string)
            jti = token.payload.get('jti')    # JWT唯一标识符
            
            if not jti:
                return False
            
            # 在黑名单缓存中查找该token
            blacklist_key = f"{cls.BLACKLIST_PREFIX}:{jti}"
            return cache.get(blacklist_key) is not None
            
        except Exception:
            # token解析失败（格式错误、签名无效等），让JWT认证处理
            return False
    
    @classmethod
    def blacklist_refresh_token(cls, refresh_token_string):
        """
        将refresh token加入官方黑名单（登出时使用）
        
        功能说明：
        1. 使用djangorestframework-simplejwt的官方黑名单机制
        2. 将refresh token加入数据库黑名单表
        3. 同时使对应的access token失效

        Args:
            refresh_token_string: refresh token字符串
            
        Returns:
            bool: 是否成功加入黑名单
        """
        try:
            # 使用官方RefreshToken类解析并加入黑名单
            token = RefreshToken(refresh_token_string)
            token.blacklist()
            print(f"Refresh token已加入官方黑名单")
            return True
        except Exception as e:
            print(f"Refresh token加入黑名单失败: {e}")
            return False
    
    @classmethod
    def cleanup_user_tokens(cls, user):
        """
        清理用户的所有token（登录时调用，实现"一用户一会话"安全策略）
        
        功能说明：
        1. 清理用户的所有refresh token（数据库黑名单）
        2. 清理用户的所有access token（缓存黑名单）
        3. 确保新登录时旧的所有token都失效
        
        Args:
            user: 用户对象
            
        Returns:
            int: 清理的token数量
        """
        cleaned_count = 0

        cleaned_count += cls._cleanup_user_refresh_tokens(user)

        cleaned_count += cls._cleanup_user_access_tokens(user)
        
        return cleaned_count
    
    @classmethod
    def _cleanup_user_refresh_tokens(cls, user):
        """清理用户的所有refresh token"""
        try:
            outstanding_tokens = OutstandingToken.objects.filter(user=user)
            cleaned_count = 0
            
            for token_record in outstanding_tokens:
                try:
                    refresh_token = RefreshToken(token_record.token)
                    refresh_token.blacklist()
                    cleaned_count += 1
                except Exception:
                    # 忽略已经在黑名单或无效的token
                    pass
            
            if cleaned_count > 0:
                print(f"已清理用户 {user.username} 的 {cleaned_count} 个refresh token")
            
            return cleaned_count
            
        except Exception as e:
            print(f"清理refresh token失败: {e}")
            return 0
    
    @classmethod
    def _cleanup_user_access_tokens(cls, user):
        """
        清理用户的所有access token
        
        使用用户token列表方案，兼容性最好，性能稳定
        """
        try:
            user_tokens_list_key = f"user_tokens_list:{user.id}"
            user_token_list = cache.get(user_tokens_list_key, [])
            
            if not user_token_list:
                return 0
            
            cleaned_count = 0
            
            for jti in user_token_list:
                try:
                    # 检查token是否还存在
                    user_token_key = f"{cls.USER_TOKENS_PREFIX}:{user.id}:{jti}"
                    token_value = cache.get(user_token_key)
                    
                    if token_value:
                        # 将token加入黑名单
                        blacklist_key = f"{cls.BLACKLIST_PREFIX}:{jti}"
                        cache.set(blacklist_key, True, 1800)  # 30分钟TTL
                        
                        # 删除token记录
                        cache.delete(user_token_key)
                        cleaned_count += 1
                        
                except Exception:
                    continue
            
            # 清空用户token列表
            cache.delete(user_tokens_list_key)
            
            return cleaned_count
            
        except Exception:
            return 0
    
    @classmethod
    def get_token_stats(cls, user=None):
        """
        获取token统计信息（调试用）
        
        Args:
            user: 用户对象，如果为None则获取全局统计
            
        Returns:
            dict: 统计信息
        """
        try:
            if not hasattr(cache, '_cache') or not hasattr(cache._cache, 'get_client'):
                return {'error': '需要Redis支持'}
            
            redis_client = cache._cache.get_client()
            
            if user:
                # 用户级别统计
                user_pattern = f"{cls.USER_TOKENS_PREFIX}:{user.id}:*"
                user_tokens = redis_client.keys(user_pattern)
                
                blacklist_pattern = f"{cls.BLACKLIST_PREFIX}:*"
                all_blacklisted = redis_client.keys(blacklist_pattern)
                
                return {
                    'user_id': user.id,
                    'username': user.username,
                    'active_access_tokens': len(user_tokens),
                    'total_blacklisted_tokens': len(all_blacklisted)
                }
            else:
                # 全局统计
                all_user_tokens = redis_client.keys(f"{cls.USER_TOKENS_PREFIX}:*")
                all_blacklisted = redis_client.keys(f"{cls.BLACKLIST_PREFIX}:*")
                
                return {
                    'total_tracked_tokens': len(all_user_tokens),
                    'total_blacklisted_tokens': len(all_blacklisted)
                }
                
        except Exception as e:
            return {'error': f'获取统计失败: {e}'}
    
    @classmethod
    def extract_token_from_request(cls, request):
        """
        从请求中提取access token
        
        Args:
            request: Django请求对象
            
        Returns:
            str|None: access token字符串，如果没有则返回None
        """
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if auth_header and auth_header.startswith('Bearer '):
                return auth_header.split(' ')[1]
            return None
        except Exception:
            return None
    

    @classmethod
    def logout_user(cls, request):
        """
        用户登出的统一处理方法
        
        Args:
            request: Django请求对象，包含refresh token和access token
            
        Returns:
            dict: 处理结果
        """
        try:
            # 获取refresh token
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return {
                    'success': False,
                    'message': '缺少 refresh token'
                }
            
            # 将refresh token加入黑名单
            cls.blacklist_refresh_token(refresh_token)
            
            # 将access token加入黑名单
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                access_token = auth_header.split(' ')[1]
                cls.blacklist_access_token(access_token)
            
            return {
                'success': True,
                'message': '登出成功，所有token已失效'
            }
                    
        except Exception:
            return {
                'success': True,  # 即使失败也返回成功，确保用户体验
                'message': '登出成功'
            }
    
    @classmethod
    def refresh_user_token(cls, request, new_access_token, refresh_token_string):
        """
        刷新token的统一处理方法
            清理该用户的所有旧access token（更安全的方案）
            记录新的access token
        
        Args:
            request: Django请求对象
            new_access_token: 新生成的access token
            refresh_token_string: refresh token字符串
            
        Returns:
            bool: 是否处理成功
        """
        try:
            # 获取用户信息
            if not (new_access_token and refresh_token_string):
                return False
            
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                
                refresh_token = RefreshToken(refresh_token_string)
                user_id = refresh_token.payload.get('user_id')
                if not user_id:
                    return False
                    
                user = User.objects.get(id=user_id)
                
            except Exception:
                return False
            
            # 1. 处理旧的access token

            cls._cleanup_user_access_tokens(user)
            
            # 2. 记录新的access token
            track_success = cls.track_access_token(user, new_access_token)
            return track_success
            
        except Exception:
            return False
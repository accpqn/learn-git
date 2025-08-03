from django.http import JsonResponse
from .token_manager import TokenManager


class AccessTokenBlacklistMiddleware:
    """
    专注于http请求处理，在路由前提前拦截，所有API请求都覆盖
     中间件：负责请求拦截、路径过滤、错误响应
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 对API请求进行检查
        if not self._should_check_request(request):
            return self.get_response(request)
        
        # 从请求中提取token
        access_token = self._extract_token(request)
        if not access_token:
            return self.get_response(request)

        # 调用TokenManager检查token是否在黑名单中
        if TokenManager.is_access_token_blacklisted(access_token):
            return self._create_blacklist_response(request.path)

        return self.get_response(request)
    
    def _should_check_request(self, request):
        """
        判断是否需要检查请求
        中间件职责：决定哪些请求需要进行token检查
        """
        return request.path.startswith('/api/')
    
    def _extract_token(self, request):
        """
        从请求中提取access token
        处理HTTP请求头，提取Authorization信息
        """
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if auth_header and auth_header.startswith('Bearer '):
                return auth_header.split(' ')[1]
            return None
        except Exception:
            return None
    
    def _create_blacklist_response(self, request_path):
        """
        创建黑名单错误响应
        生成HTTP响应，记录拦截日志
        """
        print(f"拦截黑名单token访问: {request_path}")
        return JsonResponse({
            'detail': 'Token已失效，请重新登录',
            'code': 'token_blacklisted'
        }, status=401)
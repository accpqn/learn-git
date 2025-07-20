"""
自定义邮件后端 - 解决SSL证书验证问题
"""
import ssl
import smtplib
from django.core.mail.backends.smtp import EmailBackend as DjangoEmailBackend
from django.conf import settings


class CustomEmailBackend(DjangoEmailBackend):
    """
    自定义邮件后端，解决SSL证书验证问题
    """
    
    def open(self):
        """
        确保我们有一个到邮件服务器的连接。
        如果已经有连接，则返回False。否则，尝试建立新连接，成功时返回True。
        """
        if self.connection:
            # 如果已经有连接，什么都不做
            return False
        
        # 创建连接参数
        connection_params = {'local_hostname': self.local_hostname}
        if self.timeout is not None:
            connection_params['timeout'] = self.timeout
        if self.use_ssl:
            connection_params['keyfile'] = self.ssl_keyfile
            connection_params['certfile'] = self.ssl_certfile
        
        try:
            if self.use_ssl:
                self.connection = smtplib.SMTP_SSL(self.host, self.port, **connection_params)
            else:
                self.connection = smtplib.SMTP(self.host, self.port, **connection_params)
                
                if self.use_tls:
                    self.connection.ehlo()
                    # 创建不验证证书的SSL上下文
                    context = ssl.create_default_context()
                    context.check_hostname = False
                    context.verify_mode = ssl.CERT_NONE
                    self.connection.starttls(context=context)
                    self.connection.ehlo()
            
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            return True
        except OSError:
            if not self.fail_silently:
                raise


class SimpleEmailBackend(DjangoEmailBackend):
    """
    简化的邮件后端，专门用于QQ邮箱
    """
    
    def open(self):
        if self.connection:
            return False
        
        try:
            # 直接使用smtplib，不依赖Django的复杂SSL处理
            self.connection = smtplib.SMTP(self.host, self.port, timeout=self.timeout)
            
            if self.use_tls:
                self.connection.starttls()
            
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            
            return True
        except Exception as e:
            if not self.fail_silently:
                raise
            return False

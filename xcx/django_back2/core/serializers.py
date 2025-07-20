from rest_framework import serializers
from .models import CoupleTheme


class CoupleThemeSerializer(serializers.ModelSerializer):
    """
    情侣主题序列化器
    """
    background_image_url = serializers.SerializerMethodField()

    class Meta:
        model = CoupleTheme
        fields = (
            'id', 'binding', 'primary_color', 'secondary_color', 'background_color',
            'theme_name', 'background_image', 'background_image_url',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'binding', 'created_at', 'updated_at', 'background_image_url')

    def get_background_image_url(self, obj):
        """
        获取背景图片URL
        """
        if obj.background_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.background_image.url)
            return obj.background_image.url
        return None

    def validate_primary_color(self, value):
        """验证主色调格式"""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError("颜色格式错误，请使用十六进制格式如 #FF69B4")
        return value

    def validate_secondary_color(self, value):
        """验证辅助色格式"""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError("颜色格式错误，请使用十六进制格式如 #FF1493")
        return value

    def validate_background_color(self, value):
        """验证背景色格式"""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError("颜色格式错误，请使用十六进制格式如 #FFF5F8")
        return value
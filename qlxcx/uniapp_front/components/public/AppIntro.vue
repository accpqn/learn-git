<template>
    <view class="app-intro">
        <image class="logo" src="/static/images/logo.png" mode="aspectFit"></image>
        <text class="app-name">{{ appName }}</text>
        <text class="description">{{ description }}</text>
        <view class="features">
            <view class="feature-item" v-for="(feature, index) in features" :key="index">
                <text class="feature-title">{{ feature.title }}</text>
                <text class="feature-desc">{{ feature.description }}</text>
            </view>
        </view>
    </view>
</template>

<script>
import { APP_CONFIG } from '@/utils/config';

export default {
    name: 'AppIntro',
    data() {
        return {
            appName: APP_CONFIG.appName,
            description: APP_CONFIG.description,
            features: [
                {
                    title: '定制主题',
                    description: '打造你们的专属风格'
                }
            ]
        }
    }
}
</script>

<style>
.app-intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx;
}

.logo {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
}

.app-name {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
}

.description {
    font-size: 32rpx;
    color: #666;
    text-align: center;
    margin-bottom: 60rpx;
}

.features {
    width: 100%;
}

.feature-item {
    margin-bottom: 40rpx;
    text-align: center;
}

.feature-title {
    font-size: 36rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 10rpx;
    display: block;
}

.feature-desc {
    font-size: 28rpx;
    color: #666;
    display: block;
}
</style> 
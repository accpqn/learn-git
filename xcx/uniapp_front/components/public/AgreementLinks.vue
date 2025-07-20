<template>
    <view class="agreement-links">
        <text class="agreement-text">登录即代表您同意</text>
        <navigator :url="userAgreementUrl" class="link">《用户协议》</navigator>
        <text class="agreement-text">和</text>
        <navigator :url="privacyPolicyUrl" class="link">《隐私政策》</navigator>
    </view>
</template>

<script>
import { APP_CONFIG } from '@/utils/config';

export default {
    name: 'AgreementLinks',
    data() {
        return {
            userAgreementUrl: APP_CONFIG.agreements.userAgreement,
            privacyPolicyUrl: APP_CONFIG.agreements.privacyPolicy
        }
    }
}
</script>

<style>
.agreement-links {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24rpx;
    color: #999;
    padding: 20rpx 0;
}

.agreement-text {
    color: #999;
}

.link {
    color: #FF69B4;
    display: inline;
}
</style>
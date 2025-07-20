#!/usr/bin/env node

// 环境切换脚本
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const targetEnv = args[0];

if (!targetEnv || !['development', 'testing', 'production'].includes(targetEnv)) {
    console.log('使用方法: node scripts/switch-env.js <environment>');
    console.log('可选环境: development | testing | production');
    process.exit(1);
}

// 配置文件路径
const configPath = path.join(__dirname, '../config/index.js');

// 读取配置文件
let configContent = fs.readFileSync(configPath, 'utf8');

// 替换环境配置
const envRegex = /const CURRENT_ENV = getEnvironment\(\);/;
const newEnvLine = `const CURRENT_ENV = '${targetEnv}'; // 手动设置环境`;

configContent = configContent.replace(envRegex, newEnvLine);

// 写回文件
fs.writeFileSync(configPath, configContent);

console.log(`✅ 环境已切换到: ${targetEnv}`);

// 显示当前配置
const envConfigs = {
    development: {
        API_BASE_URL: 'http://127.0.0.1:8000',
        MEDIA_BASE_URL: 'http://127.0.0.1:8000'
    },
    testing: {
        API_BASE_URL: 'https://test-api.your-domain.com',
        MEDIA_BASE_URL: 'https://test-cdn.your-domain.com'
    },
    production: {
        API_BASE_URL: 'https://your-domain.com',
        MEDIA_BASE_URL: 'https://your-cdn.com'
    }
};

const currentConfig = envConfigs[targetEnv];
console.log('当前配置:');
console.log(`  API_BASE_URL: ${currentConfig.API_BASE_URL}`);
console.log(`  MEDIA_BASE_URL: ${currentConfig.MEDIA_BASE_URL}`);

if (targetEnv === 'production') {
    console.log('\n⚠️  生产环境提醒:');
    console.log('  1. 请确认API域名配置正确');
    console.log('  2. 请确认SSL证书已配置');
    console.log('  3. 请确认CORS设置正确');
}

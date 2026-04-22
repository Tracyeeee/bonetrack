# 云函数部署指南

## 部署方式

### 方式一：微信开发者工具（推荐）

1. 打开微信开发者工具
2. 打开项目 `miniprogram`
3. 在左侧找到 `cloudfunctions` 文件夹
4. 依次右键每个云函数文件夹，选择「上传并部署：云端安装依赖」
   - `getOpenId`
   - `login`
   - `getPosts`
   - `createPost`
   - `comment`
   - `like`

### 方式二：命令行部署

确保已安装微信开发者工具 CLI，然后运行：

```bash
# 安装依赖
cd cloudfunctions

# 安装每个云函数的依赖
cd getOpenId && npm install && cd ..
cd login && npm install && cd ..
cd getPosts && npm install && cd ..
cd createPost && npm install && cd ..
cd comment && npm install && cd ..
cd like && npm install && cd ..
```

## 环境配置

已配置云开发环境ID：`cloud1-d9g2o0owa3e2aeffe`

## 验证部署

1. 部署完成后，在开发者工具中打开「云开发控制台」
2. 点击「云函数」查看已部署的函数列表
3. 测试云函数：右键云函数 → 「测试」

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 部署失败 | 检查网络连接，重新上传 |
| 调用失败 | 检查环境ID是否正确 |
| 依赖安装失败 | 删除 node_modules 后重新安装 |

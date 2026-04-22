# 微信云开发接入指南

## 一、开通云开发环境

### 步骤1：在微信开发者工具中开通云开发

1. 打开微信开发者工具
2. 右键点击项目根目录
3. 选择「开通云开发」
4. 填写环境名称（如 `bonetrack-prod`）
5. 点击「创建」

### 步骤2：获取环境ID

1. 进入云开发控制台
2. 点击「设置」图标
3. 复制「环境ID」（格式如 `cloud1-xxxxxx`）

## 二、配置小程序

### 修改 `app.js`

打开 `miniprogram/app.js`，在 `globalData` 中配置环境ID：

```javascript
App({
  globalData: {
    env: 'your-environment-id', // 替换为你的环境ID
    userInfo: null,
    openId: '',
    navBarInfo: null
  },

  onLaunch: function () {
    const userInfo = wx.getStorageSync('userInfo');
    this.globalData.userInfo = userInfo;
    this.calculateNavBarInfo();

    // 初始化云开发
    if (this.globalData.env && wx.cloud) {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }

    // 启用静默登录获取OpenID
    this.silentLogin();

    this.checkUpdate();
  },
  // ... 其他代码保持不变
});
```

## 三、创建数据库集合

在云开发控制台中创建以下集合：

### 1. users（用户集合）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| openId | string | 微信用户唯一标识（主键） |
| nickName | string | 用户昵称 |
| avatarUrl | string | 头像URL |
| daysSinceSurgery | number | 术后天数 |
| surgeryDate | string | 手术日期 |
| injuryPart | string | 损伤部位 |
| injuryType | string | 损伤类型 |
| injuryReason | string | 受伤原因 |
| sportBackground | string | 运动背景 |
| sportsItems | array | 运动项目 |
| createdAt | number | 创建时间戳 |
| updatedAt | number | 更新时间戳 |

### 2. posts（帖子集合）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| authorId | string | 作者openId |
| authorName | string | 作者昵称 |
| authorAvatar | string | 作者头像 |
| daysSinceSurgery | number | 术后天数 |
| injuryPart | string | 损伤部位 |
| injuryType | string | 损伤类型 |
| injuryReason | string | 受伤原因 |
| sportBackground | string | 运动背景 |
| sportsItems | array | 运动项目 |
| content | string | 帖子内容 |
| images | array | 图片URL列表 |
| tags | array | 自动生成的标签 |
| likes | number | 点赞数 |
| commentCount | number | 评论数 |
| createdAt | number | 创建时间戳 |
| updatedAt | number | 更新时间戳 |

### 3. comments（评论集合）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| postId | string | 所属帖子ID |
| authorId | string | 评论者openId |
| authorName | string | 评论者昵称 |
| authorAvatar | string | 评论者头像 |
| content | string | 评论内容 |
| createdAt | number | 创建时间戳 |

### 4. likes（点赞集合）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| postId | string | 被点赞帖子ID |
| userId | string | 点赞用户openId |
| createdAt | number | 创建时间戳 |

## 四、部署云函数

### 方法1：使用微信开发者工具部署

1. 在微信开发者工具中打开 `cloudfunctions` 文件夹
2. 右键点击 `getOpenId` 文件夹
3. 选择「上传并部署：云端安装依赖」
4. 等待部署完成
5. 重复以上步骤，依次部署：
   - `login`
   - `getPosts`
   - `createPost`
   - `comment`
   - `like`

### 方法2：使用命令行部署

```bash
# 进入云函数目录
cd cloudfunctions

# 安装依赖
npm install

# 部署单个云函数
cd getOpenId && npm run deploy
cd ../login && npm run deploy
# ... 以此类推
```

## 五、配置云函数权限

### 1. 统一配置权限

在每个云函数的 `index.js` 同级目录创建 `config.json`：

```json
{
  "permissions": {
    "openapi": ["wxacode.getUnlimited"]
  }
}
```

### 2. 数据库权限设置

在云开发控制台 → 数据库 → 选择集合 → 「权限设置」：

| 集合 | 推荐权限 |
|------|----------|
| users | 所有用户可读，创建者可写 |
| posts | 所有用户可读，仅创建者可写 |
| comments | 所有用户可读，仅创建者可写 |
| likes | 所有用户可读，仅创建者可写 |

## 六、测试验证

### 1. 本地测试

1. 在微信开发者工具中打开项目
2. 点击「真机调试」或使用模拟器
3. 打开「调试器」查看控制台输出
4. 测试功能：
   - 发布帖子
   - 评论帖子
   - 点赞帖子
   - 查看帖子列表

### 2. 常见问题排查

| 问题 | 解决方案 |
|------|----------|
| 云函数调用失败 | 检查环境ID是否配置正确 |
| 获取不到openId | 检查云函数是否部署成功 |
| 数据库操作失败 | 检查集合权限设置 |
| 图片上传失败 | 检查云存储容量是否充足 |

## 七、上线前检查清单

- [ ] 云开发环境已开通
- [ ] 环境ID已配置到 `app.js`
- [ ] 所有4个云函数已部署
- [ ] 数据库集合已创建
- [ ] 数据库权限已配置
- [ ] 本地测试全部通过
- [ ] 小程序已提交审核

## 八、费用说明

### 免费额度（每月）

| 资源 | 免费额度 |
|------|----------|
| 云函数调用 | 10万次 |
| 数据库读取 | 10万次 |
| 数据库写入 | 5万次 |
| 云存储 | 5GB |
| 云数据库 | 2GB |

### 超额后费用

| 资源 | 单价 |
|------|------|
| 云函数调用 | 0.2元/万次 |
| 数据库读取 | 0.5元/万次 |
| 数据库写入 | 1元/万次 |
| 云存储 | 0.1元/GB/天 |
| 云数据库 | 0.1元/GB/天 |

### 预估成本

假设一个小程序有1000日活用户：
- 平均每用户每天调用云函数5次
- 每月约15万次云函数调用
- 预计月费用：约10-50元

## 九、技术支持

如遇到问题，请检查：
1. 微信开发者工具控制台错误信息
2. 云开发控制台日志
3. 云函数部署状态

---

如需进一步帮助，请提供具体的错误信息。

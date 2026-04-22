# 微信云开发 - 数据库设计文档

## 集合说明

### 1. users（用户集合）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | string | 微信用户唯一标识 |
| openId | string | 微信 OpenID |
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
| _id | string | 自动生成的ID |
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
| _id | string | 自动生成的ID |
| postId | string | 所属帖子ID |
| authorId | string | 评论者openId |
| authorName | string | 评论者昵称 |
| authorAvatar | string | 评论者头像 |
| content | string | 评论内容 |
| createdAt | number | 创建时间戳 |

### 4. likes（点赞集合）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | string | 自动生成的ID |
| postId | string | 被点赞帖子ID |
| userId | string | 点赞用户openId |
| createdAt | number | 创建时间戳 |

## 权限设置建议

### 开发阶段
- 所有集合：仅创建者可读写

### 上线后建议
- users: 所有用户可读，创建者可写
- posts: 所有用户可读，仅创建者可修改删除
- comments: 所有用户可读，仅创建者可修改删除
- likes: 所有用户可读，仅创建者可删除

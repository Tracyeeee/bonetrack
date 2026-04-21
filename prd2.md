# Bonetrack 骨迹康复管理小程序 - 产品需求文档 v2

## 一、产品概述

### 1.1 产品定位
**Bonetrack 骨迹**是一款专注于术后及运动损伤康复管理的微信小程序，将枯燥的康复过程数据化、游戏化，帮助用户科学追踪康复进度。

### 1.2 目标用户
- 骨折、韧带损伤等术后康复人群
- 运动损伤恢复期人群
- 需要长期追踪康复数据的患者

### 1.3 核心价值
- 康复进度可视化
- 每日打卡记录（角度、负重、照片）
- 伤友社区互助
- 康复知识科普

---

## 二、设计规范

### 2.1 视觉风格
| 属性 | 值 |
|------|-----|
| 主题风格 | 深色沉浸式、运动风格 |
| 主色调 | #FF4D00（恢复橙） |
| 辅助色 | #007AFF（医疗蓝） |
| 背景色 | #0A0A0A（深黑） |
| 卡片背景 | #1A1A1A（暗灰） |
| 主文字 | #FFFFFF（白色） |
| 次要文字 | #888888（灰色） |
| 淡化文字 | #555555（暗灰） |

### 2.2 布局规范
| 元素 | 尺寸 |
|------|------|
| 导航栏高度 | 动态计算（83rpx 内容区 + 状态栏） |
| 卡片圆角 | 20-24rpx |
| 卡片内边距 | 30-40rpx |
| 按钮高度 | 88rpx |
| 按钮圆角 | 50rpx |
| 标签圆角 | 30rpx |

### 2.3 导航栏
- 采用沉浸式设计，动态计算高度
- 顶部预留与内容的间距变量：`--nav-bar-bottom-gap: 36rpx`

---

## 三、功能模块

### 3.1 TabBar 结构

| Tab | 图标 | 页面路径 |
|-----|------|---------|
| 首页 | - | /pages/index/index |
| 任务 | - | /pages/tasks/tasks |
| 日历 | - | /pages/calendar/calendar |
| 广场 | - | /pages/square/square |
| 个人中心 | - | /pages/user/user |

---

### 3.2 首页（pages/index/index）

#### 3.2.1 功能描述
用户进入小程序的默认页面，展示康复状态总览和快捷打卡入口。

#### 3.2.2 界面元素
1. **顶部导航栏**
   - 标题：首页
   - 无右侧操作按钮

2. **欢迎卡片**
   - 上外边距：36rpx（使用 `--nav-bar-bottom-gap` 变量）
   - 显示术后天数
   - 渐变背景：#1A1A1A → rgba(255,77,0,0.1)

3. **今日任务简报**
   - 显示当天待完成训练任务
   - 每项任务包含：图标、名称、完成状态
   - 点击可切换完成状态

4. **悬浮打卡按钮**
   - 位置：底部居中，距底部120rpx
   - 尺寸：120rpx × 120rpx
   - 样式：圆形、橙色背景、阴影效果
   - 点击：弹出快捷记录面板

5. **底部统计栏**
   - 总天数
   - 打卡天数
   - 完成率
   - 最新角度

#### 3.2.3 数据结构
```javascript
// 用户信息
userInfo: {
  daysSinceSurgery: Number,    // 术后天数
  injuryPart: String,          // 损伤部位
  injuryType: String,         // 损伤类型
  avatar: String,             // 头像URL
  nickname: String            // 昵称
}

// 打卡状态
checkInStatus: {
  hasCheckedIn: Boolean,
  todayTasks: [{
    id: String,
    name: String,
    category: String,
    completed: Boolean,
    sets: Number,
    reps: Number,
    icon: String
  }]
}

// 统计数据
stats: {
  totalDays: Number,
  checkedInDays: Number,
  completionRate: Number,
  latestAngle: Number
}
```

#### 3.2.4 业务逻辑
1. **toggleTask(taskId)**: 切换任务完成状态
3. **showQuickRecordModal()**: 显示快捷记录面板
4. **saveAngleRecord(angle)**: 保存角度记录
5. **saveWeightRecord(weight)**: 保存负重记录

---

### 3.3 任务页（pages/tasks/tasks）

#### 3.3.1 功能描述
展示训练计划、训练任务和动作库。

#### 3.3.2 界面元素
1. **训练计划卡片**
   - 当前阶段名称
   - 目标描述
   - 周期进度

2. **今日训练任务列表**
   - 支持添加自定义任务
   - 任务卡片包含：图标、名称、组数×次数

3. **动作库**
   - 分类标签：全部、关节活动、力量训练、平衡训练、有氧训练
   - 动作卡片包含：图标、名称、难度、简要描述
   - 点击查看详情弹窗

4. **添加任务按钮**
   - 新增自定义训练任务

#### 3.3.3 康复阶段定义
| 阶段 | 天数范围 | 名称 |
|------|---------|------|
| 1 | 0-30天 | 早期恢复 |
| 2 | 30-60天 | 力量训练 |
| 3 | 60-90天 | 功能提升 |
| 4 | 90天+ | 运动恢复 |

#### 3.3.4 数据结构
```javascript
trainingPlan: {
  cycle: String,
  target: String,
  currentPhase: Number
}

categories: [{
  id: String,
  name: String,
  icon: String
}]

todayTasks: [{
  id: String,
  name: String,
  category: String,
  completed: Boolean,
  sets: Number,
  reps: Number,
  icon: String,
  startDate: String,
  endDate: String
}]

exerciseLibrary: [{
  id: String,
  name: String,
  category: String,
  description: String,
  sets: Number,
  reps: Number,
  icon: String,
  difficulty: String,
  tips: String
}]
```

---

### 3.4 日历页（pages/calendar/calendar）

#### 3.4.1 功能描述
以日历形式展示康复打卡记录，支持查看详情和管理里程碑。

#### 3.4.2 界面元素
1. **月份切换**
   - 当前月份显示
   - 左右切换按钮

2. **日历网格**
   - 7列布局（周日到周六）
   - 每天显示：日期、打卡状态图标、照片缩略图
   - 状态样式：
     - 今日：橙色边框
     - 有记录：橙色圆点
     - 有照片：相机图标
     - 未来：置灰

3. **记录详情弹窗**
   - 日期信息
   - 角度记录
   - 负重记录
   - 照片列表（最多9张）
   - 编辑/删除操作

4. **里程碑时间线**
   - 列表展示康复里程碑
   - 支持添加、编辑、删除、标记完成
   - 每项包含：图标、名称、目标天数、日期、完成状态

5. **顶部统计**
   - 术后总天数
   - 累计打卡天数
   - 打卡完成率

#### 3.4.3 数据结构
```javascript
days: [{
  day: Number,
  date: String,
  isToday: Boolean,
  hasRecord: Boolean,
  hasPhoto: Boolean,
  angle: Number,
  tasks: Array,
  isFuture: Boolean
}]

milestones: [{
  id: String,
  name: String,
  description: String,
  icon: String,
  completed: Boolean,
  targetDay: Number,
  date: String
}]

records: {
  'YYYY-MM-DD': {
    angle: Number,
    weight: String,
    photos: [String]
  }
}
```

---

### 3.5 伤友广场（pages/square/square）

#### 3.5.1 功能描述
社区功能，允许用户发布康复动态、浏览他人帖子、互动评论。

#### 3.5.2 界面元素
1. **动态列表**
   - 用户头像、昵称、术后天数
   - 损伤标签
   - 内容正文
   - 图片（最多9张）
   - 点赞、评论按钮
   - 发布时间

2. **发布按钮**
   - 右下角悬浮
   - 点击跳转发布页

3. **发布页**
   - 文本输入框
   - 图片上传（最多9张）
   - 自动生成标签（损伤类型、术后天数）

4. **评论弹窗**
   - 评论列表
   - 输入框发送评论

#### 3.5.3 数据结构
```javascript
posts: [{
  id: String,
  userId: String,
  userName: String,
  userAvatar: String,
  daysSinceSurgery: Number,
  injuryPart: String,
  injuryType: String,
  injuryReason: String,
  sportBackground: String,
  content: String,
  images: [String],
  tags: [String],
  likes: Number,
  comments: Number,
  isLiked: Boolean,
  createTime: String,
  commentList: [{
    id: String,
    userName: String,
    content: String,
    createTime: String
  }]
}
```

#### 3.5.4 自动标签规则
- `#损伤类型`（如 ACL、半月板）
- `#术后X天`
- 90天以上额外标签：#90天以上

---

### 3.6 个人中心（pages/user/user）

#### 3.6.1 功能描述
展示用户个人信息和康复数据统计。

#### 3.6.2 界面元素
1. **用户信息卡片**
   - 头像、昵称
   - 损伤部位、损伤类型
   - 术后天数
   - 微信授权状态

2. **数据统计**
   - 打卡天数
   - 记录照片数
   - 连续打卡天数

3. **康复进度**
   - 角度进度条（当前角度 → 目标角度）
   - 进度百分比

4. **里程碑进度**
   - 已完成里程碑列表
   - 完成进度

5. **成就徽章**
   - 徽章图标网格
   - 已解锁/未解锁状态

6. **功能菜单**
   - 编辑伤情简历
   - 提醒设置
   - 关于我们
   - 意见反馈
   - 用户主页（显示"功能开发中"）

#### 3.6.3 数据结构
```javascript
userInfo: {
  nickname: String,
  avatar: String,
  injuryPart: String,
  injuryType: String,
  surgeryDate: String,
  daysSinceSurgery: Number,
  isAuthorized: Boolean
}

stats: {
  totalDays: Number,
  checkInDays: Number,
  totalPhotos: Number,
  consecutiveDays: Number
}

progress: {
  angleProgress: [{ day, angle }],
  latestAngle: Number,
  targetAngle: Number,
  targetDate: String
}

milestones: [{
  name: String,
  targetDay: Number,
  completed: Boolean
}]

badges: [{
  id: String,
  name: String,
  icon: String,
  unlocked: Boolean
}]

menuItems: [{
  id: String,
  name: String,
  icon: String,
  arrow: Boolean
}]
```

---

### 3.7 打卡中心（pages/checkin/checkin）

#### 3.7.1 功能描述
记录当天的康复打卡数据，包括照片、角度和负重。

#### 3.7.2 界面元素
1. **照片打卡模块**
   - 可上传最多9张照片
   - 照片预览、删除功能

2. **角度记录模块**
   - 预设角度选项：30°、45°、60°、75°、90°、100°、110°、120°、130°
   - 自定义角度输入

3. **负重记录模块**
   - 数值输入
   - 单位切换：kg / 斤

4. **模块展开/收起**
   - 点击标题切换展开状态

5. **保存提示**
   - 实时自动保存
   - 保存成功提示

#### 3.7.3 数据结构
```javascript
photos: [String],             // 照片URL列表，最多9张
angle: String,                // 角度值
angleOptions: [30, 45, 60, 75, 90, 100, 110, 120, 130],
weight: String,               // 负重值
weightUnit: 'kg' | '斤',
todayRecord: {
  angle: String,
  weight: String,
  photos: [String]
}
```

---

### 3.8 伤情简历（pages/profile/profile）

#### 3.8.1 功能描述
首次使用时的引导流程，收集用户的基本康复信息。

#### 3.8.2 界面元素

**步骤1：选择损伤部位**
- 三级联动选择器
- 第一级：部位（膝关节、肩关节、踝关节等）
- 第二级：具体（ACL、半月板、肩袖等）
- 第三级：类型（骨折、撕裂、扭伤等）
- 支持自定义输入

**步骤2：治疗方式与日期**
- 治疗方式选择：手术 / 保守治疗
- 日期选择：
  - 手术日期（治疗方式为手术时显示）
  - 受伤日期（治疗方式为保守时显示）

**步骤3：基本信息**
- 昵称输入
- 损伤原因选择：
  - 运动损伤
  - 意外受伤
  - 工作相关
  - 其他
  - 支持自定义
- 运动背景选择：
  - 专业运动员
  - 运动爱好者
  - 偶尔运动
  - 基本不运动
- 运动类型多选（运动爱好者可见）：
  - 篮球、足球、羽毛球、网球、跑步、健身、其他

**步骤4：授权与完成**
- 微信头像、昵称授权
- 跳过授权选项
- 完成按钮

#### 3.8.3 数据结构
```javascript
userInfo: {
  injuryPart: String,
  injuryPartDetail: String,
  injuryType: String,
  surgeryDate: String,
  injuryDate: String,
  treatmentType: String,      // 'surgery' | 'conservative'
  nickname: String,
  avatar: String,
  isAuthorized: Boolean,
  injuryCause: String,
  sportsBackground: String,
  sportsType: [String],
  sportsItems: [String]
}

// 部位级联数据
injuryParts: [{
  id: String,
  name: String,
  children: [{
    id: String,
    name: String,
    children: [{ id: String, name: String }]
  }]
}]
```

---

## 四、全局功能

### 4.1 沉浸式导航栏
- 动态计算导航栏高度
- 支持状态栏适配
- 可复用的导航栏样式类

### 4.2 本地存储策略
| 数据 | 存储键名 |
|------|---------|
| 用户信息 | `userInfo` |
| OpenID | `openId` |
| 打卡记录 | `checkin_YYYY-MM-DD` |
| 任务状态 | `tasks_YYYY-MM-DD` |
| 自定义任务 | `customTasks` |
| 里程碑 | `milestones` |
| 提醒时间 | `reminderTime` |

### 4.3 云开发
- 框架已搭建，envId 需配置
- 云函数目录：`cloudfunctions/`
- 云提示组件：`components/cloudTipModal/`

---

## 五、待完善功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 云开发后端集成 | 高 | 需配置云环境envId |
| 角度趋势图 | 中 | 展示康复进度曲线 |
| 成就徽章系统 | 中 | 激励用户坚持打卡 |
| 提醒推送 | 中 | 接入订阅消息 |
| 用户主页 | 低 | 查看其他用户资料 |
| 数据云同步 | 低 | 多设备数据同步 |

---

## 六、技术规范

### 6.1 文件结构
```
miniprogram/
├── app.js              # 全局逻辑
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── utils.wxs           # 工具函数（WXS）
├── pages/              # 页面文件
│   ├── index/          # 首页
│   ├── tasks/          # 任务页
│   ├── calendar/        # 日历页
│   ├── square/          # 伤友广场
│   ├── user/            # 个人中心
│   ├── checkin/         # 打卡中心
│   ├── profile/         # 伤情简历
│   └── example/         # 示例页
├── components/          # 组件
│   └── cloudTipModal/   # 云提示组件
└── images/              # 静态图片
```

### 6.2 CSS变量
```css
--bg-color: #0A0A0A
--primary-color: #FF4D00
--secondary-color: #007AFF
--text-primary: #FFFFFF
--text-secondary: #888888
--text-muted: #555555
--card-bg: #1A1A1A
--nav-bar-bottom-gap: 36rpx
```

### 6.3 通用样式类
| 类名 | 用途 |
|------|------|
| `.card` | 通用卡片样式 |
| `.btn-primary` | 主按钮 |
| `.btn-secondary` | 次要按钮 |
| `.btn-outline` | 描边按钮 |
| `.input-field` | 输入框 |
| `.tag` | 标签 |
| `.flex-row` | 横向flex |
| `.flex-column` | 纵向flex |
| `.avatar` | 头像（80rpx） |
| `.avatar-small` | 小头像（60rpx） |
| `.avatar-large` | 大头像（120rpx） |
| `.fab-checkin` | 悬浮打卡按钮 |

---

## 七、版本信息

- **文档版本**: v2.0
- **更新日期**: 2026-04-18
- **维护者**: Bonetrack 开发团队

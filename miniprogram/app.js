// app.js
App({
  globalData: {
    env: 'cloud1-d9g2o0owa3e2aeffe', // 云开发环境ID
    userInfo: null,
    openId: '',
    navBarInfo: null, // 全局导航栏信息
    // 全局训练任务列表
    taskList: [
      { id: 1, name: '直腿抬高', category: 'strength', sets: 3, reps: 10 },
      { id: 2, name: '踝泵运动', category: 'range', sets: 3, reps: 20 },
      { id: 3, name: '股四头肌收缩', category: 'strength', sets: 3, reps: 15 },
      { id: 4, name: '膝关节屈伸', category: 'range', sets: 3, reps: 15 },
      { id: 5, name: '平衡垫站立', category: 'balance', sets: 3, reps: '1分钟' }
    ],
    alarmTimer: null, // 闹钟定时器
    lastReminderDate: '' // 上次提醒日期
  },

  // 获取全局任务列表
  getTaskList() {
    return this.globalData.taskList;
  },

  onLaunch: function () {
    // 检查用户是否已填写伤情简历，决定入口页面
    const userInfo = wx.getStorageSync('userInfo');
    this.globalData.userInfo = userInfo;

    // 计算全局导航栏信息
    this.calculateNavBarInfo();

    // 初始化云开发（如果配置了环境ID）
    if (this.globalData.env && wx.cloud) {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }

    // 静默登录获取OpenID（云开发环境）
    this.silentLogin();

    // 检查更新
    this.checkUpdate();

    // 初始化闹钟
    this.initAlarm();
  },

  // 页面显示时检查闹钟
  onShow: function () {
    this.initAlarm();
  },

  // 页面隐藏时清除定时器
  onHide: function () {
    this.clearAlarm();
  },

  // 初始化闹钟
  initAlarm() {
    const reminderTime = wx.getStorageSync('reminderTime');
    if (!reminderTime) return;

    const today = this.formatDate(new Date());
    const lastDate = this.globalData.lastReminderDate;

    // 检查是否今天已提醒过
    if (lastDate === today) return;

    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(reminderTime)) return;

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);

    // 如果设定时间已过，设置明天的闹钟
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const delayMs = alarmTime - now;

    // 清除之前的定时器
    this.clearAlarm();

    // 设置新的定时器
    this.globalData.alarmTimer = setTimeout(() => {
      this.triggerReminder();
    }, delayMs);

    console.log('闹钟已设置:', alarmTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
  },

  // 触发提醒
  triggerReminder() {
    const today = this.formatDate(new Date());
    this.globalData.lastReminderDate = today;

    // 弹出提醒
    wx.showModal({
      title: '康复提醒',
      content: '该进行今日的康复训练了！',
      showCancel: false,
      confirmText: '知道了',
      success: () => {
        // 重新设置明天的闹钟
        this.initAlarm();
      }
    });
  },

  // 清除闹钟
  clearAlarm() {
    if (this.globalData.alarmTimer) {
      clearTimeout(this.globalData.alarmTimer);
      this.globalData.alarmTimer = null;
    }
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 计算导航栏信息（沉浸式方案：胶囊底部 + 2px间距）
  calculateNavBarInfo() {
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    const systemInfo = wx.getSystemInfoSync();

    // 状态栏高度
    const statusBarHeight = systemInfo.statusBarHeight;

    // 胶囊按钮信息
    const menuButton = {
      top: menuButtonInfo.top,
      left: menuButtonInfo.left,
      right: menuButtonInfo.right,
      width: menuButtonInfo.width,
      height: menuButtonInfo.height,
      bottom: menuButtonInfo.bottom
    };

    // 导航栏总高度 = 胶囊底部 + 2px间距
    const navBarHeight = menuButton.bottom + 2;

    this.globalData.navBarInfo = {
      statusBarHeight,
      menuButton,
      navBarHeight
    };

    console.log('导航栏信息:', this.globalData.navBarInfo);
  },

  // 获取导航栏信息
  getNavBarInfo() {
    if (!this.globalData.navBarInfo) {
      this.calculateNavBarInfo();
    }
    return this.globalData.navBarInfo;
  },

  // 检查用户是否已填写伤情简历
  checkUserProfile() {
    const userInfo = wx.getStorageSync('userInfo');
    this.globalData.userInfo = userInfo;
    return !!userInfo && !!userInfo.surgeryDate;
  },

  // 静默登录获取OpenID
  silentLogin() {
    if (!this.globalData.env) {
      console.log('未配置云开发环境，跳过静默登录');
      return;
    }
    
    // 先检查本地是否已有openId
    let openId = wx.getStorageSync('openId');
    
    if (!openId && wx.cloud) {
      // 调用云函数获取OpenID
      wx.cloud.callFunction({
        name: 'getOpenId',
        success: (res) => {
          if (res.result && res.result.openid) {
            openId = res.result.openid;
            wx.setStorageSync('openId', openId);
            this.globalData.openId = openId;
            console.log('获取OpenID成功:', openId);
          }
        },
        fail: (err) => {
          console.error('获取OpenID失败:', err);
        }
      });
    } else {
      this.globalData.openId = openId;
    }
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse && wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('有新版本可用');
        }
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(() => {
        wx.showModal({
          title: '更新失败',
          content: '新版本下载失败，请检查网络后重试',
          showCancel: false
        });
      });
    }
  },

  // 全局方法：更新用户信息
  updateUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  // 全局方法：获取用户信息
  getUserInfo() {
    return this.globalData.userInfo || wx.getStorageSync('userInfo');
  },

  // 全局方法：获取OpenID
  getOpenId() {
    return this.globalData.openId || wx.getStorageSync('openId');
  }
});

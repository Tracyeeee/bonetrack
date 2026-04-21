// app.js
App({
  globalData: {
    env: '', // 云开发环境ID
    userInfo: null,
    openId: '',
    navBarInfo: null // 全局导航栏信息
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

    // 静默登录获取OpenID（可选，需要云开发环境）
    // this.silentLogin();

    // 检查更新
    this.checkUpdate();
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

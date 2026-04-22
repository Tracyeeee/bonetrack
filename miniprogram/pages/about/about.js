// pages/about/about.js
const app = getApp();

Page({
  data: {
    navBarHeight: '88px'
  },

  onLoad() {
    this.initNavBar();
  },

  // 初始化导航栏
  initNavBar() {
    const navBarInfo = app.getNavBarInfo();
    const navBarHeight = navBarInfo ? navBarInfo.navBarHeight : 88;
    this.setData({
      navBarHeight: navBarHeight + 'px'
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 分享小程序
  onShareAppMessage() {
    return {
      title: 'Bonetrack 骨迹 - 你的沉浸式康复管理工具',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    };
  }
});

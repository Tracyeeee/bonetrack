// pages/checkin/checkin.js
const app = getApp();

Page({
  data: {
    // 当前展开的输入模块
    activeModule: '', // 'photo', 'angle', 'weight', ''
    
    // 照片相关
    photos: [],
    maxPhotos: 9,
    
    // 角度相关
    angle: '',
    angleOptions: [30, 45, 60, 75, 90, 100, 110, 120, 130],
    customAngle: '',
    
    // 负重相关
    weight: '',
    weightUnit: 'kg', // 'kg' or '斤'
    
    // 今日记录
    todayRecord: null,
    
    // 保存状态
    isSaving: false
  },

  onLoad() {
    this.initNavBar();
    this.loadTodayRecord();
  },

  // 初始化导航栏（从全局获取）
  initNavBar() {
    const navBarInfo = app.getNavBarInfo();
    const navBarHeight = navBarInfo ? navBarInfo.navBarHeight : 88;
    this.setData({
      navBarHeight: navBarHeight + 'px'
    });
  },

  onShow() {
    this.loadTodayRecord();
  },

  // 加载今日记录
  loadTodayRecord() {
    const today = this.formatDate(new Date());
    const record = wx.getStorageSync(`checkin_${today}`);
    if (record) {
      this.setData({
        todayRecord: record,
        photos: record.photos || [],
        angle: record.angle || '',
        weight: record.weight || ''
      });
    }
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 切换模块展开/收起
  toggleModule(e) {
    const module = e.currentTarget.dataset.module;
    this.setData({
      activeModule: this.data.activeModule === module ? '' : module
    });
  },

  // 选择照片
  choosePhoto() {
    if (this.data.photos.length >= this.data.maxPhotos) {
      wx.showToast({
        title: `最多${this.data.maxPhotos}张照片`,
        icon: 'none'
      });
      return;
    }

    const remaining = this.data.maxPhotos - this.data.photos.length;
    
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
        wx.chooseMedia({
          count: remaining,
          sourceType: sourceType,
          mediaType: ['image'],
          success: (res) => {
            const newPhotos = res.tempFiles.map(file => file.tempFilePath);
            this.setData({
              photos: [...this.data.photos, ...newPhotos].slice(0, this.data.maxPhotos)
            });
            this.saveRecord();
          }
        });
      }
    });
  },

  // 预览照片
  previewPhoto(e) {
    const { index } = e.currentTarget.dataset;
    wx.previewMedia({
      sources: this.data.photos.map((url, i) => ({
        url,
        type: 'image',
        poster: url
      })),
      current: index
    });
  },

  // 删除照片
  deletePhoto(e) {
    const { index } = e.currentTarget.dataset;
    const photos = this.data.photos;
    photos.splice(index, 1);
    this.setData({ photos });
    this.saveRecord();
  },

  // 选择角度
  selectAngle(e) {
    const angle = e.currentTarget.dataset.angle;
    this.setData({ angle });
    this.saveRecord();
  },

  // 输入自定义角度
  inputCustomAngle(e) {
    this.setData({ customAngle: e.detail.value });
  },

  // 确认自定义角度
  confirmCustomAngle() {
    const angle = parseInt(this.data.customAngle);
    if (angle && angle >= 0 && angle <= 180) {
      this.setData({ 
        angle: angle,
        customAngle: ''
      });
      this.saveRecord();
      wx.showToast({
        title: '角度已记录',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '请输入0-180之间的角度',
        icon: 'none'
      });
    }
  },

  // 输入角度
  inputAngle(e) {
    this.setData({ angle: e.detail.value });
  },

  // 选择负重
  selectWeight(e) {
    const weight = e.currentTarget.dataset.weight;
    this.setData({ weight });
    this.saveRecord();
  },

  // 输入负重
  inputWeight(e) {
    this.setData({ weight: e.detail.value });
    this.saveRecord();
  },

  // 切换负重单位
  toggleWeightUnit() {
    const newUnit = this.data.weightUnit === 'kg' ? '斤' : 'kg';
    let weight = parseFloat(this.data.weight);
    
    if (weight) {
      if (newUnit === '斤') {
        weight = weight * 2; // kg转斤
      } else {
        weight = weight / 2; // 斤转kg
      }
    }
    
    this.setData({
      weightUnit: newUnit,
      weight: weight ? weight.toFixed(1) : ''
    });
    this.saveRecord();
  },

  // 快速选择负重
  quickSelectWeight(e) {
    const weight = e.currentTarget.dataset.weight;
    this.setData({ weight });
    this.saveRecord();
  },

  // 保存记录
  saveRecord() {
    const today = this.formatDate(new Date());
    const record = {
      date: today,
      photos: this.data.photos,
      angle: this.data.angle,
      weight: this.data.weight,
      weightUnit: this.data.weightUnit,
      updatedAt: Date.now()
    };
    
    wx.setStorageSync(`checkin_${today}`, record);
    this.setData({ todayRecord: record });
  },

  // 完成打卡
  completeCheckIn() {
    if (!this.data.angle && !this.data.weight && this.data.photos.length === 0) {
      wx.showToast({
        title: '请至少录入一项数据',
        icon: 'none'
      });
      return;
    }

    this.saveRecord();
    
    wx.showModal({
      title: '打卡成功',
      content: '今日康复记录已保存，继续加油！',
      showCancel: false,
      confirmText: '知道了',
      success: () => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },

  // 查看历史记录
  viewHistory() {
    wx.switchTab({
      url: '/pages/calendar/calendar'
    });
  },

  // 获取用户信息
  getUserInfo() {
    return wx.getStorageSync('userInfo') || {};
  }
});

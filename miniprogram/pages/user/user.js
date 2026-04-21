// pages/user/user.js
const app = getApp();

Page({
  data: {
    // 用户信息
    userInfo: {
      nickname: '康复勇士',
      avatar: '',
      injuryPart: '膝关节',
      injuryType: 'ACL重建',
      surgeryDate: '',
      daysSinceSurgery: '--',
      isAuthorized: false
    },

    // 统计数据
    stats: {
      totalDays: 45,
      checkInDays: 38,
      totalPhotos: 156,
      consecutiveDays: 12
    },

    // 康复进度
    progress: {
      angleProgress: [
        { day: 1, angle: 30 },
        { day: 15, angle: 60 },
        { day: 30, angle: 90 },
        { day: 45, angle: 120 }
      ],
      latestAngle: 120,
      targetAngle: 135,
      targetDate: '2024-06-15'
    },

    // 成就徽章
    badges: [
      { id: 1, name: '坚持一周', icon: '🏅', unlocked: true },
      { id: 2, name: '康复达人', icon: '🎖️', unlocked: true },
      { id: 3, name: '角度突破100°', icon: '📐', unlocked: true },
      { id: 4, name: '拍照达人', icon: '📸', unlocked: true },
      { id: 5, name: '坚持一月', icon: '🏆', unlocked: false },
      { id: 6, name: '重返运动', icon: '🎯', unlocked: false }
    ],

    // 菜单项
    menuItems: [
      { id: 'profile', name: '编辑伤情简历', icon: '📝', arrow: true },
      { id: 'reminder', name: '提醒设置', icon: '⏰', arrow: true },
      { id: 'about', name: '关于我们', icon: 'ℹ️', arrow: true },
      { id: 'feedback', name: '意见反馈', icon: '💬', arrow: true }
    ]
  },

  onLoad() {
    this.initNavBar();
    this.loadUserInfo();
    this.loadStats();
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
    this.loadUserInfo();
    this.loadStats();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      let daysDiff = '--';

      if (userInfo.surgeryDate) {
        const surgeryDate = new Date(userInfo.surgeryDate);
        const today = new Date();
        const diff = Math.floor((today - surgeryDate) / (1000 * 60 * 60 * 24));
        if (!isNaN(diff) && diff >= 0) {
          daysDiff = diff;
        }
      }

      this.setData({
        userInfo: {
          nickname: userInfo.nickname || '康复勇士',
          avatar: userInfo.avatar || '',
          injuryPart: userInfo.injuryPart || '膝关节',
          injuryType: userInfo.injuryType || 'ACL重建',
          surgeryDate: userInfo.surgeryDate || '',
          daysSinceSurgery: daysDiff,
          isAuthorized: !!(userInfo.nickname)
        },
        'stats.totalDays': daysDiff === '--' ? 45 : daysDiff
      });
    }
  },

  // 加载统计数据
  loadStats() {
    // 计算打卡天数
    let checkInDays = 0;
    let totalPhotos = 0;
    let consecutiveDays = 0;
    
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      const record = wx.getStorageSync(`checkin_${dateStr}`);
      
      if (record) {
        checkInDays++;
        if (record.photos) {
          totalPhotos += record.photos.length;
        }
        if (i === 0 || consecutiveDays > 0) {
          consecutiveDays++;
        }
      } else if (i > 0) {
        consecutiveDays = 0;
      }
    }

    this.setData({
      stats: {
        ...this.data.stats,
        checkInDays,
        totalPhotos,
        consecutiveDays
      }
    });
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 编辑伤情简历
  editProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  // 菜单点击
  onMenuTap(e) {
    const { id } = e.currentTarget.dataset;
    
    switch (id) {
      case 'profile':
        this.editProfile();
        break;
      case 'reminder':
        this.setReminder();
        break;
      case 'about':
        this.showAbout();
        break;
      case 'feedback':
        this.openFeedback();
        break;
    }
  },

  // 设置提醒
  setReminder() {
    wx.showModal({
      title: '提醒设置',
      editable: true,
      placeholderText: '输入每日提醒时间（如：20:00）',
      success: (res) => {
        if (res.confirm && res.content) {
          // 保存提醒时间
          wx.setStorageSync('reminderTime', res.content);
          wx.showToast({
            title: '提醒已设置',
            icon: 'success'
          });
        }
      }
    });
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于 Bonetrack 骨迹',
      content: '版本：1.0.0\n\n一款专为术后及运动损伤人群设计的沉浸式康复管理工具。\n\n通过结构化记录、可视化时间轴、五大核心模块及强力监督机制，将枯燥的康复过程数据化、游戏化。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 意见反馈
  openFeedback() {
    wx.showModal({
      title: '意见反馈',
      editable: true,
      placeholderText: '请输入您的宝贵意见...',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.showToast({
            title: '感谢您的反馈',
            icon: 'success'
          });
        }
      }
    });
  },

  // 查看角度趋势
  viewAngleTrend() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 分享小程序
  onShareAppMessage() {
    return {
      title: 'Bonetrack 骨迹 - 你的康复管理助手',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    };
  },

  // 返回上一页
  goBack() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});

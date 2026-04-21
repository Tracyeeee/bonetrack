// pages/index/index.js
const app = getApp();

Page({
  data: {
    // 用户康复信息
    userInfo: {
      daysSinceSurgery: '--', // 术后天数，默认为 --
      injuryPart: '膝关节',
      injuryType: 'ACL重建',
      avatar: '',
      nickname: '康复勇士'
    },

    // 今日打卡状态
    checkInStatus: {
      hasCheckedIn: false,
      checkedInTasks: ['拍照', '角度记录'],
      todayTasks: [
        { id: 1, name: '直腿抬高', category: 'strength', completed: false, sets: 3, reps: 10, icon: '🦵' },
        { id: 2, name: '踝泵运动', category: 'range', completed: false, sets: 3, reps: 20, icon: '🦶' },
        { id: 3, name: '股四头肌收缩', category: 'strength', completed: false, sets: 3, reps: 15, icon: '💪' },
        { id: 4, name: '膝关节屈伸', category: 'range', completed: false, sets: 3, reps: 15, icon: '🔄' },
        { id: 5, name: '平衡垫站立', category: 'balance', completed: false, sets: 3, reps: '1分钟', icon: '⚖️' }
      ]
    },

    // 统计数据
    stats: {
      totalDays: 45,
      checkedInDays: 38,
      completionRate: 84,
      latestAngle: 120
    },

    // 快捷记录弹窗
    showModal: false,
    currentRecordType: '', // 'angle', 'weight', ''
    inputAngle: '',
    anglePhoto: '',
    inputWeight: '',
    weightUnit: 'kg',

    // 新增任务弹窗
    showAddTask: false,
    newTask: {
      name: '',
      sets: '',
      reps: '',
      startDate: '',
      endDate: '',
      category: 'custom',
      icon: '🏋️'
    }
  },

  onLoad() {
    this.initNavBar();
    this.loadUserInfo();
    this.checkTodayStatus();
    this.loadCheckInStatus();
    this.calculateScrollHeight();
  },

  // 计算滚动区域高度
  calculateScrollHeight() {
    const sysInfo = wx.getSystemInfoSync();
    const navBarInfo = app.getNavBarInfo();
    
    // 安全检查：如果 navBarInfo 为 null，使用默认值
    const navBarHeight = navBarInfo ? navBarInfo.navBarHeight : sysInfo.statusBarHeight + 44;
    const tabBarHeight = 50; // tabBar 高度约 50px
    const contentHeight = sysInfo.windowHeight - navBarHeight - tabBarHeight;
    
    this.setData({
      scrollHeight: contentHeight > 0 ? contentHeight : sysInfo.windowHeight - 140
    });
  },

  // 初始化导航栏（从全局获取）
  initNavBar() {
    const navBarInfo = app.getNavBarInfo();
    const navBarHeight = navBarInfo ? navBarInfo.navBarHeight : 88;
    this.setData({
      navBarHeight: navBarHeight + 'px'
    });
  },

  // 显示快捷记录弹窗
  showQuickRecordModal() {
    this.setData({
      showModal: true,
      currentRecordType: '',
      inputAngle: '',
      anglePhoto: '',
      inputWeight: '',
      weightUnit: 'kg'
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false
    });
  },

  // 阻止事件冒泡
  preventBubble() {
    // 空方法，用于阻止点击弹窗内容时关闭
  },

  // 选择记录类型
  selectRecordType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentRecordType: type
    });
  },

  // 取消记录
  cancelRecord() {
    this.setData({
      showModal: false,
      currentRecordType: '',
      inputAngle: '',
      anglePhoto: '',
      inputWeight: ''
    });
  },

  // 角度输入
  onAngleInput(e) {
    this.setData({
      inputAngle: e.detail.value
    });
  },

  // 上传角度照片
  uploadAnglePhoto() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
        wx.chooseMedia({
          count: 1,
          sourceType: sourceType,
          mediaType: ['image'],
          success: (res) => {
            if (res.tempFiles && res.tempFiles.length > 0) {
              this.setData({
                anglePhoto: res.tempFiles[0].tempFilePath
              });
            }
          }
        });
      }
    });
  },

  // 保存角度记录
  saveAngleRecord() {
    const angle = this.data.inputAngle;
    const photo = this.data.anglePhoto;

    if (!angle && !photo) {
      wx.showToast({
        title: '请输入角度或上传照片',
        icon: 'none'
      });
      return;
    }

    const today = this.formatDate(new Date());
    const record = wx.getStorageSync(`checkin_${today}`) || {};
    
    if (angle) {
      record.angle = angle;
    }
    if (photo) {
      record.anglePhotos = record.anglePhotos || [];
      record.anglePhotos.push(photo);
    }
    record.updatedAt = Date.now();

    wx.setStorageSync(`checkin_${today}`, record);
    
    wx.showToast({
      title: '角度记录已保存',
      icon: 'success'
    });

    this.cancelRecord();
    this.generateTimelineData();
  },

  // 负重输入
  onWeightInput(e) {
    this.setData({
      inputWeight: e.detail.value
    });
  },

  // 设置重量单位
  setWeightUnit(e) {
    const unit = e.currentTarget.dataset.unit;
    this.setData({
      weightUnit: unit
    });
  },

  // 保存负重记录
  saveWeightRecord() {
    const weight = this.data.inputWeight;
    const unit = this.data.weightUnit;

    if (!weight) {
      wx.showToast({
        title: '请输入承重',
        icon: 'none'
      });
      return;
    }

    const today = this.formatDate(new Date());
    const record = wx.getStorageSync(`checkin_${today}`) || {};
    
    record.weight = weight;
    record.weightUnit = unit;
    record.updatedAt = Date.now();

    wx.setStorageSync(`checkin_${today}`, record);
    
    wx.showToast({
      title: '负重记录已保存',
      icon: 'success'
    });

    this.cancelRecord();
    this.updateStats();
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadCheckInStatus();
    this.updateStats();
  },

  // 切换任务完成状态
  toggleTask(e) {
    const taskId = e.currentTarget.dataset.taskId;
    const tasks = this.data.checkInStatus.todayTasks;

    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === taskId) {
        tasks[i].completed = !tasks[i].completed;
        break;
      }
    }

    this.setData({
      'checkInStatus.todayTasks': tasks
    });

    // 保存到任务存储（与任务页面共享）
    const today = this.formatDate(new Date());
    const tasksToSave = tasks.map(task => ({
      id: task.id,
      completed: task.completed
    }));
    wx.setStorageSync(`tasks_${today}`, tasksToSave);
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.surgeryDate) {
      const surgeryDate = new Date(userInfo.surgeryDate);
      const today = new Date();
      const daysDiff = Math.floor((today - surgeryDate) / (1000 * 60 * 60 * 24));

      // 检查日期是否有效
      const isValidDate = !isNaN(daysDiff) && daysDiff >= 0;

      this.setData({
        userInfo: {
          ...this.data.userInfo,
          daysSinceSurgery: isValidDate ? daysDiff : '--',
          injuryPart: userInfo.injuryPart,
          injuryType: userInfo.injuryType,
          avatar: userInfo.avatar || '',
          nickname: userInfo.nickname || '康复勇士'
        }
      });
    }
  },

  // 更新统计数据
  updateStats() {
    let totalDays = this.data.stats.totalDays;
    let checkedInDays = 0;
    
    // 统计过去 totalDays 天的打卡记录
    for (let i = 0; i < totalDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      const record = wx.getStorageSync(`checkin_${dateStr}`);
      if (record && (record.angle || record.weight || (record.photos && record.photos.length > 0))) {
        checkedInDays++;
      }
    }

    const completionRate = totalDays > 0 ? Math.round((checkedInDays / totalDays) * 100) : 0;
    
    this.setData({
      stats: {
        ...this.data.stats,
        checkedInDays,
        completionRate
      }
    });
  },

  // 检查今日状态
  checkTodayStatus() {
    const today = this.formatDate(new Date());
    const record = wx.getStorageSync(`checkin_${today}`);
    
    if (record) {
      this.setData({
        'checkInStatus.hasCheckedIn': true,
        'checkInStatus.checkedInTasks': record.tasks || []
      });
    }
  },

  // 加载打卡状态
  loadCheckInStatus() {
    const today = this.formatDate(new Date());
    const record = wx.getStorageSync(`checkin_${today}`);

    // 从任务存储中加载今日任务（与任务页面保持一致）
    const todayTasksData = wx.getStorageSync(`tasks_${today}`);
    let todayTasks = [
      { id: 1, name: '直腿抬高', category: 'strength', completed: false, sets: 3, reps: 10, icon: '🦵' },
      { id: 2, name: '踝泵运动', category: 'range', completed: false, sets: 3, reps: 20, icon: '🦶' },
      { id: 3, name: '股四头肌收缩', category: 'strength', completed: false, sets: 3, reps: 15, icon: '💪' },
      { id: 4, name: '膝关节屈伸', category: 'range', completed: false, sets: 3, reps: 15, icon: '🔄' },
      { id: 5, name: '平衡垫站立', category: 'balance', completed: false, sets: 3, reps: '1分钟', icon: '⚖️' }
    ];

    // 加载已保存的任务完成状态
    if (todayTasksData && todayTasksData.length > 0) {
      todayTasks = todayTasks.map(task => {
        const saved = todayTasksData.find(s => s.id === task.id);
        return saved ? { ...task, completed: saved.completed } : task;
      });
    }

    // 加载自定义任务（有效期判断）
    const customTasks = wx.getStorageSync('customTasks') || [];
    const validCustomTasks = customTasks.filter(task => {
      return task.startDate && task.endDate &&
             task.startDate <= today && task.endDate >= today;
    });

    // 合并已保存的自定义任务状态
    if (validCustomTasks.length > 0) {
      validCustomTasks.forEach(savedTask => {
        const existing = todayTasks.find(t => t.id === savedTask.id);
        if (existing) {
          existing.completed = savedTask.completed;
        } else {
          todayTasks.push(savedTask);
        }
      });
    }

    if (record) {
      this.setData({
        'checkInStatus.hasCheckedIn': true,
        'checkInStatus.checkedInTasks': record.tasks || [],
        'checkInStatus.todayTasks': todayTasks
      });
    } else {
      this.setData({
        'checkInStatus.todayTasks': todayTasks
      });
    }
  },

  // 跳转到打卡中心
  goToCheckIn() {
    wx.navigateTo({
      url: '/pages/checkin/checkin'
    });
  },

  // 跳转到任务页面
  goToTasks() {
    wx.switchTab({
      url: '/pages/tasks/tasks'
    });
  },

  // 跳转到日历页面
  goToCalendar() {
    wx.switchTab({
      url: '/pages/calendar/calendar'
    });
  },

  // 跳转到个人中心
  goToUser() {
    wx.navigateTo({
      url: '/pages/user/user'
    });
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 显示新增任务弹窗
  showAddTaskModal() {
    const today = this.formatDate(new Date());
    this.setData({
      showAddTask: true,
      newTask: {
        name: '',
        sets: '',
        reps: '',
        startDate: today,
        endDate: today,
        category: 'custom',
        icon: '🏋️'
      }
    });
  },

  // 隐藏新增任务弹窗
  hideAddTaskModal() {
    this.setData({ showAddTask: false });
  },

  // 输入训练动作名称
  onTaskNameInput(e) {
    this.setData({
      'newTask.name': e.detail.value
    });
  },

  // 输入组数
  onTaskSetsInput(e) {
    this.setData({
      'newTask.sets': e.detail.value
    });
  },

  // 输入每组次数/时长
  onTaskRepsInput(e) {
    this.setData({
      'newTask.reps': e.detail.value
    });
  },

  // 选择开始日期
  onStartDateChange(e) {
    this.setData({
      'newTask.startDate': e.detail.value
    });
  },

  // 选择结束日期
  onEndDateChange(e) {
    this.setData({
      'newTask.endDate': e.detail.value
    });
  },

  // 添加任务
  addTask() {
    const { name, sets, reps, startDate, endDate } = this.data.newTask;

    // 验证必填项
    if (!name || !name.trim()) {
      wx.showToast({ title: '请输入训练动作', icon: 'none' });
      return;
    }
    if (!sets || !sets.trim()) {
      wx.showToast({ title: '请输入组数', icon: 'none' });
      return;
    }
    if (!reps || !reps.trim()) {
      wx.showToast({ title: '请输入每组次数或时长', icon: 'none' });
      return;
    }
    if (!startDate || !endDate) {
      wx.showToast({ title: '请选择训练日期', icon: 'none' });
      return;
    }

    // 创建新任务
    const newTaskItem = {
      id: Date.now(),
      name: name.trim(),
      sets: parseInt(sets) || 3,
      reps: reps.trim(),
      completed: false,
      category: 'custom',
      icon: '🏋️',
      startDate: startDate,
      endDate: endDate
    };

    // 添加到今日任务列表
    const tasks = [...this.data.checkInStatus.todayTasks, newTaskItem];
    this.setData({
      'checkInStatus.todayTasks': tasks,
      showAddTask: false
    });

    // 保存到本地存储
    this.saveCustomTasks();

    wx.showToast({ title: '任务添加成功', icon: 'success' });
  },

  // 保存自定义任务到本地存储
  saveCustomTasks() {
    const customTasks = this.data.checkInStatus.todayTasks.filter(t => t.category === 'custom');
    wx.setStorageSync('customTasks', customTasks);
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

// pages/calendar/calendar.js
const app = getApp();

Page({
  data: {
    // 当前显示的年月
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    
    // 日历数据
    days: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    
    // 日历记录
    records: {},

    // 选中的日期记录详情
    selectedDate: null,
    selectedRecord: null,
    showRecordDetail: false,
    selectedTasks: [], // 选中日历的任务列表
    selectedAnglePhotos: [], // 选中的角度照片列表

    // 照片预览相关
    previewPhotoList: [],
    currentPreviewIndex: 0,
    showPhotoViewer: false,

    // 记录编辑相关
    isEditingRecord: false,
    editingAngle: '',
    editingWeight: '',
    editingWeightUnit: 'kg',

    // 用户信息
    userInfo: {
      surgeryDate: '2024-01-15',
      daysSinceSurgery: 45
    },
    
    // 统计数据
    stats: {
      totalDays: 45,
      checkedInDays: 38,
      completionRate: 84
    },

    // 动作库分类
    categories: [
      { id: 'all', name: '全部', icon: '📋' },
      { id: 'range', name: '关节活动', icon: '🦵' },
      { id: 'strength', name: '力量训练', icon: '💪' },
      { id: 'balance', name: '平衡训练', icon: '⚖️' },
      { id: 'cardio', name: '有氧训练', icon: '🏃' }
    ],
    currentCategory: 'all',

    // 动作库
    exerciseLibrary: [
      {
        id: 1,
        name: '直腿抬高',
        category: 'strength',
        description: '仰卧，伸直患侧腿并抬高约30度，保持5秒后放下',
        sets: 3,
        reps: '10-15次',
        icon: '🦵',
        difficulty: '初级',
        tips: ['保持腰部贴床', '不要憋气', '循序渐进增加次数']
      },
      {
        id: 2,
        name: '踝泵运动',
        category: 'range',
        description: '平卧或坐位，反复做踝关节的背屈和跖屈动作',
        sets: 3,
        reps: '20-30次',
        icon: '🦶',
        difficulty: '初级',
        tips: ['动作要缓慢', '每个方向保持2-3秒']
      },
      {
        id: 3,
        name: '股四头肌等长收缩',
        category: 'strength',
        description: '仰卧，患侧大腿肌肉用力收紧，膝盖下方垫毛巾卷',
        sets: 3,
        reps: '10-15次',
        icon: '💪',
        difficulty: '初级',
        tips: ['保持5-10秒', '感受肌肉发力']
      },
      {
        id: 4,
        name: '膝关节主动屈伸',
        category: 'range',
        description: '坐位或仰卧，主动屈伸膝关节至疼痛可忍受的范围',
        sets: 3,
        reps: '15-20次',
        icon: '🔄',
        difficulty: '中级',
        tips: ['不要强迫自己', '循序渐进增加角度']
      },
      {
        id: 5,
        name: '平衡垫单腿站立',
        category: 'balance',
        description: '站在平衡垫上，保持平衡，逐渐增加站立时间',
        sets: 3,
        reps: '1-2分钟',
        icon: '⚖️',
        difficulty: '中级',
        tips: ['从双手扶椅子开始', '循序渐进脱离辅助']
      },
      {
        id: 6,
        name: '靠墙静蹲',
        category: 'strength',
        description: '背靠墙，双脚与肩同宽，慢慢下蹲至大腿与地面平行',
        sets: 3,
        reps: '30-60秒',
        icon: '🧱',
        difficulty: '高级',
        tips: ['膝盖不超过脚尖', '保持核心收紧']
      }
    ],

    // 当前查看的动作详情
    currentExercise: null,
    showExerciseDetail: false,

    // 事项相关
    selectedDateInfo: null, // 当前选中日期的详细信息（是否未来、是否今日）
    isAddingEvent: false,
    newEventText: '',
    editingEvent: '',
    selectedQuickTag: '',
    quickTags: ['复诊', '换药', '康复评估', '复查', '游泳', '理疗']
  },

  onLoad(options) {
    this.initNavBar();
    this.initUserInfo();
    this.generateCalendar();
    this.loadRecords();
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
    this.initUserInfo();
    this.loadRecords();
    this.generateCalendar();
  },

  // 初始化用户信息
  initUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && (userInfo.surgeryDate || userInfo.injuryDate)) {
      const targetDate = userInfo.surgeryDate || userInfo.injuryDate;
      const surgeryDate = new Date(targetDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - surgeryDate) / (1000 * 60 * 60 * 24));

      this.setData({
        userInfo: {
          surgeryDate: userInfo.surgeryDate || userInfo.injuryDate,
          daysSinceSurgery: daysDiff
        }
      });
      this.updateStats(this.data.records);
    }
  },

  // 生成日历数据
  generateCalendar() {
    const { currentYear, currentMonth } = this.data;
    const days = [];

    // 获取当月第一天和最后一天
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekDay = firstDay.getDay();

    // 获取已删除的任务ID列表
    const deletedTaskIds = wx.getStorageSync('deletedTaskIds') || [];

    // 添加空白（星期几的偏移）
    for (let i = 0; i < startWeekDay; i++) {
      days.push({ day: '', empty: true });
    }

    // 添加日期
    const today = new Date();
    const todayStr = this.formatDate(today);

    // 从全局任务列表获取任务数量（过滤已删除）
    const globalTaskList = app.getTaskList();
    const totalTasks = globalTaskList.filter(task => !deletedTaskIds.includes(task.id)).length;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dateStr = this.formatDate(date);
      const record = this.data.records[dateStr];

      // 检查任务完成状态（考虑已删除的任务）
      const tasksData = wx.getStorageSync(`tasks_${dateStr}`);
      let allTasksCompleted = false;
      if (tasksData && tasksData.length > 0 && totalTasks > 0) {
        // 只计算未删除任务的完成情况
        const completedTasks = tasksData.filter(task => !deletedTaskIds.includes(task.id) && task.completed).length;
        allTasksCompleted = completedTasks === totalTasks;
      }

      // 检查角度照片（包括 anglePhotos 和 photos）
      const hasAnglePhoto = record && (
        (record.anglePhotos && record.anglePhotos.length > 0) ||
        (record.photos && record.photos.length > 0)
      );

      days.push({
        day: day,
        date: dateStr,
        isToday: dateStr === todayStr,
        hasRecord: !!record,
        hasPhoto: record && record.photos && record.photos.length > 0,
        hasAnglePhoto: hasAnglePhoto,
        angle: record ? record.angle : '',
        tasks: record && record.tasks ? record.tasks : [],
        event: record && record.event ? this.truncateEvent(record.event) : '',
        isFuture: date > today,
        allTasksCompleted: allTasksCompleted
      });
    }

    this.setData({ days });
  },

  // 截断事项文本用于显示
  truncateEvent(event) {
    if (event.length > 4) {
      return event.substring(0, 4) + '...';
    }
    return event;
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 加载所有记录
  loadRecords() {
    const records = {};
    
    // 模拟已有记录数据
    const mockRecords = {
      '2024-01-20': { angle: 45, weight: '5', photos: [] },
      '2024-01-21': { angle: 50, weight: '7.5', photos: [] },
      '2024-01-22': { angle: 55, weight: '10', photos: [] },
      '2024-02-01': { angle: 70, weight: '12', photos: [] },
      '2024-02-05': { angle: 80, weight: '15', photos: [] },
      '2024-02-10': { angle: 90, weight: '18', photos: [] },
      '2024-02-15': { angle: 100, weight: '20', photos: [] },
      '2024-02-20': { angle: 105, weight: '22', photos: [] },
      '2024-02-25': { angle: 110, weight: '25', photos: [] },
      '2024-03-01': { angle: 115, weight: '25', photos: [] },
      '2024-03-05': { angle: 118, weight: '27', photos: [] },
      '2024-03-10': { angle: 120, weight: '30', photos: [] }
    };
    
    // 尝试从存储加载
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      const record = wx.getStorageSync(`checkin_${dateStr}`);
      if (record) {
        records[dateStr] = record;
      } else if (mockRecords[dateStr]) {
        records[dateStr] = mockRecords[dateStr];
      }
    }
    
    this.setData({ records });
    this.updateStats(records);
  },

  // 更新统计数据
  updateStats(records) {
    const recordCount = Object.keys(records).length;
    const daysSinceSurgery = this.data.userInfo.daysSinceSurgery;

    this.setData({
      stats: {
        totalDays: daysSinceSurgery > 0 ? daysSinceSurgery : 0,
        checkedInDays: recordCount,
        completionRate: daysSinceSurgery > 0 ? Math.round((recordCount / daysSinceSurgery) * 100) : 0
      }
    });
  },

  // 上个月
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentMonth = 12;
      currentYear--;
    } else {
      currentMonth--;
    }
    this.setData({ currentYear, currentMonth });
    this.generateCalendar();
  },

  // 下个月
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      currentMonth = 1;
      currentYear++;
    } else {
      currentMonth++;
    }
    this.setData({ currentYear, currentMonth });
    this.generateCalendar();
  },

  // 选择日期查看详情
  selectDate(e) {
    const { date } = e.currentTarget.dataset;
    if (!date) return;

    const today = new Date();
    const selectedDate = new Date(date);
    const todayStr = this.formatDate(today);

    const record = this.data.records[date];

    // 获取已删除的任务ID列表
    const deletedTaskIds = wx.getStorageSync('deletedTaskIds') || [];

    // 加载当日任务数据
    const tasksData = wx.getStorageSync(`tasks_${date}`);
    // 从全局任务列表获取任务，并过滤已删除的任务
    const globalTaskList = app.getTaskList();
    const defaultTasks = globalTaskList
      .filter(task => !deletedTaskIds.includes(task.id))
      .map(task => ({
        id: task.id,
        name: task.name,
        category: task.category,
        sets: task.sets,
        reps: task.reps,
        completed: false
      }));

    // 加载自定义任务
    const customTasks = wx.getStorageSync('customTasks') || [];
    const validCustomTasks = customTasks
      .filter(task => !deletedTaskIds.includes(task.id) &&
             task.startDate && task.endDate &&
             task.startDate <= date && task.endDate >= date)
      .map(task => ({
        id: task.id,
        name: task.name,
        category: task.category,
        sets: task.sets,
        reps: task.reps,
        completed: false
      }));

    let selectedTasks = [...defaultTasks, ...validCustomTasks];
    if (tasksData && tasksData.length > 0) {
      selectedTasks = selectedTasks.map(task => {
        const saved = tasksData.find(s => s.id === task.id);
        return saved ? { ...task, completed: saved.completed } : task;
      });
    }

    // 获取角度照片（兼容 anglePhotos 和 photos）
    const anglePhotos = record ? (record.anglePhotos || record.photos || []) : [];

    this.setData({
      selectedDate: date,
      selectedRecord: record || null,
      selectedAnglePhotos: anglePhotos,
      showRecordDetail: true,
      isEditingRecord: false,
      isAddingEvent: false,
      selectedDateInfo: {
        isFuture: selectedDate > today,
        isToday: date === todayStr
      },
      selectedTasks: selectedTasks,
      newEventText: '',
      editingEvent: record && record.event ? record.event : '',
      editingAngle: record && record.angle ? String(record.angle) : '',
      editingWeight: record && record.weight ? String(record.weight) : '',
      selectedQuickTag: ''
    });
  },

  // 关闭详情
  closeRecordDetail() {
    this.setData({
      selectedDate: null,
      selectedRecord: null,
      selectedAnglePhotos: [],
      showRecordDetail: false,
      isEditingRecord: false,
      isAddingEvent: false,
      selectedDateInfo: null,
      selectedTasks: [],
      newEventText: '',
      editingEvent: '',
      editingAngle: '',
      editingWeight: '',
      selectedQuickTag: '',
      showPhotoViewer: false,
      previewPhotoList: [],
      currentPreviewIndex: 0
    });
  },

  // 进入编辑模式
  enterEditMode() {
    const record = this.data.selectedRecord;
    this.setData({
      isEditingRecord: true,
      isAddingEvent: false,
      editingAngle: record && record.angle ? String(record.angle) : '',
      editingWeight: record && record.weight ? String(record.weight) : '',
      editingEvent: record && record.event ? record.event : '',
      editingWeightUnit: record ? record.weightUnit || 'kg' : 'kg'
    });
  },

  // 取消编辑
  cancelEdit() {
    this.setData({
      isEditingRecord: false,
      isAddingEvent: false,
      editingAngle: '',
      editingWeight: '',
      editingEvent: ''
    });
  },

  // 进入添加事项模式
  enterAddEventMode() {
    this.setData({
      isAddingEvent: true,
      isEditingRecord: false,
      newEventText: this.data.editingEvent || '',
      selectedQuickTag: ''
    });
  },

  // 取消添加事项
  cancelAddEvent() {
    this.setData({
      isAddingEvent: false,
      newEventText: '',
      selectedQuickTag: ''
    });
  },

  // 事项输入
  onEventInput(e) {
    this.setData({
      newEventText: e.detail.value,
      selectedQuickTag: ''
    });
  },

  // 选择快捷标签
  selectQuickTag(e) {
    const tag = e.currentTarget.dataset.tag;
    this.setData({
      selectedQuickTag: tag,
      newEventText: tag
    });
  },

  // 保存事项
  saveEvent() {
    const { selectedDate, newEventText, editingAngle, editingWeight } = this.data;

    if (!newEventText || !newEventText.trim()) {
      wx.showToast({ title: '请输入事项内容', icon: 'none' });
      return;
    }

    const records = { ...this.data.records };
    const existingRecord = records[selectedDate] || {};

    records[selectedDate] = {
      ...existingRecord,
      event: newEventText.trim(),
      angle: editingAngle ? parseFloat(editingAngle) : existingRecord.angle || null,
      weight: editingWeight ? editingWeight : existingRecord.weight || null,
      weightUnit: existingRecord.weightUnit || 'kg',
      photos: existingRecord.photos || [],
      updatedAt: new Date().toISOString()
    };

    // 保存到本地存储
    wx.setStorageSync(`checkin_${selectedDate}`, records[selectedDate]);

    this.setData({
      records,
      selectedRecord: records[selectedDate],
      isAddingEvent: false,
      showRecordDetail: false,
      selectedDateInfo: null
    });

    wx.showToast({ title: '保存成功', icon: 'success' });
    this.generateCalendar();
  },

  // 编辑角度输入
  onAngleInput(e) {
    const value = e.detail.value;
    // 只允许数字和小数点
    const filtered = value.replace(/[^\d.]/g, '');
    this.setData({ editingAngle: filtered });
  },

  // 编辑负重输入
  onWeightInput(e) {
    const value = e.detail.value;
    const filtered = value.replace(/[^\d.]/g, '');
    this.setData({ editingWeight: filtered });
  },

  // 切换负重单位
  toggleWeightUnit() {
    const currentUnit = this.data.editingWeightUnit;
    const newUnit = currentUnit === 'kg' ? 'kg' : 'kg'; // 保持 kg
    this.setData({ editingWeightUnit: 'kg' });
  },

  // 保存编辑的记录
  saveRecordEdit() {
    const { selectedDate, editingAngle, editingWeight, editingWeightUnit, editingEvent } = this.data;

    if (!editingAngle && !editingWeight && !editingEvent) {
      wx.showToast({ title: '请至少填写一项', icon: 'none' });
      return;
    }

    const newRecord = {
      angle: editingAngle ? parseFloat(editingAngle) : null,
      weight: editingWeight ? editingWeight : null,
      weightUnit: editingWeightUnit || 'kg',
      event: editingEvent ? editingEvent.trim() : null,
      updatedAt: new Date().toISOString()
    };

    // 更新记录
    const records = { ...this.data.records };
    const existingRecord = records[selectedDate] || {};

    records[selectedDate] = {
      ...existingRecord,
      ...newRecord,
      photos: existingRecord.photos || []
    };

    // 保存到本地存储
    wx.setStorageSync(`checkin_${selectedDate}`, records[selectedDate]);

    this.setData({
      records,
      selectedRecord: records[selectedDate],
      isEditingRecord: false,
      showRecordDetail: false,
      selectedDateInfo: null
    });

    wx.showToast({ title: '保存成功', icon: 'success' });
    this.generateCalendar();
  },

  // 删除当日记录
  deleteRecord() {
    const { selectedDate } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${selectedDate} 的记录吗？`,
      confirmColor: '#FF4D00',
      success: (res) => {
        if (res.confirm) {
          const records = { ...this.data.records };
          delete records[selectedDate];
          
          // 删除本地存储
          wx.removeStorageSync(`checkin_${selectedDate}`);
          
          this.setData({
            records,
            selectedRecord: null,
            showRecordDetail: false,
            isEditingRecord: false
          });
          
          wx.showToast({ title: '已删除', icon: 'success' });
          this.generateCalendar();
        }
      }
    });
  },

  // 阻止事件冒泡
  preventBubble() {
    // 空函数，用于阻止事件冒泡
  },

  // 查看完整时间轴
  viewFullTimeline() {
    wx.navigateTo({
      url: '/pages/index/index'
    });
  },

  // 跳转到打卡
  goToCheckIn() {
    wx.navigateTo({
      url: '/pages/checkin/checkin'
    });
  },

  // 切换分类
  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({ currentCategory: categoryId });
  },

  // 查看动作详情
  viewExercise(e) {
    const exerciseId = e.currentTarget.dataset.id;
    const exercise = this.data.exerciseLibrary.find(item => item.id === exerciseId);
    if (exercise) {
      this.setData({
        currentExercise: exercise,
        showExerciseDetail: true
      });
    }
  },

  // 关闭动作详情
  closeExerciseDetail() {
    this.setData({
      currentExercise: null,
      showExerciseDetail: false
    });
  },

  // 跳转到任务页
  goToTasks() {
    this.closeExerciseDetail();
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 预览角度照片
  previewAnglePhoto(e) {
    const photo = e.currentTarget.dataset.photo;
    const photos = this.data.selectedAnglePhotos;
    const index = photos.indexOf(photo);
    
    this.setData({
      previewPhotoList: photos,
      currentPreviewIndex: index >= 0 ? index : 0,
      showPhotoViewer: true
    });
  },

  // 照片轮播切换
  onPhotoSwiperChange(e) {
    this.setData({
      currentPreviewIndex: e.detail.current
    });
  },

  // 关闭照片查看器
  closePhotoViewer() {
    this.setData({
      showPhotoViewer: false,
      previewPhotoList: [],
      currentPreviewIndex: 0
    });
  },

  // 阻止触摸滑动穿透
  preventTouchMove() {
    // 空方法，用于阻止背景滚动穿透
  }
});

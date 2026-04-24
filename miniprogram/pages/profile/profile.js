// pages/profile/profile.js
Page({
  data: {
    // 导航栏安全区域
    navBarHeight: 0,

    // 当前步骤
    currentStep: 1,
    totalSteps: 4,

    // 用户信息
    userInfo: {
      injuryPart: '',      // 损伤部位（大类）
      injuryPartDetail: '', // 损伤部位（详细）
      injuryType: '',      // 损伤类型
      surgeryDate: '',     // 手术日期
      nickname: '',        // 昵称
      avatar: '',          // 头像
      injuryCause: '',     // 损伤原因
      sportsBackground: '', // 运动背景
      isAuthorized: false,  // 是否已授权
      hasModified: false    // 是否有修改
    },

    // 部位级联选择数据
    injuryParts: [
      { id: 'lower_limb', name: '下肢', children: [
        { id: 'knee', name: '膝关节', children: [
          { id: 'acl', name: 'ACL断裂' },
          { id: 'pcl', name: 'PCL断裂' },
          { id: 'meniscus_tear', name: '半月板撕裂' },
          { id: 'meniscus_dislocation', name: '半月板脱位' },
          { id: 'mcl', name: 'MCL损伤' },
          { id: 'lcl', name: 'LCL损伤' },
          { id: 'patella', name: '髌骨骨折' },
          { id: 'tibial_plateau', name: '胫骨平台骨折' },
          { id: 'knee_other', name: '其他' }
        ]},
        { id: 'ankle', name: '踝关节', children: [
          { id: 'atfl', name: 'ATFL损伤' },
          { id: 'cfl', name: 'CFL损伤' },
          { id: 'syndesmosis', name: '下胫腓联合损伤' },
          { id: 'achilles', name: '跟腱断裂' },
          { id: 'ankle_fracture', name: '踝关节骨折' },
          { id: 'ankle_other', name: '其他' }
        ]},
        { id: 'hip', name: '髋关节', children: [
          { id: 'labrum', name: '盂唇撕裂' },
          { id: 'femoral_neck', name: '股骨颈骨折' },
          { id: 'hip_other', name: '其他' }
        ]}
      ]},
      { id: 'upper_limb', name: '上肢', children: [
        { id: 'shoulder', name: '肩关节', children: [
          { id: 'rotator_tear', name: '肩袖撕裂' },
          { id: 'slap', name: 'SLAP损伤' },
          { id: 'bankart', name: 'Bankart损伤' },
          { id: 'ac_joint', name: '肩锁关节损伤' },
          { id: 'clavicle', name: '锁骨骨折' },
          { id: 'shoulder_other', name: '其他' }
        ]},
        { id: 'elbow', name: '肘关节', children: [
          { id: 'tennis_elbow', name: '网球肘' },
          { id: 'golfer_elbow', name: '高尔夫球肘' },
          { id: 'elbow_fracture', name: '肘关节骨折' },
          { id: 'elbow_other', name: '其他' }
        ]},
        { id: 'wrist', name: '腕关节', children: [
          { id: 'carpal_tunnel', name: '腕管综合征' },
          { id: 'wrist_fracture', name: '腕骨骨折' },
          { id: 'tfcc', name: 'TFCC损伤' },
          { id: 'wrist_other', name: '其他' }
        ]}
      ]},
      { id: 'spine', name: '脊柱', children: [
        { id: 'cervical', name: '颈椎', children: [
          { id: 'cervical_disc', name: '颈椎间盘突出' },
          { id: 'cervical_sprain', name: '颈椎扭伤' },
          { id: 'cervical_other', name: '其他' }
        ]},
        { id: 'lumbar', name: '腰椎', children: [
          { id: 'disc_herniation', name: '腰椎间盘突出' },
          { id: 'disc_degeneration', name: '椎间盘退变' },
          { id: 'spinal_stenosis', name: '椎管狭窄' },
          { id: 'lumbar_sprain', name: '腰扭伤' },
          { id: 'lumbar_other', name: '其他' }
        ]}
      ]}
    ],

    // 当前选中的部位
    selectedPart: null,
    selectedPartDetail: null,
    selectedInjuryType: null,

    // 自定义输入相关
    showCustomDetailInput: false,
    showConfirmModal: false, // 是否显示保存确认弹窗
    isCustomDetail: false,
    customDetailValue: '',
    showCustomInjuryInput: false,
    isCustomInjury: false,
    customInjuryValue: '',

    // 损伤原因选项
    injuryCauses: [
      { id: 'sports', name: '运动损伤', icon: '🏃' },
      { id: 'accident', name: '意外事故', icon: '⚠️' },
      { id: 'work', name: '工作相关', icon: '💼' },
      { id: 'daily', name: '日常活动', icon: '🏠' },
      { id: 'disease', name: '疾病导致', icon: '🏥' }
    ],

    // 运动类型细分选项
    sportsTypes: [
      { id: 'ski', name: '滑雪', icon: '⛷️' },
      { id: 'football', name: '足球', icon: '⚽' },
      { id: 'basketball', name: '篮球', icon: '🏀' },
      { id: 'climbing', name: '攀岩', icon: '🧗' }
    ],

    // 运动爱好者可选运动列表（用于多选）
    sportsList: [
      { id: 'ski', name: '滑雪', icon: '⛷️' },
      { id: 'football', name: '足球', icon: '⚽' },
      { id: 'basketball', name: '篮球', icon: '🏀' },
      { id: 'climbing', name: '攀岩', icon: '🧗' },
      { id: 'running', name: '跑步', icon: '🏃' },
      { id: 'swimming', name: '游泳', icon: '🏊' },
      { id: 'cycling', name: '骑行', icon: '🚴' },
      { id: 'tennis', name: '网球', icon: '🎾' }
    ],

    // 已选运动列表（多选）
    selectedSportsList: [],
    isCustomSports: false,
    customSportsValue: '',
    showCustomSportsInput: false,

    // 选中原因ID
    selectedCauseId: '',

    // 自定义损伤原因
    showCustomCauseInput: false,
    isCustomCause: false,
    customCauseValue: '',

    // 自定义运动类型
    showCustomSportsTypeInput: false,
    isCustomSportsType: false,
    customSportsTypeValue: '',

    // 运动背景选项
    sportsBackgrounds: [
      { id: 'professional', name: '专业运动员' },
      { id: 'amateur', name: '运动爱好者' },
      { id: 'occasional', name: '偶尔运动' },
      { id: 'sedentary', name: '久坐为主' }
    ],

    // 日期相关
    surgeryDate: '',
    injuryDate: '',      // 保守治疗时使用的受伤日期
    treatmentType: '',   // 治疗方式：surgery 或 conservative
    maxDate: '',  // 不能选未来日期

    // 是否正在提交
    isSubmitting: false
  },

  onLoad(options) {
    this.calculateNavBarHeight();
    this.initMaxDate();
    this.checkExistingProfile();
  },

  // 计算导航栏安全高度
  calculateNavBarHeight() {
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    const systemInfo = wx.getSystemInfoSync();

    const statusBarHeight = systemInfo.statusBarHeight;
    const menuButtonHeight = menuButtonInfo.height;
    const menuButtonTop = menuButtonInfo.top;

    const gapBelowMenuButton = menuButtonTop + menuButtonHeight - statusBarHeight;
    const navBarHeight = statusBarHeight + gapBelowMenuButton + 20;

    this.setData({
      navBarHeight: navBarHeight
    });
  },

  // 初始化最大日期
  initMaxDate() {
    const today = new Date();
    const maxDate = this.formatDate(today);
    this.setData({ maxDate });
  },

  // 检查是否已有简历
  checkExistingProfile() {
    const existingProfile = wx.getStorageSync('userInfo');
    if (existingProfile && (existingProfile.surgeryDate || existingProfile.injuryDate)) {
      const treatmentType = existingProfile.surgeryDate ? 'surgery' : 'conservative';
      this.setData({
        userInfo: existingProfile,
        treatmentType: existingProfile.treatmentType || treatmentType,
        surgeryDate: existingProfile.surgeryDate || '',
        injuryDate: existingProfile.injuryDate || '',
        currentStep: 1  // 暂时设为1以测试新流程
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

  // 选择损伤部位大类
  selectPart(e) {
    const partId = e.currentTarget.dataset.id;
    const part = this.data.injuryParts.find(p => p.id === partId);
    this.setData({
      selectedPart: part,
      selectedPartDetail: null,
      selectedInjuryType: null,
      'userInfo.injuryPart': part ? part.name : '',
      'userInfo.hasModified': true
    });
  },

  // 选择损伤部位详细
  selectPartDetail(e) {
    const detailId = e.currentTarget.dataset.id;
    const detail = this.data.selectedPart.children.find(d => d.id === detailId);
    this.setData({
      selectedPartDetail: detail,
      selectedInjuryType: null,
      'userInfo.injuryPartDetail': detail ? detail.name : '',
      // 重置自定义输入状态
      showCustomDetailInput: false,
      isCustomDetail: false,
      customDetailValue: '',
      showCustomInjuryInput: false,
      isCustomInjury: false,
      customInjuryValue: '',
      'userInfo.hasModified': true
    });
  },

  // 显示自定义部位输入框
  showCustomDetailInput() {
    this.setData({
      showCustomDetailInput: true,
      isCustomDetail: true,
      selectedPartDetail: null,
      selectedInjuryType: null,
      'userInfo.injuryPartDetail': '',
      'userInfo.hasModified': true
    });
  },

  // 输入自定义部位
  inputCustomDetail(e) {
    this.setData({
      customDetailValue: e.detail.value
    });
  },

  // 确认自定义部位
  confirmCustomDetail() {
    const value = this.data.customDetailValue.trim();
    if (value) {
      this.setData({
        'userInfo.injuryPartDetail': value,
        showCustomDetailInput: false,
        'userInfo.hasModified': true
      });
    }
  },

  // 显示自定义损伤类型输入框
  showCustomInjuryInput() {
    this.setData({
      showCustomInjuryInput: true,
      isCustomInjury: true,
      selectedInjuryType: null,
      'userInfo.injuryType': '',
      'userInfo.hasModified': true
    });
  },

  // 输入自定义损伤类型
  inputCustomInjury(e) {
    this.setData({
      customInjuryValue: e.detail.value,
      'userInfo.injuryType': e.detail.value,
      'userInfo.hasModified': true
    });
  },

  // 确认自定义损伤类型
  confirmCustomInjury() {
    const value = this.data.customInjuryValue.trim();
    if (value) {
      this.setData({
        'userInfo.injuryType': value,
        showCustomInjuryInput: false,
        'userInfo.hasModified': true
      });
    }
  },

  // 选择损伤类型
  selectInjuryType(e) {
    const typeId = e.currentTarget.dataset.id;
    const type = this.data.selectedPartDetail.children.find(t => t.id === typeId);
    this.setData({
      selectedInjuryType: type,
      'userInfo.injuryType': type ? type.name : '',
      // 重置自定义输入状态
      showCustomInjuryInput: false,
      isCustomInjury: false,
      customInjuryValue: '',
      'userInfo.hasModified': true
    });
  },

  // 选择治疗方式
  selectTreatmentType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      treatmentType: type,
      'userInfo.treatmentType': type,
      // 重置日期
      surgeryDate: '',
      injuryDate: '',
      'userInfo.surgeryDate': '',
      'userInfo.injuryDate': '',
      'userInfo.hasModified': true
    });
  },

  // 快捷选择日期
  selectRecentDate(e) {
    const days = parseInt(e.currentTarget.dataset.days);
    const type = e.currentTarget.dataset.type || this.data.treatmentType;
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - days);
    const dateStr = this.formatDate(targetDate);

    // 使用日期字符串创建日期对象，避免时区问题，统一使用北京时间00:00:00
    const selectedDate = new Date(dateStr + 'T00:00:00+08:00');
    const todayStr = this.formatDate(today) + 'T00:00:00+08:00';
    const todayDateObj = new Date(todayStr);
    const daysDiff = Math.floor((todayDateObj - selectedDate) / (1000 * 60 * 60 * 24));

    if (type === 'conservative') {
      this.setData({
        injuryDate: dateStr,
        'userInfo.injuryDate': dateStr,
        'userInfo.surgeryDate': '',
        'userInfo.daysSinceSurgery': daysDiff
      });
    } else {
      this.setData({
        surgeryDate: dateStr,
        'userInfo.surgeryDate': dateStr,
        'userInfo.injuryDate': '',
        'userInfo.daysSinceSurgery': daysDiff
      });
    }
  },

  // 选择手术日期
  bindSurgeryDateChange(e) {
    const date = e.detail.value;
    const today = new Date();
    // 使用日期字符串创建日期对象，避免时区问题，统一使用北京时间00:00:00
    const selectedDate = new Date(date + 'T00:00:00+08:00');
    const todayStr = this.formatDate(today) + 'T00:00:00+08:00';
    const todayDateObj = new Date(todayStr);
    const daysDiff = Math.floor((todayDateObj - selectedDate) / (1000 * 60 * 60 * 24));

    this.setData({
      surgeryDate: date,
      'userInfo.surgeryDate': date,
      'userInfo.injuryDate': '',
      'userInfo.daysSinceSurgery': daysDiff,
      'userInfo.hasModified': true
    });
  },

  // 选择受伤日期（保守治疗）
  bindInjuryDateChange(e) {
    const date = e.detail.value;
    const today = new Date();
    // 使用日期字符串创建日期对象，避免时区问题，统一使用北京时间00:00:00
    const selectedDate = new Date(date + 'T00:00:00+08:00');
    const todayStr = this.formatDate(today) + 'T00:00:00+08:00';
    const todayDateObj = new Date(todayStr);
    const daysDiff = Math.floor((todayDateObj - selectedDate) / (1000 * 60 * 60 * 24));

    this.setData({
      injuryDate: date,
      'userInfo.injuryDate': date,
      'userInfo.surgeryDate': '',
      'userInfo.daysSinceSurgery': daysDiff,
      'userInfo.hasModified': true
    });
  },

  // 输入昵称
  inputNickname(e) {
    this.setData({
      'userInfo.nickname': e.detail.value,
      'userInfo.hasModified': true
    });
  },

  // 选择损伤原因
  selectCause(e) {
    const causeId = e.currentTarget.dataset.id;
    const cause = this.data.injuryCauses.find(c => c.id === causeId);
    this.setData({
      'userInfo.injuryCause': cause ? cause.name : '',
      selectedCauseId: causeId,
      // 重置自定义
      showCustomCauseInput: false,
      isCustomCause: false,
      customCauseValue: '',
      // 重置运动类型
      showCustomSportsTypeInput: false,
      isCustomSportsType: false,
      customSportsTypeValue: '',
      'userInfo.sportsType': '',
      'userInfo.hasModified': true
    });
  },

  // 显示自定义损伤原因输入
  showCustomCauseInput() {
    this.setData({
      showCustomCauseInput: true,
      isCustomCause: true,
      selectedCauseId: 'custom',
      'userInfo.injuryCause': '',
      // 重置运动类型
      'userInfo.sportsType': '',
      'userInfo.hasModified': true
    });
  },

  // 输入自定义损伤原因
  inputCustomCause(e) {
    this.setData({
      customCauseValue: e.detail.value
    });
  },

  // 确认自定义损伤原因
  confirmCustomCause() {
    const value = this.data.customCauseValue.trim();
    if (value) {
      this.setData({
        'userInfo.injuryCause': value,
        showCustomCauseInput: false,
        'userInfo.hasModified': true
      });
    }
  },

  // 选择运动类型
  selectSportsType(e) {
    const typeId = e.currentTarget.dataset.id;
    const sportsType = this.data.sportsTypes.find(s => s.id === typeId);
    this.setData({
      'userInfo.sportsType': sportsType ? sportsType.name : '',
      selectedCauseId: 'sports',
      // 重置自定义运动类型
      showCustomSportsTypeInput: false,
      isCustomSportsType: false,
      customSportsTypeValue: '',
      'userInfo.hasModified': true
    });
  },

  // 显示自定义运动类型输入
  showCustomSportsTypeInput() {
    this.setData({
      showCustomSportsTypeInput: true,
      isCustomSportsType: true,
      'userInfo.sportsType': '',
      'userInfo.hasModified': true
    });
  },

  // 输入自定义运动类型
  inputCustomSportsType(e) {
    this.setData({
      customSportsTypeValue: e.detail.value
    });
  },

  // 确认自定义运动类型
  confirmCustomSportsType() {
    const value = this.data.customSportsTypeValue.trim();
    if (value) {
      this.setData({
        'userInfo.sportsType': value,
        showCustomSportsTypeInput: false,
        'userInfo.hasModified': true
      });
    }
  },

  // 选择运动背景
  selectBackground(e) {
    const bgId = e.currentTarget.dataset.id;
    const bg = this.data.sportsBackgrounds.find(b => b.id === bgId);
    console.log('selectBackground:', bgId, bg);
    
    this.setData({
      'userInfo.sportsBackground': bg ? bg.name : '',
      // 切换到运动爱好者时重置多选
      selectedSportsList: [],
      isCustomSports: false,
      customSportsValue: '',
      showCustomSportsInput: false,
      'userInfo.hasModified': true
    });
    
    console.log('sportsBackground set to:', this.data.userInfo.sportsBackground);
  },

  // 切换运动项目（多选）
  toggleSportsItem(e) {
    const id = e.currentTarget.dataset.id;
    
    // 获取当前列表并创建新数组
    const currentList = this.data.selectedSportsList || [];
    const newList = [];
    
    // 复制现有项
    for (let i = 0; i < currentList.length; i++) {
      newList.push(currentList[i]);
    }
    
    // 查找是否已存在
    let foundIndex = -1;
    for (let i = 0; i < newList.length; i++) {
      if (newList[i] === id) {
        foundIndex = i;
        break;
      }
    }
    
    // 切换状态
    if (foundIndex !== -1) {
      newList.splice(foundIndex, 1);
    } else {
      newList.push(id);
    }
    
    this.setData({
      selectedSportsList: newList,
      'userInfo.hasModified': true
    });
  },

  // 移除单个运动项目
  removeSportsItem(e) {
    const id = e.currentTarget.dataset.id;
    const currentList = this.data.selectedSportsList || [];
    const newList = [];
    
    for (let i = 0; i < currentList.length; i++) {
      if (currentList[i] !== id) {
        newList.push(currentList[i]);
      }
    }
    
    this.setData({
      selectedSportsList: newList,
      'userInfo.hasModified': true
    });
  },

  // 显示自定义运动输入
  showCustomSportsInput() {
    this.setData({
      showCustomSportsInput: true,
      isCustomSports: true,
      'userInfo.hasModified': true
    });
  },

  // 输入自定义运动
  inputCustomSports(e) {
    this.setData({
      customSportsValue: e.detail.value
    });
  },

  // 确认自定义运动
  confirmCustomSports() {
    const value = this.data.customSportsValue.trim();
    if (value) {
      this.setData({
        showCustomSportsInput: false,
        'userInfo.hasModified': true
      });
    }
  },

  // 移除自定义运动
  removeCustomSports() {
    this.setData({
      isCustomSports: false,
      customSportsValue: '',
      'userInfo.hasModified': true
    });
  },

  // 下一步
  nextStep() {
    // 验证当前步骤
    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.data.currentStep < this.data.totalSteps) {
      this.setData({
        currentStep: this.data.currentStep + 1
      });
    }
  },

  // 上一步
  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1
      });
    }
  },

  // 验证当前步骤
  validateCurrentStep() {
    switch (this.data.currentStep) {
      case 1:
        if (!this.data.userInfo.injuryPart || !this.data.userInfo.injuryPartDetail || !this.data.userInfo.injuryType) {
          wx.showToast({
            title: '请完整选择或输入损伤信息',
            icon: 'none'
          });
          return false;
        }
        return true;
      case 2:
        if (!this.data.treatmentType) {
          wx.showToast({
            title: '请选择治疗方式',
            icon: 'none'
          });
          return false;
        }
        if (this.data.treatmentType === 'surgery' && !this.data.surgeryDate) {
          wx.showToast({
            title: '请选择手术日期',
            icon: 'none'
          });
          return false;
        }
        if (this.data.treatmentType === 'conservative' && !this.data.injuryDate) {
          wx.showToast({
            title: '请选择受伤日期',
            icon: 'none'
          });
          return false;
        }
        return true;
      case 3:
        if (!this.data.userInfo.nickname) {
          wx.showToast({
            title: '请输入昵称',
            icon: 'none'
          });
          return false;
        }
        // 损伤原因和运动背景已改为非必填，无需验证
        return true;
      default:
        return true;
    }
  },

  // 微信授权登录
  authorizeWechat() {
    if (this.data.isSubmitting) return;

    wx.showLoading({ title: '授权中...' });

    // 使用 wx.getUserProfile 获取用户信息
    wx.getUserProfile({
      desc: '用于完善您的伤情简历',
      success: (res) => {
        wx.hideLoading();
        const userInfo = res.userInfo;
        this.setData({
          'userInfo.avatar': userInfo.avatarUrl,
          'userInfo.nickname': userInfo.nickName || this.data.userInfo.nickname,
          'userInfo.isAuthorized': true,
          isSubmitting: false
        });

        wx.showToast({
          title: '授权成功',
          icon: 'success',
          duration: 1000
        });

        // 延迟执行完成流程
        setTimeout(() => {
          this.completeProfile();
        }, 1000);
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
        console.error('微信授权失败:', err);
        wx.showToast({
          title: '授权失败，可稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 跳过授权
  skipAuth() {
    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });
    
    const userInfo = this.data.userInfo;
    userInfo.treatmentType = this.data.treatmentType;
    
    if (this.data.userInfo.sportsBackground === '运动爱好者') {
      const selectedNames = this.data.selectedSportsList.map(id => {
        const sport = this.data.sportsList.find(s => s.id === id);
        return sport ? sport.name : id;
      });
      if (this.data.isCustomSports && this.data.customSportsValue) {
        selectedNames.push(this.data.customSportsValue);
      }
      userInfo.sportsItems = selectedNames;
    }
    
    wx.setStorageSync('userInfo', userInfo);

    const targetDate = userInfo.surgeryDate || userInfo.injuryDate;
    if (targetDate) {
      const dateObj = new Date(targetDate);
      const today = new Date();
      const daysDiff = Math.floor((today - dateObj) / (1000 * 60 * 60 * 24));
      userInfo.daysSinceSurgery = daysDiff;
      wx.setStorageSync('userInfo', userInfo);
    }

    wx.showToast({
      title: '简历创建成功',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      this.setData({ isSubmitting: false });
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
  },

  // 完成简历
  completeProfile() {
    if (this.data.isSubmitting) return;
    
    this.setData({ isSubmitting: true });

    // 保存用户信息
    const userInfo = this.data.userInfo;
    // 添加治疗方式
    userInfo.treatmentType = this.data.treatmentType;
    
    // 保存多选的运动列表
    if (this.data.userInfo.sportsBackground === '运动爱好者') {
      // 将选中的运动ID转换为名称
      const selectedNames = this.data.selectedSportsList.map(id => {
        const sport = this.data.sportsList.find(s => s.id === id);
        return sport ? sport.name : id;
      });
      if (this.data.isCustomSports && this.data.customSportsValue) {
        selectedNames.push(this.data.customSportsValue);
      }
      userInfo.sportsItems = selectedNames;
    }
    
    wx.setStorageSync('userInfo', userInfo);

    // 计算康复天数（使用与 selectDate 一致的日期解析方式）
    const targetDate = userInfo.surgeryDate || userInfo.injuryDate;
    if (targetDate) {
      const dateObj = new Date(targetDate + 'T00:00:00+08:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - dateObj) / (1000 * 60 * 60 * 24));
      userInfo.daysSinceSurgery = daysDiff;
      wx.setStorageSync('userInfo', userInfo);
    }

    wx.showToast({
      title: '简历创建成功',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      this.setData({ isSubmitting: false });
      // 跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
  },

  // 获取OpenID（静默登录）- 云开发功能，可选
  getOpenId() {
    // 检查是否配置了云开发环境
    const app = getApp();
    if (!app.globalData.env) {
      console.log('未配置云开发环境，跳过获取OpenID');
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
          }
        },
        fail: (err) => {
          console.error('获取OpenID失败:', err);
        }
      });
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 处理返回按钮
  handleBack() {
    // 检查是否有修改
    if (this.data.userInfo.hasModified) {
      this.setData({ showConfirmModal: true });
    } else {
      wx.navigateBack();
    }
  },

  // 取消保存
  cancelSave() {
    this.setData({ showConfirmModal: false });
    wx.navigateBack();
  },

  // 确认保存
  confirmSave() {
    this.setData({ showConfirmModal: false });

    // 保存用户信息
    const userInfo = this.data.userInfo;
    userInfo.treatmentType = this.data.treatmentType;

    if (this.data.userInfo.sportsBackground === '运动爱好者') {
      const selectedNames = this.data.selectedSportsList.map(id => {
        const sport = this.data.sportsList.find(s => s.id === id);
        return sport ? sport.name : id;
      });
      if (this.data.isCustomSports && this.data.customSportsValue) {
        selectedNames.push(this.data.customSportsValue);
      }
      userInfo.sportsItems = selectedNames;
    }

    wx.setStorageSync('userInfo', userInfo);

    // 计算康复天数（使用与 selectDate 一致的日期解析方式）
    const targetDate = userInfo.surgeryDate || userInfo.injuryDate;
    if (targetDate) {
      const dateObj = new Date(targetDate + 'T00:00:00+08:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - dateObj) / (1000 * 60 * 60 * 24));
      userInfo.daysSinceSurgery = daysDiff;
      wx.setStorageSync('userInfo', userInfo);
    }

    wx.showToast({
      title: '已保存',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});

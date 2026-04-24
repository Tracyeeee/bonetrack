// pages/square/square.js
const app = getApp();
const cloud = require('../../utils/cloud.js');

Page({
  data: {
    // 当前用户ID
    currentUserId: '',

    // 用户信息
    userInfo: {
      daysSinceSurgery: 45,
      injuryPart: '膝关节',
      injuryType: 'ACL重建',
      avatar: '',
      isAuthorized: false
    },

    // 筛选相关数据
    showFilter: false, // 是否显示筛选面板
    filterTags: [
      // 损伤部位（与伤情简历完全一致）
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
    detailOptions: [], // 当前选中部位的详细部位选项
    injuryTypeOptions: [], // 当前选中详细部位的损伤类型选项
    sportBackgroundOptions: [
      { id: 'professional', name: '专业运动员' },
      { id: 'amateur', name: '运动爱好者' },
      { id: 'occasional', name: '偶尔运动' },
      { id: 'sedentary', name: '久坐为主' }
    ],

    // 运动爱好者可选运动列表（用于筛选）
    sportsFilterOptions: [
      { id: '滑雪', name: '滑雪' },
      { id: '足球', name: '足球' },
      { id: '篮球', name: '篮球' },
      { id: '攀岩', name: '攀岩' },
      { id: '跑步', name: '跑步' },
      { id: '游泳', name: '游泳' },
      { id: '骑行', name: '骑行' },
      { id: '网球', name: '网球' }
    ],

    // 用户运动标签（从伤情简历同步）
    userSportsTags: [],

    // 选中的运动筛选
    selectedSports: [],
    // 选中的筛选条件
    selectedPart: null, // 选中的损伤部位
    selectedPartDetail: null, // 选中的详细部位
    selectedInjuryType: null, // 选中的损伤类型
    selectedSportBackground: null, // 选中的运动背景
    filterKeyword: '', // 关键词搜索
    hasActiveFilter: false, // 是否有激活的筛选

    // 动态列表
    posts: [],

    // 是否显示发布框
    showPublishModal: false,
    publishContent: '',
    publishImages: [],

    // 评论相关
    currentCommentPostId: null,
    commentInput: '',
    showCommentInput: false,

    // 显示的帖子列表（筛选后）
    displayPosts: []
  },

  onLoad() {
    this.initNavBar();
    this.checkUserAuth();
    this.loadUserInfo();
    this.initDisplayPosts();
    
    // 云开发：获取帖子列表
    this.loadPostsFromCloud();
  },
  
  // 页面显示时刷新用户信息
  onShow() {
    // 刷新用户授权状态和 openId
    this.checkUserAuth();
    // 刷新用户信息
    this.loadUserInfo();
  },
  
  // ============ 云开发相关方法 ============
  
  // 从云端加载帖子列表
  async loadPostsFromCloud() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const result = await cloud.getPosts();
      
      if (result.success && result.data) {
        this.setData({
          posts: result.data.posts || [],
          displayPosts: result.data.posts || []
        });
      }
    } catch (err) {
      console.error('加载帖子失败:', err);
      // 失败时使用本地数据（降级处理）
      wx.showToast({
        title: '加载失败，使用离线数据',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 云开发：发布帖子
  async cloudCreatePost(postData) {
    wx.showLoading({ title: '发布中...' });
    
    try {
      const result = await cloud.createPost(postData);
      
      if (result.success) {
        wx.showToast({ title: '发布成功' });
        
        // 将新帖子添加到列表顶部
        const newPost = {
          ...result.data,
          id: result.data._id,
          commentList: [],
          showComments: false
        };
        
        this.setData({
          posts: [newPost, ...this.data.posts],
          displayPosts: [newPost, ...this.data.displayPosts],
          showPublishModal: false,
          publishContent: '',
          publishImages: []
        });
        
        return true;
      } else {
        wx.showToast({ title: result.error || '发布失败', icon: 'none' });
        return false;
      }
    } catch (err) {
      console.error('发布帖子失败:', err);
      wx.showToast({ title: '发布失败', icon: 'none' });
      return false;
    } finally {
      wx.hideLoading();
    }
  },
  
  // 云开发：点赞/取消点赞
  async cloudToggleLike(postId) {
    try {
      const result = await cloud.like({ action: 'toggle', postId });
      
      if (result.success) {
        // 更新本地数据
        const posts = this.data.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: result.data.isLiked,
              likes: result.data.likes
            };
          }
          return post;
        });
        
        const displayPosts = this.data.displayPosts.map(post => {
          if (post.id === postId) {
            const updatedPost = posts.find(p => p.id === postId);
            return { ...updatedPost, showComments: post.showComments };
          }
          return post;
        });
        
        this.setData({ posts, displayPosts });
      }
    } catch (err) {
      console.error('点赞失败:', err);
      // 失败时回滚UI
      this.toggleLikeRollback(postId);
    }
  },
  
  // 点赞失败时回滚
  toggleLikeRollback(postId) {
    const posts = this.data.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    });
    
    const displayPosts = this.data.displayPosts.map(post => {
      if (post.id === postId) {
        const updatedPost = posts.find(p => p.id === postId);
        return { ...updatedPost, showComments: post.showComments };
      }
      return post;
    });
    
    this.setData({ posts, displayPosts });
    wx.showToast({ title: '操作失败', icon: 'none' });
  },
  
  // 云开发：发表评论
  async cloudAddComment(postId, content) {
    try {
      const result = await cloud.comment({
        action: 'add',
        postId,
        content,
        authorName: this.data.userInfo.nickname || '匿名用户',
        authorAvatar: this.data.userInfo.avatar || ''
      });
      
      if (result.success) {
        // 更新本地数据
        const posts = this.data.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments + 1,
              commentList: [...post.commentList, result.data]
            };
          }
          return post;
        });
        
        const displayPosts = this.data.displayPosts.map(post => {
          if (post.id === postId) {
            const updatedPost = posts.find(p => p.id === postId);
            return updatedPost;
          }
          return post;
        });
        
        this.setData({ posts, displayPosts });
        wx.showToast({ title: '评论成功' });
        return true;
      } else {
        wx.showToast({ title: result.error || '评论失败', icon: 'none' });
        return false;
      }
    } catch (err) {
      console.error('发表评论失败:', err);
      wx.showToast({ title: '评论失败', icon: 'none' });
      return false;
    }
  },

  // 初始化显示帖子
  initDisplayPosts() {
    this.setData({
      displayPosts: this.data.posts
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

  // 检查用户授权状态
  async checkUserAuth() {
    const userInfo = wx.getStorageSync('userInfo');
    const isAuthorized = !!(userInfo && userInfo.nickname);
    
    // 尝试获取 openId
    let openId = userInfo ? userInfo.openId || userInfo._id || '' : '';
    
    // 如果本地没有 openId，尝试从存储获取
    if (!openId) {
      openId = wx.getStorageSync('openId') || '';
    }
    
    // 如果仍然没有 openId，调用云函数获取
    if (!openId && wx.cloud) {
      try {
        const res = await cloud.callFunction('getOpenId', {});
        if (res && res.openid) {
          openId = res.openid;
          wx.setStorageSync('openId', openId);
        }
      } catch (e) {
        console.error('[Square] 获取OpenID失败:', e);
      }
    }
    
    this.setData({
      currentUserId: openId,
      'userInfo.isAuthorized': isAuthorized,
      'userInfo.avatar': userInfo ? userInfo.avatar : ''
    });
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      let daysDiff = 0;
      
      // 优先使用手术日期，否则使用受伤日期
      const targetDate = userInfo.surgeryDate || userInfo.injuryDate;
      if (targetDate) {
        try {
          // 使用与 profile.js 一致的日期解析方式：添加北京时间 00:00:00
          const dateObj = new Date(targetDate + 'T00:00:00+08:00');
          const today = new Date();
          // 设置为当天 00:00:00，与 profile.js 一致
          today.setHours(0, 0, 0, 0);
          
          // 检查日期是否有效
          if (!isNaN(dateObj.getTime())) {
            daysDiff = Math.floor((today - dateObj) / (1000 * 60 * 60 * 24));
            console.log('[Square] 术后/伤后天数计算:', {
              targetDate,
              dateObj: dateObj.toISOString(),
              today: today.toISOString(),
              daysDiff
            });
          } else {
            console.log('[Square] 日期解析失败:', targetDate);
          }
        } catch (e) {
          console.error('[Square] 日期计算异常:', e);
        }
      } else {
        console.log('[Square] 未设置手术/受伤日期');
      }

      // 同步运动爱好者的具体运动标签
      let userSportsTags = [];
      if (userInfo.sportsBackground === '运动爱好者' && userInfo.sportsItems) {
        userSportsTags = userInfo.sportsItems;
      }

      this.setData({
        userInfo: {
          ...this.data.userInfo,
          daysSinceSurgery: daysDiff,
          injuryPart: userInfo.injuryPart || '膝关节',
          injuryType: userInfo.injuryType || 'ACL重建',
          avatar: userInfo.avatar || '',
          nickname: userInfo.nickname || '康复勇士',
          sportsBackground: userInfo.sportsBackground || '',
          sportsItems: userInfo.sportsItems || [],
          surgeryDate: userInfo.surgeryDate || userInfo.injuryDate || '',
          injuryDate: userInfo.injuryDate || ''
        },
        userSportsTags
      });
    }
  },

  // ============ 筛选相关方法 ============

  // 切换筛选面板显示
  toggleFilter() {
    this.setData({
      showFilter: !this.data.showFilter
    });
  },

  // 关闭筛选面板
  closeFilter() {
    this.setData({
      showFilter: false
    });
  },

  // 阻止事件冒泡
  preventBubble() {
    // 空方法，用于阻止事件冒泡
  },

  // 页面滚动（scroll-view 需要）
  onScroll(e) {
    // 记录滚动位置等
  },

  // 选择损伤部位大类
  selectPartFilter(e) {
    const partId = e.currentTarget.dataset.id;
    const part = this.data.filterTags.find(p => p.id === partId);

    // 如果点击已选中的部位，则取消选择
    if (this.data.selectedPart === partId) {
      this.setData({
        selectedPart: null,
        selectedPartDetail: null,
        selectedInjuryType: null,
        detailOptions: [],
        injuryTypeOptions: []
      });
    } else {
      this.setData({
        selectedPart: partId,
        selectedPartDetail: null,
        selectedInjuryType: null,
        detailOptions: part ? part.children : [],
        injuryTypeOptions: []
      });
    }
  },

  // 选择损伤详细部位
  selectPartDetailFilter(e) {
    const detailId = e.currentTarget.dataset.id;
    const part = this.data.filterTags.find(p => p.id === this.data.selectedPart);
    const detail = part ? part.children.find(d => d.id === detailId) : null;

    // 如果点击已选中的详细部位，则取消选择
    if (this.data.selectedPartDetail === detailId) {
      this.setData({
        selectedPartDetail: null,
        selectedInjuryType: null,
        injuryTypeOptions: []
      });
    } else {
      this.setData({
        selectedPartDetail: detailId,
        selectedInjuryType: null,
        injuryTypeOptions: detail && detail.children ? detail.children : []
      });
    }
  },

  // 选择损伤类型
  selectInjuryTypeFilter(e) {
    const typeId = e.currentTarget.dataset.id;

    // 如果点击已选中的类型，则取消选择
    if (this.data.selectedInjuryType === typeId) {
      this.setData({
        selectedInjuryType: null
      });
    } else {
      this.setData({
        selectedInjuryType: typeId
      });
    }
  },

  // 选择运动背景
  selectSportBgFilter(e) {
    const bgId = e.currentTarget.dataset.id;

    // 如果点击已选中的运动背景，则取消选择
    if (this.data.selectedSportBackground === bgId) {
      this.setData({
        selectedSportBackground: null,
        selectedSports: []
      });
    } else {
      this.setData({
        selectedSportBackground: bgId,
        selectedSports: []
      });
    }
  },

  // 选择运动项目（多选）
  toggleSportFilter(e) {
    const sportId = e.currentTarget.dataset.id;
    const selected = this.data.selectedSports;

    // 复制当前列表
    let newSelected = selected.slice();

    // 查找索引
    const idx = newSelected.indexOf(sportId);

    // 切换状态
    if (idx > -1) {
      // 已选中，移除
      newSelected.splice(idx, 1);
    } else {
      // 未选中，添加
      newSelected.push(sportId);
    }

    this.setData({ selectedSports: newSelected });
  },

  // 运动爱好者选择具体运动
  onSelectSport(e) {
    const sportId = e.currentTarget.dataset.id;
    const current = this.data.selectedSports || [];
    let newSelected = [];

    // 判断是否已选中
    let isSelected = false;
    for (let i = 0; i < current.length; i++) {
      if (current[i] === sportId) {
        isSelected = true;
      } else {
        newSelected.push(current[i]);
      }
    }

    // 如果未选中则添加
    if (!isSelected) {
      newSelected.push(sportId);
    }

    this.setData({ selectedSports: newSelected });
  },

  // 应用筛选
  applyFilter() {
    const { selectedPart, selectedPartDetail, selectedInjuryType, selectedSportBackground, filterKeyword } = this.data;

    // 检查是否有激活的筛选
    const hasActiveFilter = !!(selectedPart || selectedPartDetail || selectedInjuryType || selectedSportBackground || this.data.selectedSports.length > 0 || filterKeyword);

    // 根据筛选条件过滤帖子
    let filteredPosts = this.data.posts;

    // 关键词搜索：匹配损伤类型、损伤部位、帖子内容、标签
    if (filterKeyword) {
      const kw = filterKeyword.trim().toLowerCase();
      filteredPosts = filteredPosts.filter(post => {
        const matchType = post.injuryType && post.injuryType.toLowerCase().includes(kw);
        const matchPart = post.injuryPart && post.injuryPart.toLowerCase().includes(kw);
        const matchContent = post.content && post.content.toLowerCase().includes(kw);
        const matchTags = post.tags && post.tags.some(tag => tag.toLowerCase().includes(kw));
        return matchType || matchPart || matchContent || matchTags;
      });
    }

    if (selectedPartDetail && selectedInjuryType) {
      const part = this.data.filterTags.find(p => p.id === selectedPart);
      const detail = part ? part.children.find(d => d.id === selectedPartDetail) : null;
      const type = detail && detail.children ? detail.children.find(t => t.id === selectedInjuryType) : null;
      filteredPosts = filteredPosts.filter(post =>
        post.injuryPart === (detail ? detail.name : selectedPartDetail) &&
        post.injuryType === (type ? type.name : selectedInjuryType)
      );
    } else if (selectedPartDetail) {
      const part = this.data.filterTags.find(p => p.id === selectedPart);
      const detail = part ? part.children.find(d => d.id === selectedPartDetail) : null;
      filteredPosts = filteredPosts.filter(post =>
        post.injuryPart === (detail ? detail.name : selectedPartDetail)
      );
    } else if (selectedPart) {
      filteredPosts = filteredPosts.filter(post => {
        const partMapping = {
          'lower_limb': ['膝关节', '踝关节', '髋关节'],
          'upper_limb': ['肩关节', '肘关节', '腕关节'],
          'spine': ['颈椎', '腰椎']
        };
        return partMapping[selectedPart] && partMapping[selectedPart].includes(post.injuryPart);
      });
    }

    if (selectedSportBackground) {
      const bg = this.data.sportBackgroundOptions.find(b => b.id === selectedSportBackground);
      filteredPosts = filteredPosts.filter(post =>
        post.sportBackground === (bg ? bg.name : selectedSportBackground)
      );

      // 如果选择了运动爱好者且有具体运动筛选
      if (selectedSportBackground === 'amateur' && this.data.selectedSports.length > 0) {
        filteredPosts = filteredPosts.filter(post => {
          if (!post.sportsItems || post.sportsItems.length === 0) {
            return false;
          }
          // 检查是否有交集（selectedSports 存的是运动名称）
          return this.data.selectedSports.some(sportName => post.sportsItems.includes(sportName));
        });
      }
    }

    // 合并所有 setData 为一次调用
    this.setData({
      hasActiveFilter,
      displayPosts: filteredPosts,
      showFilter: false
    });
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      selectedPart: null,
      selectedPartDetail: null,
      selectedInjuryType: null,
      selectedSportBackground: null,
      selectedSports: [],
      filterKeyword: '',
      detailOptions: [],
      injuryTypeOptions: [],
      hasActiveFilter: false,
      displayPosts: this.data.posts
    });
  },

  // 关键词输入
  onFilterKeywordInput(e) {
    this.setData({ filterKeyword: e.detail.value });
  },

  // 点赞
  toggleLike(e) {
    const postId = e.currentTarget.dataset.id;
    
    // 先乐观更新UI
    const posts = this.data.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    });

    const displayPosts = this.data.displayPosts.map(post => {
      if (post.id === postId) {
        const updatedPost = posts.find(p => p.id === postId);
        return { ...updatedPost, showComments: post.showComments };
      }
      return post;
    });

    this.setData({ posts, displayPosts });
    
    // 调用云开发点赞
    this.cloudToggleLike(postId);
  },

  // 评论 - 切换评论列表显示/隐藏
  commentPost(e) {
    const postId = e.currentTarget.dataset.id;

    // 更新 posts
    const posts = this.data.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          showComments: !post.showComments
        };
      }
      return post;
    });

    // 更新 displayPosts（如果该 post 在筛选结果中）
    const displayPosts = this.data.displayPosts.map(post => {
      if (post.id === postId) {
        const updatedPost = posts.find(p => p.id === postId);
        return { ...updatedPost };
      }
      return post;
    });

    this.setData({ posts, displayPosts });
  },

  // 打开评论输入框
  openCommentInput(e) {
    const postId = e.currentTarget.dataset.id;
    this.setData({
      currentCommentPostId: postId,
      showCommentInput: true,
      commentInput: ''
    });
  },

  // 关闭评论输入框
  closeCommentInput() {
    this.setData({
      showCommentInput: false,
      currentCommentPostId: null,
      commentInput: ''
    });
  },

  // 输入评论内容
  inputComment(e) {
    this.setData({ commentInput: e.detail.value });
  },

  // 发送评论
  sendComment() {
    const { commentInput, currentCommentPostId, userInfo } = this.data;

    if (!commentInput.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }

    // 乐观更新UI
    const posts = this.data.posts.map(post => {
      if (post.id === currentCommentPostId) {
        const newComment = {
          id: Date.now(),
          userName: userInfo.nickname || '我',
          content: commentInput.trim(),
          createTime: '刚刚'
        };
        return {
          ...post,
          comments: post.comments + 1,
          commentList: [...post.commentList, newComment],
          showComments: true
        };
      }
      return post;
    });

    const displayPosts = this.data.displayPosts.map(post => {
      if (post.id === currentCommentPostId) {
        const updatedPost = posts.find(p => p.id === currentCommentPostId);
        return { ...updatedPost };
      }
      return post;
    });

    this.setData({ posts, displayPosts, showCommentInput: false, commentInput: '', currentCommentPostId: null });

    // 调用云开发发表评论
    this.cloudAddComment(currentCommentPostId, commentInput.trim());
  },

  // 收藏
  bookmarkPost(e) {
    wx.showToast({
      title: '已收藏',
      icon: 'success'
    });
  },

  // 打开发布框
  openPublishModal() {
    if (!this.data.userInfo.isAuthorized) {
      wx.showToast({
        title: '请先完善伤情简历',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/profile/profile'
        });
      }, 1500);
      return;
    }
    // 刷新用户信息（确保术后天数是最新的）
    this.loadUserInfo();
    this.setData({ showPublishModal: true });
  },

  // 关闭发布框
  closePublishModal() {
    this.setData({
      showPublishModal: false,
      publishContent: '',
      publishImages: []
    });
  },

  // 输入发布内容
  inputPublishContent(e) {
    this.setData({ publishContent: e.detail.value });
  },

  // 添加图片
  addPublishImage() {
    if (this.data.publishImages.length >= 9) {
      wx.showToast({
        title: '最多9张图片',
        icon: 'none'
      });
      return;
    }

    wx.chooseMedia({
      count: 9 - this.data.publishImages.length,
      mediaType: ['image'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => file.tempFilePath);
        this.setData({
          publishImages: [...this.data.publishImages, ...newImages]
        });
      }
    });
  },

  // 删除发布图片
  deletePublishImage(e) {
    const { index } = e.currentTarget.dataset;
    const images = this.data.publishImages;
    images.splice(index, 1);
    this.setData({ publishImages: images });
  },

  // 发布动态
  publishPost() {
    const { publishContent, publishImages, userInfo, userSportsTags } = this.data;

    if (!publishContent.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    // 构造自动标签
    const daysValue = userInfo.daysSinceSurgery;
    const validDays = typeof daysValue === 'number' && !isNaN(daysValue) ? daysValue : 0;
    
    const autoTags = [
      `#${userInfo.injuryType.replace('重建', '').replace('修复', '')}`
    ];
    if (validDays > 0) {
      autoTags.push(`#术后${validDays}天`);
      if (validDays >= 90) {
        autoTags.push('#90天以上');
      }
    }
    // 添加运动爱好者的具体运动标签
    if (userInfo.sportsBackground === '运动爱好者' && userSportsTags.length > 0) {
      userSportsTags.forEach(sport => {
        autoTags.push(`#${sport}`);
      });
    }

    const postData = {
      content: publishContent,
      images: publishImages,
      authorName: userInfo.nickname || '我',
      authorAvatar: userInfo.avatar || '',
      daysSinceSurgery: validDays,
      injuryPart: userInfo.injuryPart,
      injuryType: userInfo.injuryType,
      injuryReason: userInfo.injuryCause || '',
      sportBackground: userInfo.sportsBackground || '',
      sportsItems: userInfo.sportsBackground === '运动爱好者' ? userSportsTags : [],
      tags: autoTags
    };

    // 调用云开发发布帖子
    this.cloudCreatePost(postData).then(success => {
      if (success) {
        this.closePublishModal();
      }
    });
  },

  // 删除帖子
  deletePost(e) {
    const postId = e.currentTarget.dataset.id;
    
    console.log('[Square] 删除帖子, postId:', postId);
    console.log('[Square] currentUserId:', this.data.currentUserId);
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条动态吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          
          try {
            console.log('[Square] 开始调用 deletePost 云函数');
            const result = await cloud.deletePost({ postId });
            console.log('[Square] deletePost 返回结果:', result);
            
            if (result && result.success) {
              // 从列表中移除该帖子
              const posts = this.data.posts.filter(post => post.id !== postId);
              const displayPosts = this.data.displayPosts.filter(post => post.id !== postId);
              
              this.setData({
                posts,
                displayPosts
              });
              
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
            } else {
              console.log('[Square] 删除失败:', result?.error);
              wx.showToast({
                title: result?.error || '删除失败',
                icon: 'none'
              });
            }
          } catch (err) {
            console.error('[Square] 删除帖子异常:', err);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  // 查看用户主页
  viewUserProfile(e) {
    const { userId } = e.currentTarget.dataset;
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
});

// pages/square/square.js
const app = getApp();

Page({
  data: {
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
      { id: 'professional', name: '专业运动员', icon: '🏆' },
      { id: 'amateur', name: '运动爱好者', icon: '⚽' },
      { id: 'occasional', name: '偶尔运动', icon: '🚶' },
      { id: 'sedentary', name: '久坐为主', icon: '🧘' }
    ],
    // 选中的筛选条件
    selectedPart: null, // 选中的损伤部位
    selectedPartDetail: null, // 选中的详细部位
    selectedInjuryType: null, // 选中的损伤类型
    selectedSportBackground: null, // 选中的运动背景
    hasActiveFilter: false, // 是否有激活的筛选

    // 动态列表
    posts: [
      {
        id: 1,
        userId: 101,
        userName: '康复小明',
        userAvatar: '',
        daysSinceSurgery: 60,
        injuryPart: '膝关节',
        injuryType: 'ACL断裂',
        injuryReason: '运动损伤',
        sportBackground: '运动爱好者',
        content: '术后60天，终于可以脱拐慢慢行走了！虽然还有点跛，但是每天都在进步💪 分享一下我的康复心得：坚持冰敷真的很重要！',
        images: [],
        tags: ['#ACL', '#术后60天', '#120°'],
        likes: 128,
        comments: 3,
        isLiked: false,
        createTime: '2小时前',
        commentList: [
          { id: 1, userName: '膝盖侠', content: '恭喜！脱拐是大进步，继续加油💪', createTime: '1小时前' },
          { id: 2, userName: '康复小白', content: '我还在拄拐阶段，好羡慕啊', createTime: '30分钟前' },
          { id: 3, userName: '钢铁战士', content: '冰敷确实重要，每天坚持效果看得见', createTime: '10分钟前' }
        ],
        showComments: false
      },
      {
        id: 2,
        userId: 102,
        userName: '膝盖侠',
        userAvatar: '',
        daysSinceSurgery: 30,
        injuryPart: '膝关节',
        injuryType: '半月板撕裂',
        injuryReason: '运动损伤',
        sportBackground: '运动爱好者',
        content: '今天去复查，医生说恢复得不错！但是还说要继续加强股四头肌的力量训练，大家有什么好的建议吗？',
        images: [],
        tags: ['#半月板', '#术后30天', '#力量训练'],
        likes: 45,
        comments: 2,
        isLiked: true,
        createTime: '4小时前',
        commentList: [
          { id: 1, userName: '康复小明', content: '直腿抬高真的很有用！每天做3组，每组15次', createTime: '3小时前' },
          { id: 2, userName: 'Lisa', content: '推荐做靠墙静蹲，慢慢增加角度', createTime: '2小时前' }
        ],
        showComments: false
      },
      {
        id: 3,
        userId: 103,
        userName: '运动康复Lisa',
        userAvatar: '',
        daysSinceSurgery: 90,
        injuryPart: '踝关节',
        injuryType: '跟腱断裂',
        injuryReason: '运动损伤',
        sportBackground: '专业运动员',
        content: '分享一下我的康复食谱：高蛋白、多维生素、适量碳水。康复期间营养跟上真的恢复更快！🥗',
        images: [],
        tags: ['#踝关节', '#术后90天', '#康复食谱'],
        likes: 234,
        comments: 2,
        isLiked: false,
        createTime: '昨天',
        commentList: [
          { id: 1, userName: '健身达人', content: '食谱很科学，收藏了！', createTime: '12小时前' },
          { id: 2, userName: '吃货康复', content: '蛋白质具体吃多少克呀？', createTime: '6小时前' }
        ],
        showComments: false
      },
      {
        id: 4,
        userId: 104,
        userName: '钢铁战士',
        userAvatar: '',
        daysSinceSurgery: 120,
        injuryPart: '膝关节',
        injuryType: 'ACL断裂',
        injuryReason: '运动损伤',
        sportBackground: '运动爱好者',
        content: '今天第一次慢跑了！虽然只跑了500米就累了，但是太激动了！感谢这段时间一直坚持的自己！',
        images: [],
        tags: ['#ACL', '#术后120天', '#慢跑'],
        likes: 567,
        comments: 4,
        isLiked: false,
        createTime: '2天前',
        commentList: [
          { id: 1, userName: '康复小明', content: '太棒了！我90天才能慢跑，你恢复得好快', createTime: '2天前' },
          { id: 2, userName: '运动康复Lisa', content: '500米是个好的开始，加油！', createTime: '1天前' },
          { id: 3, userName: '康复小白', content: '这就是我坚持下去的动力！', createTime: '1天前' },
          { id: 4, userName: '膝盖侠', content: '等能踢球了叫上我', createTime: '12小时前' }
        ],
        showComments: false
      },
      {
        id: 5,
        userId: 105,
        userName: '康复小白',
        userAvatar: '',
        daysSinceSurgery: 7,
        injuryPart: '膝关节',
        injuryType: 'ACL断裂',
        injuryReason: '意外事故',
        sportBackground: '久坐为主',
        content: '刚刚做完手术第7天，腿还是肿的，心情有点低落...有没有同期的朋友交流一下？',
        images: [],
        tags: ['#ACL', '#术后7天', '#新手'],
        likes: 89,
        comments: 2,
        isLiked: false,
        createTime: '3天前',
        commentList: [
          { id: 1, userName: '康复小明', content: '刚做完都这样，别担心，坚持康复训练会好起来的', createTime: '3天前' },
          { id: 2, userName: '膝盖侠', content: '加油！术后第一周最难熬过去了就轻松多了', createTime: '2天前' }
        ],
        showComments: false
      }
    ],

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
  checkUserAuth() {
    const userInfo = wx.getStorageSync('userInfo');
    const isAuthorized = !!(userInfo && userInfo.nickname);
    this.setData({
      'userInfo.isAuthorized': isAuthorized,
      'userInfo.avatar': userInfo ? userInfo.avatar : ''
    });
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      const surgeryDate = new Date(userInfo.surgeryDate);
      const today = new Date();
      const daysDiff = Math.floor((today - surgeryDate) / (1000 * 60 * 60 * 24));

      this.setData({
        userInfo: {
          ...this.data.userInfo,
          daysSinceSurgery: daysDiff,
          injuryPart: userInfo.injuryPart || '膝关节',
          injuryType: userInfo.injuryType || 'ACL重建',
          avatar: userInfo.avatar || '',
          nickname: userInfo.nickname || '康复勇士'
        }
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
        selectedSportBackground: null
      });
    } else {
      this.setData({
        selectedSportBackground: bgId
      });
    }
  },

  // 应用筛选
  applyFilter() {
    this.applyFilters();
    this.setData({
      showFilter: false
    });
  },

  // 执行实际筛选逻辑
  applyFilters() {
    const { selectedPart, selectedPartDetail, selectedInjuryType, selectedSportBackground } = this.data;

    // 检查是否有激活的筛选
    const hasActiveFilter = !!(selectedPart || selectedPartDetail || selectedInjuryType || selectedSportBackground);
    this.setData({ hasActiveFilter });

    // 根据筛选条件过滤帖子
    let filteredPosts = this.data.posts;

    if (selectedPartDetail && selectedInjuryType) {
      // 三级筛选：部位 -> 详细部位 -> 损伤类型
      const part = this.data.filterTags.find(p => p.id === selectedPart);
      const detail = part ? part.children.find(d => d.id === selectedPartDetail) : null;
      const type = detail && detail.children ? detail.children.find(t => t.id === selectedInjuryType) : null;

      filteredPosts = filteredPosts.filter(post =>
        post.injuryPart === (detail ? detail.name : selectedPartDetail) &&
        post.injuryType === (type ? type.name : selectedInjuryType)
      );
    } else if (selectedPartDetail) {
      // 二级筛选：部位 -> 详细部位
      const part = this.data.filterTags.find(p => p.id === selectedPart);
      const detail = part ? part.children.find(d => d.id === selectedPartDetail) : null;
      filteredPosts = filteredPosts.filter(post =>
        post.injuryPart === (detail ? detail.name : selectedPartDetail)
      );
    } else if (selectedPart) {
      // 一级筛选：部位大类
      filteredPosts = filteredPosts.filter(post => {
        // 根据大类匹配对应的部位
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
    }

    this.setData({
      displayPosts: filteredPosts
    });
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      selectedPart: null,
      selectedPartDetail: null,
      selectedInjuryType: null,
      selectedSportBackground: null,
      detailOptions: [],
      injuryTypeOptions: [],
      hasActiveFilter: false,
      displayPosts: this.data.posts
    });
  },

  // 点赞
  toggleLike(e) {
    const postId = e.currentTarget.dataset.id;

    // 更新 posts
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

    // 更新 displayPosts（如果该 post 在筛选结果中）
    const displayPosts = this.data.displayPosts.map(post => {
      if (post.id === postId) {
        const updatedPost = posts.find(p => p.id === postId);
        return { ...updatedPost, showComments: post.showComments };
      }
      return post;
    });

    this.setData({ posts, displayPosts });
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

    wx.showToast({
      title: '评论成功',
      icon: 'success'
    });
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
    const { publishContent, publishImages, userInfo } = this.data;

    if (!publishContent.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    // 构造自动标签
    const autoTags = [
      `#${userInfo.injuryType.replace('重建', '').replace('修复', '')}`,
      `#术后${userInfo.daysSinceSurgery}天`
    ];
    if (userInfo.daysSinceSurgery >= 90) {
      autoTags.push('#90天以上');
    }

    const newPost = {
      id: Date.now(),
      userId: 0,
      userName: userInfo.nickname || '我',
      userAvatar: userInfo.avatar || '',
      daysSinceSurgery: userInfo.daysSinceSurgery,
      injuryPart: userInfo.injuryPart,
      injuryType: userInfo.injuryType,
      injuryReason: userInfo.injuryCause || '',
      sportBackground: userInfo.sportsBackground || '',
      content: publishContent,
      images: publishImages,
      tags: autoTags,
      likes: 0,
      comments: 0,
      isLiked: false,
      createTime: '刚刚',
      commentList: [],
      showComments: false
    };

    const posts = [newPost, ...this.data.posts];
    const displayPosts = [newPost, ...this.data.displayPosts];
    this.setData({ posts, displayPosts });

    wx.showToast({
      title: '发布成功',
      icon: 'success'
    });

    this.closePublishModal();
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

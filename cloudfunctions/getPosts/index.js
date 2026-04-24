/**
 * 云函数：获取帖子列表
 * 位置：cloudfunctions/getPosts/index.js
 * 
 * 功能：
 * 1. 分页获取帖子列表
 * 2. 支持筛选（部位、类型、运动背景等）
 * 3. 返回帖子列表（包含点赞状态）
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 获取集合引用
const postsCollection = db.collection('posts');
const likesCollection = db.collection('likes');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID || wxContext.env?.OPENID;
  
  // 获取请求参数
  const {
    page = 1,
    pageSize = 10,
    // 筛选条件
    injuryPart = '',
    injuryType = '',
    sportBackground = '',
    sportsItems = [],
    keyword = '',
    // 排序
    orderBy = 'createdAt', // createdAt | likes | commentCount
    orderType = 'desc' // desc | asc
  } = event;
  
  try {
    // 构建查询条件
    const whereConditions = {};
    
    // 部位筛选
    if (injuryPart) {
      whereConditions.injuryPart = injuryPart;
    }
    
    // 类型筛选
    if (injuryType) {
      whereConditions.injuryType = injuryType;
    }
    
    // 运动背景筛选
    if (sportBackground) {
      whereConditions.sportBackground = sportBackground;
    }
    
    // 运动项目筛选（使用 in 查询）
    if (sportsItems && sportsItems.length > 0) {
      whereConditions.sportsItems = db.command.in(sportsItems);
    }
    
    // 关键词搜索（搜索内容）
    if (keyword) {
      whereConditions.content = db.RegExp({
        regexp: keyword,
        options: 'i'
      });
    }
    
    // 构建排序
    let orderField = orderBy;
    if (orderBy === 'createdAt') {
      orderField = 'createdAt';
    }
    
    // 查询帖子
    const skip = (page - 1) * pageSize;
    
    const { data: posts, total } = await postsCollection
      .where(whereConditions)
      .orderBy(orderField, orderType)
      .skip(skip)
      .limit(pageSize)
      .get();
    
    // 获取用户点赞状态
    let userLikes = [];
    if (openId) {
      const { data: likes } = await likesCollection
        .where({ userId: openId })
        .field({ postId: true })
        .get();
      userLikes = likes.map(like => like.postId);
    }
    
    // 格式化返回数据（添加点赞状态）
    const formattedPosts = posts.map(post => {
      const postId = typeof post._id === 'string' ? post._id : String(post._id);
      // 确保 daysSinceSurgery 是有效数字
      const daysSinceSurgery = (typeof post.daysSinceSurgery === 'number' && !isNaN(post.daysSinceSurgery)) 
        ? post.daysSinceSurgery 
        : 0;
      
      // 清理标签：移除包含 null、undefined 或 术后0天 的标签
      let tags = (post.tags || []).map(tag => {
        if (tag === null || tag === undefined || tag === 'null' || tag === 'undefined') {
          return null;
        }
        if (typeof tag === 'string') {
          // 移除 "术后null天"、"术后undefined天"、"术后0天" 等无效标签
          if (/^#?术后(null|undefined|0)天$/.test(tag)) {
            return null;
          }
          // 移除包含 null 的标签
          if (tag.includes('null') || tag.includes('undefined')) {
            return null;
          }
        }
        return tag;
      }).filter(tag => tag && tag !== '');
      
      // 如果有有效术后天数，添加正确的术后标签
      if (daysSinceSurgery > 0 && !tags.some(t => t.includes('术后') && t.includes('天'))) {
        tags.push(`#术后${daysSinceSurgery}天`);
      }
      
      return {
        _id: post._id,
        id: postId,
        authorId: post.authorId,
        authorName: post.authorName,
        authorAvatar: post.authorAvatar,
        daysSinceSurgery: daysSinceSurgery,
        injuryPart: post.injuryPart,
        injuryType: post.injuryType,
        injuryReason: post.injuryReason,
        sportBackground: post.sportBackground,
        sportsItems: post.sportsItems || [],
        content: post.content,
        images: post.images || [],
        tags: tags,
        likes: post.likes || 0,
        comments: post.commentCount || 0,
        isLiked: userLikes.includes(postId),
        createTime: formatTime(post.createdAt),
        showComments: false,
        commentList: []
      };
    });
    
    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);
    
    return {
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      }
    };
    
  } catch (err) {
    console.error('获取帖子列表失败:', err);
    return {
      success: false,
      error: err.message || '获取失败'
    };
  }
};

/**
 * 格式化时间戳为相对时间
 */
function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前';
  } else {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const dayNum = date.getDate();
    return month + '月' + dayNum + '日';
  }
}

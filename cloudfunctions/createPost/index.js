/**
 * 云函数：发布帖子
 * 位置：cloudfunctions/createPost/index.js
 * 
 * 功能：
 * 1. 创建新帖子
 * 2. 自动生成标签
 * 3. 返回帖子信息
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 获取集合引用
const postsCollection = db.collection('posts');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID || wxContext.env?.OPENID;
  
  if (!openId) {
    return {
      success: false,
      error: '无法获取用户身份'
    };
  }
  
  // 获取请求参数
  const {
    content = '',
    images = [],
    authorName = '匿名用户',
    authorAvatar = '',
    daysSinceSurgery = 0,
    injuryPart = '',
    injuryType = '',
    injuryReason = '',
    sportBackground = '',
    sportsItems = []
  } = event;
  
  // 参数校验
  if (!content.trim()) {
    return {
      success: false,
      error: '帖子内容不能为空'
    };
  }
  
  if (content.length > 2000) {
    return {
      success: false,
      error: '帖子内容不能超过2000字'
    };
  }
  
  if (images.length > 9) {
    return {
      success: false,
      error: '最多只能上传9张图片'
    };
  }
  
  try {
    // 自动生成标签
    const tags = generateTags(injuryPart, injuryType, daysSinceSurgery, sportsItems);
    
    // 创建帖子数据
    const postData = {
      authorId: openId,
      authorName,
      authorAvatar,
      daysSinceSurgery,
      injuryPart,
      injuryType,
      injuryReason,
      sportBackground,
      sportsItems,
      content: content.trim(),
      images,
      tags,
      likes: 0,
      commentCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // 写入数据库
    const { _id } = await postsCollection.add({
      data: postData
    });
    
    return {
      success: true,
      data: {
        _id,
        ...postData
      }
    };
    
  } catch (err) {
    console.error('发布帖子失败:', err);
    return {
      success: false,
      error: err.message || '发布失败'
    };
  }
};

/**
 * 自动生成帖子标签
 */
function generateTags(injuryPart, injuryType, daysSinceSurgery, sportsItems) {
  const tags = [];
  
  // 添加部位标签
  if (injuryPart) {
    tags.push('#' + injuryPart);
  }
  
  // 添加类型标签
  if (injuryType) {
    tags.push('#' + injuryType);
  }
  
  // 添加术后时间标签（如果有手术）
  if (daysSinceSurgery > 0) {
    tags.push('#术后' + daysSinceSurgery + '天');
  }
  
  // 添加运动项目标签（最多取前3个）
  if (sportsItems && sportsItems.length > 0) {
    const sportTags = sportsItems.slice(0, 3).map(sport => '#' + sport);
    tags.push(...sportTags);
  }
  
  // 根据术后时间添加康复阶段标签
  if (daysSinceSurgery > 0) {
    if (daysSinceSurgery <= 14) {
      tags.push('#术后早期');
    } else if (daysSinceSurgery <= 30) {
      tags.push('#康复中');
    } else if (daysSinceSurgery <= 90) {
      tags.push('#功能恢复期');
    } else {
      tags.push('#重返运动');
    }
  }
  
  // 去重并限制最多10个标签
  return [...new Set(tags)].slice(0, 10);
}

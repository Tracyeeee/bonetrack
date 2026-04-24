/**
 * 云函数：发布帖子
 * 位置：cloudfunctions/createPost/index.js
 * 
 * 功能：
 * 1. 创建新帖子
 * 2. 自动生成标签
 * 3. 内容安全检测（文本+图片）
 * 4. 返回帖子信息
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 获取集合引用
const postsCollection = db.collection('posts');

/**
 * 内容安全检测（文本）
 */
async function checkTextSecurity(content) {
  try {
    const result = await cloud.openapi.security.msgSecCheck({
      openid: '',
      scene: 2,
      version: 2,
      content: content
    });
    
    if (result.errCode === 0) {
      return { safe: true };
    } else {
      return { safe: false, message: '内容存在违规风险，请修改后重试' };
    }
  } catch (err) {
    // 微信接口返回错误时，根据错误码判断
    if (err.errCode === 87014) {
      return { safe: false, message: '内容存在违规风险，请修改后重试' };
    }
    // 其他错误暂不阻止发帖，但记录日志
    console.error('内容安全检测异常:', err);
    return { safe: true, warning: '内容安全检测暂时不可用' };
  }
}

/**
 * 图片安全检测
 */
async function checkImageSecurity(imageList) {
  for (const imageUrl of imageList) {
    try {
      const result = await cloud.openapi.security.imgSecCheck({
        media: {
          url: imageUrl,
          contentType: 'image/jpeg'
        }
      });
      
      if (result.errCode !== 0) {
        return { safe: false, message: '图片存在违规风险，请更换后重试' };
      }
    } catch (err) {
      if (err.errCode === 87014) {
        return { safe: false, message: '图片存在违规风险，请更换后重试' };
      }
      console.error('图片安全检测异常:', err);
    }
  }
  return { safe: true };
}

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
  
  // 确保 daysSinceSurgery 是有效数字
  const validDaysSinceSurgery = typeof daysSinceSurgery === 'number' && !isNaN(daysSinceSurgery) ? daysSinceSurgery : 0;
  
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
  
  // 内容安全检测
  const safetyResult = await checkTextSecurity(content);
  if (!safetyResult.safe) {
    return {
      success: false,
      error: safetyResult.message
    };
  }
  
  // 图片安全检测
  if (images.length > 0) {
    const imageSafetyResult = await checkImageSecurity(images);
    if (!imageSafetyResult.safe) {
      return {
        success: false,
        error: imageSafetyResult.message
      };
    }
  }
  
  try {
    // 自动生成标签
    const tags = generateTags(injuryPart, injuryType, validDaysSinceSurgery, sportsItems);
    
    // 创建帖子数据
    const postData = {
      authorId: openId,
      authorName,
      authorAvatar,
      daysSinceSurgery: validDaysSinceSurgery,
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
  const validDays = typeof daysSinceSurgery === 'number' && !isNaN(daysSinceSurgery) ? daysSinceSurgery : 0;
  
  // 添加部位标签
  if (injuryPart) {
    tags.push('#' + injuryPart);
  }
  
  // 添加类型标签
  if (injuryType) {
    tags.push('#' + injuryType);
  }
  
  // 添加术后时间标签（如果有手术且天数为正）
  if (validDays > 0) {
    tags.push('#术后' + validDays + '天');
  }
  
  // 添加运动项目标签（最多取前3个）
  if (sportsItems && sportsItems.length > 0) {
    const sportTags = sportsItems.slice(0, 3).map(sport => '#' + sport);
    tags.push(...sportTags);
  }
  
  // 根据术后时间添加康复阶段标签
  if (validDays > 0) {
    if (validDays <= 14) {
      tags.push('#术后早期');
    } else if (validDays <= 30) {
      tags.push('#康复中');
    } else if (validDays <= 90) {
      tags.push('#功能恢复期');
    } else {
      tags.push('#重返运动');
    }
  }
  
  // 去重并限制最多10个标签
  return [...new Set(tags)].slice(0, 10);
}

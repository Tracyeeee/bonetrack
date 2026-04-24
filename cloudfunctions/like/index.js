/**
 * 云函数：点赞功能
 * 位置：cloudfunctions/like/index.js
 * 
 * 功能：
 * 1. 点赞/取消点赞帖子
 * 2. 获取用户点赞列表
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 获取集合引用
const likesCollection = db.collection('likes');
const postsCollection = db.collection('posts');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID || wxContext.env?.OPENID;
  
  // 获取请求参数
  const { action = 'toggle' } = event;
  
  try {
    switch (action) {
      case 'toggle':
        return await toggleLike(openId, event);
      case 'list':
        return await getUserLikes(openId, event);
      default:
        return {
          success: false,
          error: '未知操作'
        };
    }
  } catch (err) {
    console.error('点赞操作失败:', err);
    return {
      success: false,
      error: err.message || '操作失败'
    };
  }
};

/**
 * 切换点赞状态
 */
async function toggleLike(openId, event) {
  const { postId = '' } = event;
  
  if (!openId) {
    return {
      success: false,
      error: '无法获取用户身份'
    };
  }
  
  if (!postId) {
    return {
      success: false,
      error: '帖子ID不能为空'
    };
  }
  
  try {
    // 查询是否已经点赞
    const { data: existingLikes } = await likesCollection
      .where({
        postId,
        userId: openId
      })
      .limit(1)
      .get();
    
    let isLiked;
    
    if (existingLikes && existingLikes.length > 0) {
      // 已点赞，取消点赞
      await likesCollection.doc(existingLikes[0]._id).remove();
      
      // 减少帖子的点赞数
      await postsCollection.doc(postId).update({
        data: {
          likes: db.command.inc(-1),
          updatedAt: Date.now()
        }
      });
      
      isLiked = false;
    } else {
      // 未点赞，添加点赞
      await likesCollection.add({
        data: {
          postId,
          userId: openId,
          createdAt: Date.now()
        }
      });
      
      // 增加帖子的点赞数
      await postsCollection.doc(postId).update({
        data: {
          likes: db.command.inc(1),
          updatedAt: Date.now()
        }
      });
      
      isLiked = true;
    }
    
    // 获取更新后的点赞数
    const postResult = await postsCollection.doc(postId).field({ likes: true }).get();
    const post = postResult.data;
    const likes = post ? post.likes || 0 : 0;
    
    return {
      success: true,
      data: {
        isLiked,
        likes
      }
    };
    
  } catch (err) {
    console.error('切换点赞状态失败:', err);
    throw err;
  }
}

/**
 * 获取用户点赞列表
 */
async function getUserLikes(openId, event) {
  if (!openId) {
    return {
      success: false,
      error: '无法获取用户身份'
    };
  }
  
  const { page = 1, pageSize = 20 } = event;
  
  try {
    const skip = (page - 1) * pageSize;
    
    // 查询用户的所有点赞
    const { data: likes, total } = await likesCollection
      .where({ userId: openId })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();
    
    // 获取被点赞的帖子信息
    const postIds = likes.map(like => like.postId);
    let posts = [];
    
    if (postIds.length > 0) {
      const { data: postData } = await postsCollection
        .where({
          _id: db.command.in(postIds)
        })
        .get();
      
      // 按点赞顺序排列帖子
      const postMap = new Map(postData.map(p => [p._id, p]));
      posts = postIds.map(id => postMap.get(id)).filter(Boolean);
    }
    
    // 格式化返回数据
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      id: post._id,
      authorId: post.authorId,
      authorName: post.authorName,
      authorAvatar: post.authorAvatar,
      daysSinceSurgery: post.daysSinceSurgery,
      injuryPart: post.injuryPart,
      injuryType: post.injuryType,
      content: post.content,
      images: post.images || [],
      tags: post.tags || [],
      likes: post.likes || 0,
      comments: post.commentCount || 0,
      isLiked: true,
      createTime: formatTime(post.createdAt)
    }));
    
    return {
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page,
          pageSize,
          total,
          hasMore: page * pageSize < total
        }
      }
    };
    
  } catch (err) {
    console.error('获取点赞列表失败:', err);
    throw err;
  }
}

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

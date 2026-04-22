/**
 * 云函数：评论功能
 * 位置：cloudfunctions/comment/index.js
 * 
 * 功能：
 * 1. 添加评论
 * 2. 获取帖子评论列表
 * 3. 删除评论
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 获取集合引用
const commentsCollection = db.collection('comments');
const postsCollection = db.collection('posts');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID || wxContext.env?.OPENID;
  
  // 获取请求参数
  const { action = 'add' } = event;
  
  try {
    switch (action) {
      case 'add':
        return await addComment(openId, event);
      case 'list':
        return await getComments(event);
      case 'delete':
        return await deleteComment(openId, event);
      default:
        return {
          success: false,
          error: '未知操作'
        };
    }
  } catch (err) {
    console.error('评论操作失败:', err);
    return {
      success: false,
      error: err.message || '操作失败'
    };
  }
};

/**
 * 添加评论
 */
async function addComment(openId, event) {
  const {
    postId = '',
    content = '',
    authorName = '匿名用户',
    authorAvatar = ''
  } = event;
  
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
  
  if (!content.trim()) {
    return {
      success: false,
      error: '评论内容不能为空'
    };
  }
  
  if (content.length > 500) {
    return {
      success: false,
      error: '评论内容不能超过500字'
    };
  }
  
  try {
    // 创建评论数据
    const commentData = {
      postId,
      authorId: openId,
      authorName,
      authorAvatar,
      content: content.trim(),
      createdAt: Date.now()
    };
    
    // 写入评论
    const { _id } = await commentsCollection.add({
      data: commentData
    });
    
    // 更新帖子的评论数
    await postsCollection.doc(postId).update({
      data: {
        commentCount: db.command.inc(1),
        updatedAt: Date.now()
      }
    });
    
    return {
      success: true,
      data: {
        _id,
        ...commentData,
        createTime: formatTime(commentData.createdAt)
      }
    };
    
  } catch (err) {
    console.error('添加评论失败:', err);
    throw err;
  }
}

/**
 * 获取评论列表
 */
async function getComments(event) {
  const {
    postId = '',
    page = 1,
    pageSize = 20
  } = event;
  
  if (!postId) {
    return {
      success: false,
      error: '帖子ID不能为空'
    };
  }
  
  try {
    const skip = (page - 1) * pageSize;
    
    const { data: comments, total } = await commentsCollection
      .where({ postId })
      .orderBy('createdAt', 'asc')
      .skip(skip)
      .limit(pageSize)
      .get();
    
    // 格式化返回数据
    const formattedComments = comments.map(comment => ({
      id: comment._id,
      _id: comment._id,
      postId: comment.postId,
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorAvatar: comment.authorAvatar,
      content: comment.content,
      createTime: formatTime(comment.createdAt)
    }));
    
    return {
      success: true,
      data: {
        comments: formattedComments,
        pagination: {
          page,
          pageSize,
          total,
          hasMore: page * pageSize < total
        }
      }
    };
    
  } catch (err) {
    console.error('获取评论列表失败:', err);
    throw err;
  }
}

/**
 * 删除评论
 */
async function deleteComment(openId, event) {
  const { commentId = '', postId = '' } = event;
  
  if (!openId) {
    return {
      success: false,
      error: '无法获取用户身份'
    };
  }
  
  if (!commentId) {
    return {
      success: false,
      error: '评论ID不能为空'
    };
  }
  
  try {
    // 查询评论是否存在且属于当前用户
    const { data: comments } = await commentsCollection.doc(commentId).get();
    
    if (!comments) {
      return {
        success: false,
        error: '评论不存在'
      };
    }
    
    if (comments.authorId !== openId) {
      return {
        success: false,
        error: '只能删除自己的评论'
      };
    }
    
    // 删除评论
    await commentsCollection.doc(commentId).remove();
    
    // 减少帖子的评论数（如果提供了postId）
    if (postId) {
      await postsCollection.doc(postId).update({
        data: {
          commentCount: db.command.inc(-1),
          updatedAt: Date.now()
        }
      });
    }
    
    return {
      success: true,
      message: '删除成功'
    };
    
  } catch (err) {
    console.error('删除评论失败:', err);
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

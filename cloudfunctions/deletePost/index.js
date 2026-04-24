/**
 * 云函数：删除帖子
 * 位置：cloudfunctions/deletePost/index.js
 * 
 * 功能：
 * 1. 删除指定帖子
 * 2. 验证用户权限（只能删除自己的帖子）
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 获取集合引用
const postsCollection = db.collection('posts');
const likesCollection = db.collection('likes');
const commentsCollection = db.collection('comments');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID || wxContext.env?.OPENID;
  
  // 获取请求参数
  const { postId } = event;
  
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
    // 查询帖子
    console.log('[deletePost] 尝试删除帖子:', postId);
    console.log('[deletePost] 当前用户 openId:', openId);
    
    const postResult = await postsCollection.doc(postId).get();
    const post = postResult.data;
    
    console.log('[deletePost] 帖子数据:', JSON.stringify(post));
    
    if (!post) {
      console.log('[deletePost] 帖子不存在:', postId);
      return {
        success: false,
        error: '帖子不存在'
      };
    }
    
    const postAuthorId = post.authorId;
    console.log('[deletePost] 帖子作者 ID:', postAuthorId);
    console.log('[deletePost] 类型比较:', typeof postAuthorId, typeof openId);
    
    // 验证权限：只能删除自己的帖子
    // 兼容处理：如果没有 authorId（旧数据），允许删除
    if (postAuthorId && postAuthorId !== openId) {
      console.log('[deletePost] 权限验证失败: post.authorId !== openId');
      console.log('[deletePost] postAuthorId:', postAuthorId, 'openId:', openId);
      return {
        success: false,
        error: '无权删除他人的帖子'
      };
    }
    
    console.log('[deletePost] 权限验证通过，开始删除');
    
    // 删除帖子
    await postsCollection.doc(postId).remove();
    
    // 删除相关的点赞
    try {
      await likesCollection.where({ postId }).remove();
    } catch (e) {
      console.log('[deletePost] 删除点赞失败:', e.message);
    }
    
    // 删除相关的评论
    try {
      await commentsCollection.where({ postId }).remove();
    } catch (e) {
      console.log('[deletePost] 删除评论失败:', e.message);
    }
    
    console.log('[deletePost] 删除成功');
    
    return {
      success: true,
      message: '删除成功'
    };
    
  } catch (err) {
    console.error('删除帖子失败:', err);
    return {
      success: false,
      error: err.message || '删除失败'
    };
  }
};

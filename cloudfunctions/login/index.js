/**
 * 云函数：用户登录/注册
 * 位置：cloudfunctions/login/index.js
 * 
 * 功能：
 * 1. 获取/创建用户信息
 * 2. 返回用户完整信息
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 获取用户集合引用
const usersCollection = db.collection('users');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID || wxContext.env?.OPENID;
  
  if (!openId) {
    return {
      success: false,
      error: '无法获取用户身份'
    };
  }
  
  try {
    // 查询用户是否已存在
    const { data: existingUsers } = await usersCollection
      .where({ openId })
      .limit(1)
      .get();
    
    let userInfo;
    
    if (existingUsers && existingUsers.length > 0) {
      // 用户已存在，返回用户信息
      userInfo = existingUsers[0];
    } else {
      // 新用户，创建默认用户信息
      userInfo = {
        openId,
        nickName: '伤友_' + openId.slice(-4),
        avatarUrl: '',
        daysSinceSurgery: 0,
        surgeryDate: '',
        injuryPart: '',
        injuryType: '',
        injuryReason: '',
        sportBackground: '',
        sportsItems: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // 写入数据库
      const { _id } = await usersCollection.add({
        data: userInfo
      });
      
      userInfo._id = _id;
    }
    
    return {
      success: true,
      data: userInfo
    };
    
  } catch (err) {
    console.error('登录失败:', err);
    return {
      success: false,
      error: err.message || '登录失败'
    };
  }
};

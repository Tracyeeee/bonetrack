/**
 * 云函数：获取微信用户 OpenID
 * 位置：cloudfunctions/getOpenId/index.js
 * 
 * 使用方法：
 * wx.cloud.callContainer({
 *   name: 'getOpenId',
 *   success: res => console.log(res.result.openid)
 * })
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  // 获取 WXContext (包含 openid)
  const wxContext = cloud.getWXContext();
  
  return {
    openid: wxContext.OPENID || wxContext.env?.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    env: cloud.DYNAMIC_CURRENT_ENV
  };
};

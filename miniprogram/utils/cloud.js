/**
 * 云开发工具类
 * 位置：miniprogram/utils/cloud.js
 *
 * 提供统一的云函数调用方法
 */

const app = getApp();

// 云函数基础配置
const CLOUD_FUNCTION_CONFIG = {
  // 云开发环境ID（与 app.js 保持一致）
  env: 'cloud1-d9g2o0owa3e2aeffe',

  // 云函数名称映射
  functions: {
    login: 'login',           // 用户登录
    getPosts: 'getPosts',     // 获取帖子列表
    createPost: 'createPost', // 发布帖子
    deletePost: 'deletePost', // 删除帖子
    comment: 'comment',       // 评论功能
    like: 'like'              // 点赞功能
  }
};

/**
 * 调用云函数（使用 wx.cloud.callFunction）
 * @param {string} name 云函数名称
 * @param {object} data 传递给云函数的数据
 * @returns {Promise}
 */
function callFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    // 检查是否已初始化云开发
    if (!wx.cloud) {
      reject(new Error('请开通云开发'));
      return;
    }

    const envId = CLOUD_FUNCTION_CONFIG.env || app.globalData.env;

    wx.cloud.callFunction({
      name: name,
      data: data,
      config: {
        env: envId
      },
      success: (res) => {
        console.log(`[云函数 ${name}] 调用成功:`, res);
        if (res.errMsg && res.errMsg.includes('ok')) {
          resolve(res.result);
        } else {
          reject(new Error(res.result?.error || res.errMsg || '调用失败'));
        }
      },
      fail: (err) => {
        console.error(`[云函数 ${name}] 调用失败:`, err);
        reject(err);
      }
    });
  });
}

/**
 * 调用云函数（旧版云函数方式，兼容）
 * @param {string} name 云函数名称
 * @param {object} data 传递给云函数的数据
 * @returns {Promise}
 */
function callFunctionLegacy(name, data = {}) {
  return new Promise((resolve, reject) => {
    // 检查是否已初始化云开发
    if (!wx.cloud) {
      reject(new Error('请开通云开发'));
      return;
    }
    
    wx.cloud.callFunction({
      name: name,
      data: data,
      success: (res) => {
        console.log(`[云函数 ${name}] 调用成功:`, res);
        if (res.errMsg && res.errMsg.includes('ok')) {
          resolve(res.result);
        } else {
          reject(new Error(res.result?.error || '调用失败'));
        }
      },
      fail: (err) => {
        console.error(`[云函数 ${name}] 调用失败:`, err);
        reject(err);
      }
    });
  });
}

/**
 * 获取用户登录状态
 * @returns {Promise}
 */
function login() {
  return callFunction('login', {});
}

/**
 * 获取帖子列表
 * @param {object} options 查询参数
 * @returns {Promise}
 */
function getPosts(options = {}) {
  const defaultOptions = {
    page: 1,
    pageSize: 10,
    orderBy: 'createdAt',
    orderType: 'desc'
  };
  return callFunction('getPosts', { ...defaultOptions, ...options });
}

/**
 * 发布帖子
 * @param {object} postData 帖子数据
 * @returns {Promise}
 */
function createPost(postData) {
  return callFunction('createPost', postData);
}

/**
 * 删除帖子
 * @param {string} postId 帖子ID
 * @returns {Promise}
 */
function deletePost(params) {
  return callFunction('deletePost', params);
}

/**
 * 评论操作
 * @param {object} params { action: 'add'|'list'|'delete', ... }
 * @returns {Promise}
 */
function comment(params) {
  return callFunction('comment', params);
}

/**
 * 点赞操作
 * @param {object} params { action: 'toggle'|'list', postId }
 * @returns {Promise}
 */
function like(params) {
  return callFunction('like', params);
}

/**
 * 上传图片到云存储
 * @param {string} tempFilePath 临时文件路径
 * @returns {Promise<string>} 云存储文件ID
 */
function uploadImage(tempFilePath) {
  return new Promise((resolve, reject) => {
    const extName = tempFilePath.split('.').pop();
    const cloudPath = `images/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extName}`;
    
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: tempFilePath,
      success: (res) => {
        console.log('图片上传成功:', res);
        resolve(res.fileID);
      },
      fail: (err) => {
        console.error('图片上传失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 选择图片并上传
 * @param {number} count 选择的图片数量
 * @returns {Promise<string[]>} 云存储文件ID数组
 */
function chooseAndUploadImages(count = 9) {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: count,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        try {
          const tempFiles = res.tempFiles;
          const fileIDs = [];
          
          for (const file of tempFiles) {
            const fileID = await uploadImage(file.tempFilePath);
            fileIDs.push(fileID);
          }
          
          resolve(fileIDs);
        } catch (err) {
          reject(err);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 导出所有方法
module.exports = {
  callFunction,
  callFunctionLegacy,
  login,
  getPosts,
  createPost,
  deletePost,
  comment,
  like,
  uploadImage,
  chooseAndUploadImages,
  CLOUD_FUNCTION_CONFIG
};

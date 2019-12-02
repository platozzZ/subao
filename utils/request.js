// const app = getApp()
const login = require('./wxLogin.js')
const baseUrl = require('./baseUrl.js')
//添加事件结束
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
}
const request = (url, method, data, tokens, noLoading, isFirst, app) => {
  // console.log('request-app:', app)
  // console.log(noLoading)
  return new Promise((resolve, reject) => {
    if (!noLoading){
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    let token
    if (tokens) {
      token = wx.getStorageSync('token')
    }
    // let token = wx.getStorageSync('token')
    // console.log('token:', token)
    wx.request({
      url: baseUrl + url,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json',
        'access_token': token
      },
      success: function (res) {
        wx.hideLoading()
        // console.log('request:', res)
        if (res.statusCode == 200) {
          // if (!isFirst){
            if (res.data.rlt_code == 'E_0003' || res.data.rlt_code == 'E_0002') {
              // login.wxLogin(app)//
              app.globalData.isLogin = false
              // let pages = getCurrentPages();    //获取当前页面信息栈
              // let curPage = pages[pages.length - 1]     //获取上一个页面信息栈
              // let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈
              // console.log(curPage)
              
              // wx.showModal({
              //   title: '提示',
              //   content: '您还未登录，请登录后查看',
              //   confirmText: '去登录',
              //   confirmColor: '#0060e4',
              //   success(res) {
              //     if (res.confirm) {
              //       wx.navigateTo({
              //         url: '../login/login?path=newIndex',
              //       })
              //     } else if (res.cancel) {
              //       wx.switchTab({
              //         url: '../newIndex/newIndex',
              //       })
              //     }
              //   }
              // })
              return
            }
          // }
          
          resolve(res); //返回成功提示信息
        } else {
          reject(res.data.rlt_msg); //返回错误提示信息
        }
      },
      fail: function (res) {
        wx.hideLoading()
        console.log('fail：', res)
        reject("网络连接错误"); //返回错误提示信息
        if (res.errMsg.indexOf('timeout') > -1) {
          wx.showToast({
            title: '网络连接超时，请检查网络后刷新重试',
            icon: 'none',
            duration: 2000
          })
          return
        }
        wx.showToast({
          title: '网络连接错误，请检查网络后刷新重试',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function (res) {
        // console.log('complete:',res)

      }
    })
  });
}

module.exports = {
  request: request
}

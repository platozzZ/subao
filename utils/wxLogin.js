// const app = getApp()
const baseUrl = require('./baseUrl.js')
const api = require('./request.js')
const getAll = require('./getAll.js')
console.log(baseUrl)
// console.log(api)
// console.log(getAll)
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
const wxLogin = (that) => {
  console.log('wxLogin-that:', that)
  // console.log(that.globalData)
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.login({
      success: res => {
        let obj = wx.getLaunchOptionsSync()
        console.log(obj)
        if (res.code) {
          let data = { 
            code: res.code,
            scene: obj.scene
          }
          api.request('/pms/weixin/exchange', 'POST', data, false).then(res => {
            console.log("login", res)
            if (res.statusCode == 200) {
              if (res.data.rlt_code == "S_0000") {
                wx.setStorageSync('token', res.data.data.access_token)
                that.globalData.token = res.data.data.access_token
                that.globalData.isLogin = true
                that.globalData.user_mobile = res.data.data.user_mobile
              } else {
                wx.setStorageSync('openid', res.data.data.openid)
                that.globalData.open_id = res.data.data.openid
                
                // console.log(that.globalData)
              }
              wx.reLaunch({
                url: '../newIndex/newIndex',
              })
              wx.hideLoading()
              resolve(res); //返回成功提示信息
            } else {
              // wx.reLaunch({
              //   url: '/pages/login/login',
              // })
              reject(res.data.rlt_msg); //返回错误提示信息
              wx.showToast({
                title: res.data.rlt_msg,
                icon: 'none',
                duration: 2000
              })
            }
          }).catch(res => {
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
          }).finally(() => {
            // wx.stopPullDownRefresh()
          })
          
        }
      }

    })

  });
}
module.exports = {
  wxLogin: wxLogin
}

// const app = getApp()
// const login = require('./wxLogin.js')
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
const getAll = (that,loading,isFirst,route) => {
  console.log('getAll-that:',that)
  console.log('getAll:', 'loading:', loading, 'isFirst:', isFirst)
  return new Promise((resolve, reject) => {
    if (loading){
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    let token = wx.getStorageSync('token')
    console.log('token:', token)
    wx.request({
      url: baseUrl + '/pms/system/user/account_house_data.do',
      data: '',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'access_token': token
      },
      success: function (res) {
        console.log('getAll:',res.data)
        if (loading) {
          wx.hideLoading()
        }
        // console.log('request:', res)
        if (res.statusCode == 200) {
          if (res.data.rlt_code == "S_0000") {
            let art = res.data.data
            // if (isFirst) {
              // wx.set
            // if (art.account_num == 0 || art.account_online == 0) {
              if (art.account_num == 0) {
                wx.reLaunch({
                  url: '/pages/account/account?status=0&path=' + route,
                })
              } else {
                if (art.third_house_num == 0) {
                  wx.reLaunch({
                    url: '/pages/house/house?num=0',
                  })
                } else if (art.third_house_num > 0 && art.bind_house_num == 0) {
                  wx.reLaunch({
                    url: '/pages/house/house?num=1',
                  })
                } else {
                  that.onLoad()
                  that.onShow()
                }

              }
          } else {
            that.showToast(res.data.rlt_msg)
          }
          resolve(res); //返回成功提示信息
        } else {
          reject(res.data.rlt_msg); //返回错误提示信息
        }
        // setTimeout(function () {
        // }, 500)
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
  getAll: getAll
}

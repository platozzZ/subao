const login = require('./utils/wxLogin.js')
const api = require('./utils/request.js')
const mtjwxsdk = require('./utils/mtj-wx-sdk.js');
App({
  onLaunch: function () {
    let that = this
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // console.log(res)
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    wx.getSystemInfo({
      success: res => {
        console.log(res)
        that.globalData.screenHeight = res.windowHeight
        that.globalData.screenWidth = res.windowWidth
        that.globalData.top = res.windowHeight * 0.6
        if (res.model.indexOf('iPhone X') != -1) {
          that.globalData.isIphoneX = true
        }
      }
    })
    api.request('/pms/share/setting/default', 'GET', '', true,true).then(res => {
      console.log('setting:', res.data)
      that.globalData.shareImg = res.data.data.thumbnail
      that.globalData.shareTitle = res.data.data.title
    }).catch(res => {
    }).finally(() => { })
  },
  globalData: {
    token: null,
    open_id: null,
    userInfo: null,
    toRelation: null,
    account_num: null,
    account_online: null,
    bind_house_num: null,
    third_house_num: null,
    screenHeight: '',
    screenWidth: '',
    top: '',
    isLogin: false,
    tabCur: null,
    shareImg: null,
    shareTitle: null,
    isIphoneX: false,
    getCode: false
  }
})
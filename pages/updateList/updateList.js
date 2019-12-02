const app = getApp()
const api = require('../../utils/request.js')
var that
Page({
  data: {
    art: '',
    houseId: '',
    item: ''
  },
  onLoad: function (options) {
    that = this
    console.log(options)
    that.setData({
      houseId: options.id,
      item: options.item
    })
  },
  getData(e) {
    console.log(e)
    api.request('/pms/upload/house/status_detail.do', 'POST', e, true).then(res => {
      console.log('getData:', res.data)
      let art = res.data.data
      if (res.data.rlt_code == 'S_0000') {
        // if (art.house_status == )
        that.setData({
          art: res.data.data
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)
      // that.showToast(res.data.rlt_msg)
    }).finally(() => { })
  },
  commitHouse(e) {
    app.mtj.trackEvent('wode_20')
    console.log(e)
    let data = {
      upload_house_id: that.data.houseId
    }
    api.request('/pms/upload/house/commit.do', 'POST', data, true).then(res => {
      console.log('commitHouse:', res.data)
      let art = res.data.data
      if (res.data.rlt_code == 'S_0000') {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000,
          success(res){
            setTimeout(function () {
              that.getData(data)
            },2000)
          }
        })
      } else {
        console.log(data)
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)
      // that.showToast(res.data.rlt_msg)
    }).finally(() => { })
  },

  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
  toProgress() {
    app.mtj.trackEvent('wode_21')
    wx.navigateTo({
      url: '../progress/progress?id=' + that.data.houseId,
    })
  },
  onShow: function () {
    let data = {
      upload_house_id: that.data.houseId
    }
    that.getData(data)
  },
  onUnload(){
    console.log('onunload')
    // wx.navigateTo({
    //   url: '../demo/demo',
    // })
  }

})
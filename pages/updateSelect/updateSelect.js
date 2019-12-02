const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that

Page({
  data: {

  },
  onLoad(options) {
    that = this
    // that.setData({
    //   accountId: options.id
    // })
  },

  //选择上传
  uploadSelct(e) {
    console.log(e)
    let selectIndex = e.currentTarget.dataset.selectindex
    wx.navigateTo({
      url: '../updateHouse/updateHouse?selectIndex='+ selectIndex,
    })
    // let data = {
    //    account_id: id,
    // }
    // api.request('', 'POST', data, true, false).then(res => {
    //   console.log('选择上传类型结果：', res)

    //   if (res.data.rlt_code == 'S_0000') {

    //     if (id == 0) {
        
    //     } else {
         
    //     }

    //   } else {
    //     that.showToast(res.data.rlt_msg)
    //   }
    // }).catch(res => {
    //   console.log(res)

    // }).finally(() => {})

  },

  //toast框
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  }

})
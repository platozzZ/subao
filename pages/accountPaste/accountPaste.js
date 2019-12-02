const app = getApp()
const api = require('../../utils/request.js')
var that
let sourceObj = {
  ['01']: {
    source_text: '途家',
  },
  ['02']: {
    source_text: '爱彼迎'
  },
  ['04']: {
    source_text: '小猪'
  },
  ['05']: {
    source_text: '榛果'
  },
  ['06']: {
    source_text: '木鸟'
  }
}
Page({
  data: {

    source: '',
    accountId: '',
    delta: ''

  },
  onLoad(options) {
    console.log(options)
    that = this
    that.setData({
      accountId: options.id,
      source: options.source,
      delta: options.delta
    })
    // that.setData({
    //   source: options.source
    // })
    let title = sourceObj[options.source].source_text
    wx.setNavigationBarTitle({
      title: title + '账号绑定',
    })
    // that.getData(options.id)

  },

  //账号绑定确定
  confirm(e) {
    console.log(e)
    let data = e.detail.value
    if (data.remote_house_url == '') {
      that.showToast('请粘贴房源链接')
      return false;
    }
    data.account_id = that.data.accountId
    console.log(data)
    api.request('/pms/third/account/add_house_url.do', 'POST', data, true, false).then(res => {
      console.log('粘贴房源链接结果：', res)

      if (res.data.rlt_code == 'S_0000') {
        that.backList()
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => {})
  },

  //获取平台账号详情
  getData(e, noLoading) {
    let data = {
      account_id: e
    }
    console.log(data)
    api.request('/pms/third/account/detail.do', 'POST', data, true, noLoading).then(res => {

      if (res.data.rlt_code == "S_0000") {
        console.log('getData:', res.data)
        let detail = res.data.data;

        // let title = sourceObj[detail.source].source_text
        // wx.setNavigationBarTitle({
        //   title: title + '账号绑定',
        // })
        // that.setData({
        //   source: detail.source
         
        // })
 
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => { })
  },
  backList(e) {
    wx.showToast({
      title: '绑定成功',
      icon: 'success',
      mask: true,
      duration: 2000,
      success(res) {
        console.log(that.data.delta)
        let delta = that.data.delta
        setTimeout(function () {
          if (delta == 2){
            wx.navigateBack({
              delta: 2
            })
          } else {
            wx.navigateBack()
          }
        }, 2000)
      }
    })
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
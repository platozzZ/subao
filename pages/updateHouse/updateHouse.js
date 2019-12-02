const app = getApp()
const api = require('../../utils/request.js')
var that
Page({
  data: {
    imgHeight: 0,
    houseList: [],
    selectIndex: '',
  },
  onLoad: function (options) {
    app.mtj.trackEvent('wode_9')
    that = this
    that.setData({
      selectIndex: options.selectIndex
    })
     wx.setNavigationBarTitle({
        title: options.selectIndex == 0?'上传新房源':'上传多平台'
     })
    
  },
  getData(e){
    console.log(e)
    api.request('/pms/upload/house/list.do', 'POST', e, true).then(res => {
      console.log('getData:', res.data)
      let art = res.data
      if(art.rlt_code == 'S_0000'){
        that.setData({
          houseList: art.data
        })
      } else {
        that.showToast(art.rlt_msg)
      }
    }).catch(res => {
      that.showToast(art.rlt_msg)
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
  imageLoad(e){
    console.log(e)
    let imgWidth = app.globalData.screenWidth
    let imgHeight = e.detail.height / e.detail.width * imgWidth
    that.setData({
      imgHeight: imgHeight
    })
  },
  toList(e) {
    app.mtj.trackEvent('wode_10')
    wx.navigateTo({
      url: '../uploadStep1/uploadStep1?first=true&origin=' + that.data.selectIndex,
    })
  },
  toStep(e){
    let item = encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item))
    console.log(item)
    if (that.data.selectIndex == 0){
      if (e.currentTarget.dataset.order == 1){
        wx.navigateTo({
          // url: '../updateList/updateList?id=' + e.currentTarget.dataset.id,
          url: '../updateList/updateList?item=' + item + '&id=' + e.currentTarget.dataset.id,
        })
      } else {
        wx.navigateTo({
          url: '../uploadStep1/uploadStep1?item=' + item + '&origin=' + that.data.selectIndex,
        })
      }
      return
    }
    wx.navigateTo({
      url: '../uploadStep1/uploadStep1?item=' + item + '&origin=' + that.data.selectIndex,
    })
  },
  onShow: function () {
    let data = {
      upload_type: Number(that.data.selectIndex)
    }
    that.getData(data)
  },

})
const app = getApp()
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'
var that
Page({
  data: {
    houseId: '',
    art: '',
    checkList: [
      { name: '途家', source: '01', checked: false },
      { name: '爱彼迎', source: '02', checked: false },
      { name: '榛果', source: '05', checked: false },
      { name: '小猪', source: '04', checked: false },
      { name: '木鸟', source: '06', checked: false }
    ],
    sources: []
  },
  onLoad: function (options) {
    that = this
    console.log(options)
    that.setData({
      houseId: options.id
    })
    let data = {
      upload_house_id: options.id,
      type: 1
    }
    that.getData(data)
  },
  onShow: function () {

  },
  getData(e) {
    console.log(e)
    api.request('/pms/upload/house/detail.do', 'POST', e, true).then(res => {
      console.log('getData:', res.data)
      // let art = res.data
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        let sources = art.sources
        console.log(sources)
        let sourcesList = new Array(sources)
        console.log(sourcesList)
        let newArr
        sourcesList.map((item, index, arr) => {
          console.log(item)
          let jsonItem = JSON.parse(item)
          console.log(jsonItem)
          newArr = jsonItem
        })
        console.log(newArr)
        let checkList = that.data.checkList
        newArr.map((item, index, arr) => {
          checkList.map((itemc, indexc, arrc) => {
            if (item.source == itemc.source) {
              itemc.checked = true
            }
          })
        })
        that.setData({
          art: art,
          sources: newArr,
          checkList: checkList
        })
      } else {
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
  
  onUnload() {
    console.log('onunload')
    // wx.navigateTo({
    //   url: '../demo/demo',
    // })
  }

})
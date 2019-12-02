const app = getApp();
const api = require('../../utils/request.js')
var that
Page({
  data: {
    list: [
      { title: '提前1天预定', des: '房客需提前1天预定当晚的房源', checked: false },
      { title: '22:00前', des: '房客可在当天22:00前预定当晚的房源', checked: false },
      { title: '23:00前', des: '房客可在当天23:00前预定当晚的房源', checked: false },
      { title: '24:00前', des: '房客可在当天24:00前预定当晚的房源', checked: false },
      { title: '次日1:00前', des: '房客可在次日凌晨1:00前预定当晚的房源', checked: false },
      { title: '次日2:00前', des: '房客可在次日凌晨2:00前预定当晚的房源', checked: false },
      { title: '不限时间', des: '房客可在不限时间预定当晚的房源', checked: false },
    ],
  },
  onLoad: function (options) {
    that = this
    console.log(options)
    if (!!options.name) {
      let list = that.data.list
      list.map((item, index, arr) => {
        if (item.title == options.name) {
          item.checked = true
        }
      })
      that.setData({
        list: list
      })
    }
  },
  radioChange(e) {
    console.log(e)
    let pages = getCurrentPages();    //获取当前页面信息栈
    let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈

    prevPage.setData({
      'art.preset_time_now': e.detail.value
    })
    wx.navigateBack()
  },
})
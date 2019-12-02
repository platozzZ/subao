const app = getApp();
const api = require('../../utils/request.js')
var that
Page({
  data: {
    list: [
      { title: '接待2-12岁儿童', checked: false },
      { title: '接待2岁以下婴幼儿', checked: false },
      { title: '接待60岁以上老人', checked: false },
      { title: '接待外宾', checked: false },
      { title: '允许抽烟', checked: false },
      { title: '允许携带宠物', checked: false }
    ],
    textareaValue: ''
  },
  onLoad: function (options) {
    that = this
    console.log(options)
    if (options.name != '请选择') {
      let obj = options.name
      let list = that.data.list
      let objArr = obj.split(",");
      console.log(objArr)
      let objLength = objArr.length
      list.map((item, index, arr) => {
        if (obj.indexOf(item.title) > -1) {
          item.checked = true
        }
        if (objArr[objLength - 1] != item.title){
          console.log(objArr[objLength - 1])
          that.setData({
            textareaValue: objArr[objLength - 1] ? objArr[objLength - 1]:''
          })
        }
      })
      that.setData({
        list: list
      })
    }
  },
  formSubmit(e){
    console.log(e)
    let value = e.detail.value
    let reception = value.reception.toString()
    console.log(value)
    let data = reception + ',' + value.reception_textarea
    console.log(data)
    let pages = getCurrentPages();    //获取当前页面信息栈
    let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈

    prevPage.setData({
      'art.reception_require': data
    })
    wx.navigateBack()
  },
  radioChange(e) {
    console.log(e)
    let pages = getCurrentPages();    //获取当前页面信息栈
    let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈

    prevPage.setData({
      recepTion: e.detail.value
    })
    wx.navigateBack()
  },
})
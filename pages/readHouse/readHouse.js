const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
Page({
  data: {
    list: [],
    setInterval: true,
    disabled: true,
    title: '读取中...',
    scrollTop: 1000
  },
  onLoad: function (options) {
    console.log('onLoad')
    that = this
    that.readHouse()
    let pages = getCurrentPages();    //获取当前页面信息栈
    let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈
    prevPage.setData({
      isRefresh: true
    })
    
  },
  getData(noLoading){
    api.request('/pms/house/reading_house.do', 'POST', '', true, noLoading).then(res => {
      console.log('getData:', res.data)
      if (res.data.rlt_code == "S_0000"){
        let art = res.data.data
        console.log(art)
        let jsonStr = JSON.stringify(art)
        console.log(jsonStr)
        var jsonObj = JSON.parse(jsonStr)
        console.log(jsonObj)
        let newArr = []
        jsonObj.map((item, index, arr) => {
          console.log(item)
          let jsonItem = JSON.parse(item)
          console.log(jsonItem)
          newArr.push(jsonItem)
        })
        newArr.map((item,index,arr) =>{
          if(item.type == '04'){
            that.setData({
              setInterval: false,
              disabled: false,
              title: '读取完成'
            })
          }
        })
        that.setData({
          list: newArr,
          scrollTop: newArr.length * 200
        })
        console.log(newArr)
        if (that.data.setInterval) {
          setTimeout(function () {
            that.getData(true)
          }, 10000)
        }
      }
    }).catch(res => {

    }).finally(() => { })
  },
  readHouse(e) {
    api.request('/pms/house/sync_all_house.do', 'POST', '', true, true).then(res => {
      console.log("readHouse", res.data)
      that.getData()
    }).catch(res => {
    }).finally(() => {})
  },

  toNewhouse(e) {
    wx.redirectTo({
      url: '../newHouse/newHouse',
    })
  },
  onShow: function () {
    
  }
})
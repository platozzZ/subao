const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
Page({
  data: {
    houseList: [],
    houseId: '',
  },
  onLoad(options) {
    that = this
    console.log(options)
    if(options.id){
      that.setData({
        houseId: options.id
      })
    }
    let data = {
      assess_status: null
    }
    that.getMyHouse(data)

  },

  getMyHouse(data) {
    // let pages = data
    api.request('/pms/house/assess_list.do', 'POST', data, true).then(res => {
      console.log('getMyHouse:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let datas = res.data.data

        // let list = datas.filter(item => item.bind_source) 
        datas.map((item,index,arr) => {
          item.checked = false
          if(item.id == that.data.houseId){
            item.checked = true
          }
        })
        console.log(datas)
        that.setData({
          houseList: datas,
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  radioChange(e){
    console.log(e)
    let pages = getCurrentPages();    //获取当前页面信息栈
    let curPage = pages[pages.length - 1]     //获取上一个页面信息栈
    let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈
    console.log(prevPage)
    console.log(prevPage.data)
    prevPage.setData({
      houseId: e.detail.value,
      isRefresh: true
    })
    wx.navigateBack()
    
  }
})
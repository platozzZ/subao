const app = getApp(); 
const api = require('../../utils/request.js')
var that
Page({
  data: {
    TabCur: 0,
    SortMenu: [{ id: 0, name: "途家" }, { id: 1, name: "爱彼迎" }, { id: 2, name: "榛果" }, { id: 3, name: "小猪" }],
    emptyContainer: false,
    newHouseModal: false,
    houseList: [],
    showcheckMsg: false,
    checkedLength: 0,
    checkedvalue: [],
    nextBtnDisable: false,
    houseId: '',
    source: '',
  },
  onLoad: function (options) {
    that = this;
    that.unbindHouse()
    let pages = getCurrentPages();    //获取当前页面信息栈
    let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈
    prevPage.setData({
      isRefresh: true
    })
  },
  unbindHouse(e) {
    that.setData({
      checkedvalue: [],
      checkedLength: 0,
      nextBtnDisable: true
    })
    api.request('/pms/house/unbind_list.do', 'POST', '', true).then(res => {
      console.log("unbindHouse", res.data)
      if(that.data.checkedvalue.length == 0){
        // that.sert
      }
      if(res.data.rlt_code == 'S_0000'){
        if(res.data.data.length > 0){
          let art = res.data.data
          art.map((item,index,arr) =>{
            item.checked = false
            item.disabled = false
          })
          that.setData({
            houseList: art,
            emptyContainer: false
          })
        } else {
          that.setData({
            houseList: [],
            emptyContainer: true
          })
        }
      } else {
        that.setData({
          emptyContainer: true
        })
        that.showToast(res.data.rlt_msg)
      }
      
    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  checkTap(e){
    console.log('checkTap:',e)
    let source = e.currentTarget.dataset.source
    let houseId = e.currentTarget.dataset.id
    let checked = e.currentTarget.dataset.checked
    let houseList = that.data.houseList
    houseList.map((item, index, arr) => {
      if (item.source == source) {
        item.disabled = true
        if(!checked){
          item.disabled = true
          item.checked = false
          if (item.id == houseId) {
            item.disabled = false
            item.checked = true
          }
        } else {
          item.disabled = false
          item.checked = false
        }
      }
    })
    that.setData({
      houseList: houseList
    })
  },
  checkChange(e){
    console.log('checkChange:',e)
    if(e.detail.value.length == 0){
      that.setData({
        nextBtnDisable: true
      })
    } else {
      that.setData({
        nextBtnDisable: false
      })
    }
    that.setData({
      checkedLength: e.detail.value.length,
      checkedvalue: e.detail.value
    })
  },
  showcheckMsg(e){
    that.setData({
      showcheckMsg: true
    })
  },
  hidecheckMsg(e) {
    that.setData({
      showcheckMsg: false
    })
  },
  showNewHouseModal(e) {
    if (that.data.checkedvalue.length == 0) {
      that.showToast('请先选择房源')
      return
    }
    that.setData({
      newHouseModal: true,
    })
  },
  hideNewHouseModal() {
    that.setData({
      newHouseModal: false
    })
  },
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
  toRelationHouse(e) {
    if (that.data.checkedvalue.length == 0) {
      that.showToast('请先选择房源')
      return
    }
    let houseList = that.data.houseList
    let checkedvalue = that.data.checkedvalue
    let data = []
    houseList.map((item,index,arr) => {
      checkedvalue.map((itemc,indexc,arrc) => {
        if(item.id == itemc){
          data.push(item)
        }
      })
    })
    console.log(data)
    let info = encodeURIComponent(JSON.stringify(data));
    let thirdids = encodeURIComponent(JSON.stringify(checkedvalue));
    // wx.navigateTo({
    //   url: '../video/video?info=' + info
    // })
    // console.log("传递" + info);
    wx.navigateTo({
      url: '../relationHouse/relationHouse?data=' + info + '&thirdids=' + thirdids,
    })
  },
  tabSelect(e) {
    console.log(e.currentTarget.dataset.id);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
    })
  },
  onPullDownRefresh: function () {
    that.unbindHouse()
  },
});

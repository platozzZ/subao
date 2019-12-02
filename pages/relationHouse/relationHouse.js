const app = getApp();
const api = require('../../utils/request.js')
var that
Page({
  data: {
    thirdList: [],
    houseList: [],
    showModal: false,
    // emptyContainer: false,
    showErrorModal: false,
    showHouseList: false,
    checkedLength: 0,
    modalName: null,
    thirdids: [],
    houseId: '',
    thirdId: '',
  },
  onLoad: function (options) {
    console.log(options)
    that = this
    let info = decodeURIComponent(options.data);
    let thirdid = decodeURIComponent(options.thirdids);
    let data = JSON.parse(info);
    let thirdids = JSON.parse(thirdid);
    console.log(data)

    console.log(thirdids)
    // that.getData(thirdids)
    that.getMyHouse()
    that.setData({
      thirdList: data,
      thirdids: thirdids,

    })
    
  },
  getMyHouse(e) {
    let data = { current_page: 1, page_size: 1000 }
    // let pages = data
    api.request('/pms/house/list.do', 'POST', data, true).then(res => {
      console.log('getMyHouse:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        if (!!res.data.data.rows) {
          let datas = res.data.data.rows
          that.setData({
            houseList: datas,
            // emptyContainer: false
          })
        }
        // else {
        //   that.setData({
        //     emptyContainer: true
        //   })
        //   // that.showToast('暂无已有房源')
        // }
      } else {
        // that.setData({
        //   emptyContainer: true
        // })
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  bindHouse(e){
    let data = {
      house_id: that.data.houseId,
      third_house_ids: that.data.thirdids
    }
    console.log(data)
    api.request('/pms/house/bind.do', 'POST', data, true).then(res => {
      console.log("bindHouse", res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.hideModal()
        wx.showToast({
          title: '关联成功',
          icon: 'success',
          mask: true,
          duration: 2000,
          success(res) {
            let pages = getCurrentPages();//当前页面栈
            let prePages = pages[pages.length - 2];//获取上一个页面实例对象
            setTimeout(function () {
              prePages.unbindHouse()
              wx.navigateBack()
            },2000)
          }
        })
      } else if (res.data.rlt_code == 'PMS_0012') {
        // that.hideModal()
        that.setData({
          modalName: 'error'
        })
      } else {
        that.hideModal()
        that.showToast(res.data.rlt_msg)
      }

    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  createNewHouse(e) {
    console.log(e)
    let data = {
      third_house_ids: that.data.thirdids
    }
    console.log(data)
    api.request('/pms/house/create.do', 'POST', data, true).then(res => {
      console.log("createNewHouse", res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.hideModal()
        wx.showToast({
          title: '设置成功',
          icon: 'success',
          mask: true,
          duration: 2000,
          success(res) {
            let pages = getCurrentPages();//当前页面栈
            let prePages = pages[pages.length - 2];//获取上一个页面实例对象
            setTimeout(function () {
              prePages.unbindHouse()
              wx.navigateBack()
            }, 2000)
          }
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }

    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  checkChange(e){
    console.log(e)
    that.setData({
      thirdids: e.detail.value
    })
    // that.data.thirdids = e.detail.value
    // that.getData(e.detail.value)
  },
  showModal(e) {
    console.log(e)
    if (that.data.thirdids.length == 0){
      that.showToast('请至少选择一套房源')
      return
    }
    that.setData({
      modalName: e.currentTarget.dataset.target,
    })
    if (e.currentTarget.dataset.target == 'bind') {
      that.setData({
        houseId: e.currentTarget.dataset.houseid
      })
      // that.data.houseId = e.currentTarget.dataset.houseid
    }
  },
  hideModal(e) {
    that.setData({
      modalName: null
    })
  },
  showHouseList(){
    that.setData({
      showHouseList: true
    })
  },
  showToast(e){
    wx.showToast({
      title: e,
      icon: 'none',
      duration: 2000,
      mask: true
    })
  },
  onPullDownRefresh: function () {

  },
})
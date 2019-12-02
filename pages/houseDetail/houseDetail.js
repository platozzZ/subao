const app = getApp();
const api = require('../../utils/request.js')
var that
Page({
  data: {
    art: '',
    unBindList: [],
    bindList: [],
    TabCur: 1,
    houseId: '',
    thirdId: '',
    modalName: null,
    changeHouseValue: ''
  },
  onLoad: function (options) {
    that = this
    that.setData({
      houseId: options.id
    })
    that.getData(options.id)
    console.log(options)
    console.log(that.data.houseId)
    let pages = getCurrentPages();    //获取当前页面信息栈
    let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈
    prevPage.setData({
      isRefresh: true
    })

  },
  getData(e) {//
    let data = {
      house_id: e
    }
    api.request('/pms/house/detail.do', 'POST', data, true).then(res => {
      console.log("getData", res.data)
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        that.setData({
          art: art,
          unBindList: art.unbind_list,
          bindList: art.bind_list,
          modalName: null
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }

    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  bindHouse(e) {
    let thirdHouseIds = that.data.thirdId.split(",")
    console.log(thirdHouseIds)
    let data = {
      house_id: that.data.houseId,
      third_house_ids: thirdHouseIds
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
            setTimeout(function () {
              that.getData(that.data.houseId)
            }, 2000)
          }
        })
        // that.showToast('关联成功')
        // that.getData(that.data.dataId)
      } else if (res.data.rlt_code == 'PMS_0012') {
        that.hideModal()
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
  unBindHouse(e){
    let data = {
      house_id: that.data.houseId,
      third_house_id: that.data.thirdId
    }
    console.log(data)
    api.request('/pms/house/unbind.do', 'POST', data, true).then(res => {
      console.log("unbindHouse", res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.hideModal()
        wx.showToast({
          title: '取消关联成功',
          icon: 'success',
          mask: true,
          duration: 2000,
          success(res) {
            setTimeout(function () {
              that.getData(that.data.houseId)
            }, 2000)
          }
        })
        // that.showToast('取消关联成功')
        // that.getData(that.data.dataId)
      } else {
        that.showToast(res.data.rlt_msg)
      }

    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  showModal(e) {
    console.log(e)
    let modalName = e.currentTarget.dataset.target
    console.log(modalName)
    that.setData({
      modalName: modalName,
    })
    if (modalName == 'changeName'){
      return
    } else {
      that.setData({
        thirdId: e.currentTarget.dataset.thirdid
      })
    }
  },
  hideModal(e) {
    that.setData({
      modalName: null,
    })
  },
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      duration: 2000,
      mask: true
    })
  },
  changeHouseValue(e){
    that.setData({
      changeHouseValue: e.detail.value
    })
  },
  changeNameSubmit(e){
    console.log(e)
    let value = e.detail.value
    if (!!value.house_id && !!value.name) {
      that.editHouseName(value)
    } else {
      that.showToast('请输入房源名称')
    }
  },
  editHouseName(data){
    // let data = e
    console.log(data)
    api.request('/pms/house/edit_name.do', 'POST', data, true).then(res => {
      console.log('editHouseName:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.hideModal()
        that.setData({
          changeHouseValue: ''
        })
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          mask: true,
          duration: 2000,
          success(res) {
            setTimeout(function () {
              that.getData(that.data.houseId)
            }, 2000)
          }
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  onPullDownRefresh: function () {

  },
  tabSelect(e) {
    that.setData({
      TabCur: e.currentTarget.dataset.id,
    })
  }
})
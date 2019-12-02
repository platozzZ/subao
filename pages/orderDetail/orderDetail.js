const app = getApp();
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
Page({
  data: {
    art: '',
    orderId: '',
    orderObj: {
      ['0']: {
        order_text: '已取消',
        orderColor: 'cancelled'
      }, ['1']: {
        order_text: '待确认',
        orderColor: 'accepted'
      }, ['2']: {
        order_text: '待支付',
        orderColor: 'cancelled'
      }, ['3']: {
        order_text: '待入住',
        orderColor: 'tbc'
      }, ['4']: {
        order_text: '已入住',
        orderColor: 'tbc'
      }, ['5']: {
        order_text: '已完成',
        orderColor: 'tbc'
      }, ['999']: {
        order_text: '补录',
        orderColor: 'supplement'
      }
    },
    declineModal: false,
    confirmModal: false,
    cancelModal: false,
  },
  onLoad(options) {
    console.log(options)
    let pages = getCurrentPages();    //获取当前页面信息栈
    let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈
    prevPage.setData({
      isRefresh: false
    })
    that = this
    that.setData({
      orderId: options.id
    })
    let data = {
      order_id: options.id
    }
    that.getOrderDetail(data)
  },
  onShow: function () {

  },
  getOrderDetail(data) {
    api.request('/pms/order/detail.do', 'POST', data, true).then(res => {
      console.log('getOrderDetail:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let data = res.data.data
        if (data.order_time){
          data.orderTime = util.formatAllTime(new Date(data.order_time))
        }
        data.checkInDate = util.formatDates(new Date(data.checkin_date))
        data.checkOutDate = util.formatDates(new Date(data.checkout_date))
        console.log(data)
        that.setData({
          art: data
        })
      } else {
        that.setData({
          // emptyContainer: true
        })
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  orderConfirm(e){
    let data = {
      order_id: e.currentTarget.dataset.id
    }
    api.request('/pms/order/third/accept.do', 'POST', data, true).then(res => {
      console.log('confirmOrder:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let orderId = {
          order_id: that.data.orderId
        }
        that.getOrderDetail(orderId)
        that.hideConfirmModal()
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  orderDecline(e) {
    let data = {
      order_id: e.currentTarget.dataset.id
    }
    api.request('/pms/order/third/decline.do', 'POST', data, true).then(res => {
      console.log('refuseOrder:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let orderId = {
          order_id: that.data.orderId
        }
        that.getOrderDetail(orderId)
        that.hideDeclineModal()
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  orderCancel(e) {
    let data = {
      order_id: e.currentTarget.dataset.id
    }
    api.request('/pms/order/cancel.do', 'POST', data, true).then(res => {
      console.log('orderCancel:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        // let orderId = {
        //   order_id: that.data.orderId
        // }
        that.getOrderDetail(data)
        that.hideCancelModal()
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  showDeclineModal(e){
    that.setData({
      declineModal: true
    })
  },
  hideDeclineModal() {
    that.setData({
      declineModal: false
    })
  },
  showConfirmModal(e) {
    that.setData({
      confirmModal: true
    })
  },
  hideConfirmModal() {
    that.setData({
      confirmModal: false
    })
  },
  showCancelModal(e) {
    that.setData({
      cancelModal: true
    })
  },
  hideCancelModal() {
    that.setData({
      cancelModal: false
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

})
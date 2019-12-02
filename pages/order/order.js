const app = getApp(); 
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
Page({
  data: {
    pages: { current_page: 1, page_size: 20 },
    totalPage: '',
    isRefresh: true,
    total: '',
    orderList: [],
    TabCur: 1,
    SortMenu: [
      { id: 0, name: "全部订单", order_status: null }, 
      { id: 1, name: "待确认", order_status: '1'}, //queren 
      { id: 2, name: "待入住", order_status: '3' },
      { id: 4, name: "已取消", order_status: '0' },
      { id: 5, name: "补录", order_status: '999' },
      { id: 3, name: "已完成", order_status: '5'},
    ],
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
    orderId: '',
    declineModal: false,
    confirmModal: false,
    isLogin: null
  },
  onLoad: function (options) {
    that = this
    console.log('app.globalData.isLogin:', app.globalData.isLogin)
    if (!app.globalData.isLogin) {
      return
    }
    console.log('app.globalData.isLogin:', app.globalData.isLogin)
  },
  getOrderList(data){
    let _thisPages = data
    api.request('/pms/order/list.do', 'POST', data, true).then(res => {
      console.log('getOrderList:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          totalPage: res.data.data.total_page,
          total: res.data.data.total,
        })
        if (!!res.data.data.rows) {
          let datas = res.data.data.rows
          
          datas.map((item,index,arr) =>{
            // let orderStatus = orderObj[item.order_status]
            // item.order_text = orderStatus.order_text
            item.checkInDate = util.formatMM(new Date(item.checkin_date)) + '月' + util.formatDD(new Date(item.checkin_date)) + '日'
            item.checkOutDate = util.formatMM(new Date(item.checkout_date)) + '月' + util.formatDD(new Date(item.checkout_date)) + '日'
          })
          if (_thisPages.current_page == 1) {
            // that.data.orderList = []
            that.setData({
              orderList: []
            })
          }
          console.log(that.data.orderList)
          that.setData({
            orderList: that.data.orderList.concat(datas),
            'pages.current_page': res.data.data.current_page + 1,
          })

          console.log(that.data.orderList)
          // let list
          // if (that.data.pages.current_page == 1) {
          //   list = datas
          // } else {
          //   list = that.data.orderList.concat(datas)
          // }
          // console.log(list)
          // that.setData({
          //   orderList: list,
          //   'current_page': res.data.data.current_page + 1
          // })
        } else {
          that.setData({
            emptyContainer: true,
            orderList: []
          })
        }
      } else {
        that.setData({
          // emptyContainer: true
        })
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  manualSync(e){
    api.request('/pms/order/sync_all_order.do', 'POST', '', true).then(res => {
      console.log('manualSync:', res.data)
      if (res.data.rlt_code == 'S_0000' || res.data.rlt_code == "PMS_0021") {
        // that.showToast("同步中，请稍后刷新页面")
        wx.showLoading({
          title: '同步中',
          // mask: true,
        })
        setTimeout(function () {
          let tabCur = that.data.TabCur
          let pages = that.data.pages
          let data
          if (tabCur) {
            data = {
              current_page: 1,
              page_size: 20,
              order_status: tabCur
            }
          } else {
            data = pages
          }
          console.log(data)
          that.getOrderList(data)
        }, 10000)
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  orderConfirm(e) {
    let data = {
      order_id: that.data.orderId
    }
    api.request('/pms/order/third/accept.do', 'POST', data, true).then(res => {
      console.log('confirmOrder:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.onPullDownRefresh()
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
      order_id: that.data.orderId
    }
    api.request('/pms/order/third/decline.do', 'POST', data, true).then(res => {
      console.log('refuseOrder:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.onPullDownRefresh()
        that.hideDeclineModal()
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  showDeclineModal(e) {
    that.setData({
      declineModal: true,
      orderId: e.currentTarget.dataset.id
    })
  },
  hideDeclineModal() {
    that.setData({
      declineModal: false
    })
  },
  showConfirmModal(e) {
    that.setData({
      confirmModal: true,
      orderId: e.currentTarget.dataset.id
    })
  },
  hideConfirmModal() {
    that.setData({
      confirmModal: false
    })
  },
  toDetail(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../orderDetail/orderDetail?id=' + id,
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
  onPullDownRefresh: function () {
    let tabCur = that.data.TabCur
    let data
    if (tabCur) {
      data = {
        current_page: 1,
        page_size: 20,
        order_status: tabCur
      }

    } else {
      data = {
        current_page: 1,
        page_size: 20
      }
    }
    console.log(data)
    that.getOrderList(data)
  },
  onReachBottom: function () {
    let pages = that.data.pages
    let totalPage = that.data.totalPage
    let tabCur = that.data.TabCur
    let data
    if (tabCur){
      data = {
        current_page: pages.current_page,
        page_size: 20,
        order_status: tabCur
      }
      
    } else {
      data = pages
    }
    console.log(data)
    console.log(totalPage)
    if (totalPage >= data.current_page) {
      that.getOrderList(data)
    }
  },
  onShow(){

    console.log('app.globalData.isLogin:', app.globalData.isLogin)
    if (!app.globalData.isLogin) {
      return
    }
    that.setData({
      isLogin: app.globalData.isLogin
    })
    console.log(that.data.isRefresh)
    if (that.data.isRefresh){
      console.log('true')
      let tabCur = that.data.TabCur
      let data
      if (tabCur) {
        data = {
          current_page: 1,
          page_size: 20,
          order_status: tabCur
        }
      } else {
        data = {
          current_page: 1,
          page_size: 20,
        }
      }
      console.log(data)
      that.getOrderList(data)
    } else {
      console.log('false')
      that.setData({
        isRefresh: true
      })
    }
  },
  tabSelect(e) {//
    let curId = e.currentTarget.dataset.id
    let tabCur = that.data.TabCur
    let data
    if (curId) {
      data = {
        current_page: 1, 
        page_size: 20,
        order_status: curId
      }
      
    } else {
      data = {
        current_page: 1,
        page_size: 20,
      }
    }
    // console.log(data)
    // console.log(curId)
    // console.log(tabCur)
    // console.log(curId != tabCur)
    if (curId != tabCur) {
      that.getOrderList(data)
    }
    that.setData({
      TabCur: e.currentTarget.dataset.id,
    })
  }
});

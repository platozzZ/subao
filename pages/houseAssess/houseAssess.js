const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
Page({
  data: {
    pages: { current_page: 1, page_size: 20 },
    totalPage: 0,
    total: 0,
    houseList: [],
    rect: [],
    emptyContainer: false,
    showContainer: false,
    haveNew: 0,
    tabCur: 1,
    editModal: false,
    houseId: '',
    instanceCountValue: '',
    showModal: false,
    onlineNum: false,
    modalName: null,
  },
  onLoad(options) {
    console.log(options)
    that = this
  },
  getMyHouse(data) {
    console.log(data)
    that.setData({
      modalName: null
    })
    let pages = data
    api.request('/pms/house/assess_list.do', 'POST', data, true).then(res => {
      console.log('getMyHouse:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        if (res.data.data.length == 0) {
          that.setData({
            showContainer: false,
            emptyContainer: true
          })
          return
        }
        let datas = res.data.data
        // .filter(item => item.bind_source) 
        console.log(datas)
        // datas = datas.filter(item => item.bind_source) 
        // console.log(datas)
        // let list
        // if (pages.current_page == 1) {
        //   list = datas
        // } else {
        //   list = that.data.houseList.concat(datas)
        // }
        // console.log(list)
        that.setData({
          houseList: datas,
          // totalPage: res.data.data.total_page,
          // total: res.data.data.total,
          // 'pages.current_page': res.data.data.current_page + 1,
          showContainer: true,
          emptyContainer: false
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },

  starAssess(e) {
    // that.assessHouse(e.currentTarget.dataset.id)
    app.mtj.trackEvent('fangyuan_4')
    let data = {
      house_id: e.currentTarget.dataset.id
    }
    console.log(data)
    api.request('/pms/house/assess/start_assess.do', 'POST', data, true, true).then(res => {
      console.log("assessHouse", res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          modalName: 'assessloading',
          // houseId: e.currentTarget.dataset.id
        })
        that.assessHouseDetail(e.currentTarget.dataset.id)
      } else {
        that.showToast(res.data.rlt_msg)
      }

    }).catch(res => {
    }).finally(() => { })
  },
  assessHouseDetail(e) {
    let data = {
      house_id: e
    }
    console.log(data)
    api.request('/pms/house/assess/view_assess.do', 'POST', data, true, true).then(res => {
      console.log("assessHouseDetail", res.data)
      if(!res.data.data){
        that.showToast('评估失败，请重新评估')
        that.setData({
          modalName: null
        })
        return
      }
      if (res.data.data.assess_status == 1) {
        setTimeout(function () {
          that.assessHouseDetail(e)
        }, 5000)
        return
      }
      that.setData({
        modalName: null
      })
      wx.showToast({
        title: '评估成功',
        icon: 'success',
        mask: true,
        duration: 2000,
        success(res) {
          setTimeout(function () {
            wx.navigateTo({
              url: '../houseEvaluation/houseEvaluation?id=' + e,
            })
          }, 2000)
        }
      })
      // let data = {
      //   current_page: 1,
      //   page_size: 20
      // }
      // that.getMyHouse(data)


    }).catch(res => {
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
  onShow() {
    let tabCur = that.data.tabCur
    let data = {
      assess_status: null
    }
    if (tabCur == 2) {
      data.assess_status = 2
    } else if (tabCur == 1) {
      data.assess_status = 1
    } 
    console.log(data)
    that.getMyHouse(data)
  },
  tabSelect(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id
    // app.mtj.trackEvent('fangyuan_' + (id+1))
    // console.log(('fangyuan_' + (id + 1)))
    let data
    if (id == 2) {
      app.mtj.trackEvent('fangyuan_3')
      data = {
        // current_page: 1,
        // page_size: 20,
        assess_status: 2
      }
    } else if (id == 1) {
      app.mtj.trackEvent('fangyuan_2')
      data = {
        // current_page: 1,
        // page_size: 20,
        assess_status: 1
      }
    } else {
      app.mtj.trackEvent('fangyuan_1')
      data = {
        assess_status: null
      }
    }
    console.log(data)
    that.getMyHouse(data)
    that.setData({
      tabCur: id
    })
  },
  showModal(e) {
    console.log(typeof (e) == 'string')
    if (typeof (e) == 'string') {
      that.setData({
        modalName: e
      })
      return
    }
    that.setData({
      modalName: e.currentTarget.dataset.target,
      houseId: e.currentTarget.dataset.id,
    })
  },
  hideModal(e) {
    that.setData({
      modalName: null,
    })

  },
  toHouseEvaluation(e) {
    wx.navigateTo({
      url: '../houseEvaluation/houseEvaluation?id=' + e.currentTarget.dataset.id,
    })
  },
  toAccount(e) {
    app.mtj.trackEvent('fangyuan_7')
    wx.navigateTo({
      url: '../account/account',
    })
  },
  // onReachBottom: function () {
  //   let totalPage = that.data.totalPage
  //   let data = that.data.pages

  //   if (totalPage >= data.current_page) {
  //     that.getMyHouse(data)
  //   }
  // },
})
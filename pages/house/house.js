const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
Page({
  data: {
    pages: { current_page: 1, page_size: 20},
    totalPage: 0,
    total: 0,
    houseList: [],
    rect: [],
    emptyContainer: false,
    showContainer: false,
    haveNew: 0,
    editModal: false,
    houseId: '',
    instanceCountValue: '',
    showModal: false,
    onlineNum: false,
    modalName: null,
    listTouchStart: 0,
    listTouchDirection: null,
    lastX: 0,
    lastY: 0,
    flag: 0,
    text: '没有滑动',
    showDeleteModal: false,
    isRefresh: false,
    mask: true,
    isLogin: null,
    numArt: '',
    toVie:  false
  },
  onLoad(options) {
    console.log(options)
    that = this
    // that.setData({
    //   optionsNum: options.num
    // })
    if (!app.globalData.isLogin) {
      return
    }
    
  },
  getMyHouse(data){
    that.setData({
      modalName: null
    })
    let pages = data
    api.request('/pms/house/list.do', 'POST', data, true).then(res => {
      console.log('getMyHouse:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.getNum()
        // that.priceNum()
        if (res.data.data.rows.length == 0){
          that.setData({
            showContainer: false,
            emptyContainer: true
          })
          return
        }
          let datas = res.data.data.rows
          console.log(datas)
          let list
          if (pages.current_page == 1) {
            list = datas
          } else {
            list = that.data.houseList.concat(datas)
          }
          that.setData({
            toVie: false
          })
          for(let i = 0; i < list.length; i++){
            if (!!list[i].bind_source){
              console.log(i)
              that.setData({
                toVie: true
              })
              break
            }
          }
          console.log(list)
          that.setData({
            houseList: list,
            totalPage: res.data.data.total_page,
            total: res.data.data.total,
            'pages.current_page': res.data.data.current_page + 1,
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
  
  getList(e) {
    console.log('getList')
    api.request('/pms/system/user/account_house_data.do', 'POST', '', true).then(res => {
      console.log("getList：",res.data)
      if (res.data.rlt_code == 'S_0000') {
        wx.setStorageSync('serverTime', res.data.data.server_time)
        let data = {
          current_page: 1,
          page_size: 20,
        }
        that.getMyHouse(data)
        that.setData({
          haveNew: res.data.data.unbind_house_num,
          modalName: null
        })
        // if (res.data.data.account_online == 0 && res.data.data.account_num > 0) {
        //   that.setData({
        //     modalName: 'tips',
        //     onlineNum: true
        //   })
        // } else 
        if (res.data.data.account_num == 0) {
          that.setData({
            modalName: 'tips',
            onlineNum: false
          })
        }
        // that.unbindHouse()
        
      } else {
        that.setData({
          showContainer: false,
          emptyContainer: true
        })
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      
    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  toMore(){
    wx.navigateTo({
      url: '../updateMore/updateMore',
    })
  },
  getNum(){
    api.request('/pms/house/condition_num.do', 'POST', '', true, true).then(res => {
      console.log("getNum", res.data)
      // "unassess_housenum": 9, //房源待评估数量
      //   "upload_better_num": 10, //上传房源待完善数量
      //     "price_assess_num": 9 //房源待改价数量
      that.setData({
        numArt: res.data.data
      })
    }).catch(res => {
    }).finally(() => { })
  },
  // 获取待评估数量
  houseNum(e) {//
    api.request('/pms/house/assess/unassess_housenum.do', 'POST', '', true, true).then(res => {
      console.log("houseNum", res.data)
      that.setData({
        houseNum: res.data.data.unassess_housenum
      })
    }).catch(res => {
    }).finally(() => { })
  },
  // 获取可对比价格房源数量
  priceNum(e) {
    api.request('/pms/house/price/assess/price_assess_num.do', 'POST', '', true, true).then(res => {
      console.log("priceNum", res.data)
      that.setData({
        priceNum: res.data.data.price_assess_num
      })
    }).catch(res => {
    }).finally(() => { })
  },


  readHouse(e) {
    api.request('/pms/house/sync_all_house.do', 'POST', '', true, true).then(res => {
      console.log("readHouse", res.data)
      let data = {
        current_page: 1,
        page_size: 20
      }
      that.getMyHouse(data)
    }).catch(res => {
    }).finally(() => { })
  },
  starAssess(e){
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
  unbindHouse(e){
    api.request('/pms/house/unbind_list.do', 'POST', '', true).then(res => {
      console.log("unbindHouse", res.data)
      if(res.data.data.length > 0){
        that.setData({
          haveNew: res.data.data.length
        })
      } else {
        that.setData({
          haveNew: 0
        })
      }
    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  instanceCountValue(e) {
    that.setData({
      instanceCountValue: e.detail.value
    })
  },
  editSubmit(e) {
    let data = e.detail.value
    console.log(data)
    if (!!data.instance_count && !!data.house_id && data.instance_count > 0 && data.instance_count <= 10000) {
      that.instanceCount(data)
    } else {
      that.showToast('请正确输入库存')
    }

  },
  instanceCount(data) {
    console.log(data)
    api.request('/pms/house/instance_count.do', 'POST', data, true).then(res => {
      console.log('editSubmit:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.hideModal()
        // that.setData({
        //   instanceCountValue: '',
        //   modalName: null
        // })
        let datas = {
          current_page: 1,
          page_size: 20
        }
        console.log(datas)
        that.getMyHouse(datas)
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  priceToast(e){
    that.showToast('您的房源暂不可查看价格竞争力，请先关联民宿平台房源')
  },
  uploadToast(e) {
    that.showToast('您没有可优化房源')
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

    that.setData({
      isLogin: app.globalData.isLogin
    })
    if (!app.globalData.isLogin) {
      return
    }
    // if (that.data.optionsNum == 0){
    //   that.readHouse()
    //   return
    // }
    that.getList()
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
      instanceCountValue: ''
    })
    
  },
  toNewhouse(e) {
    app.mtj.trackEvent('fangyuan_8')
    that.setData({
      modalName: null
    })
    wx.navigateTo({
      url: '../newHouse/newHouse',
    })
  },
  toHouseEvaluation(e) {
    wx.navigateTo({
      url: '../houseEvaluation/houseEvaluation?id=' + e.currentTarget.dataset.id,
    })
  },
  toReadHouse(e) {
    app.mtj.trackEvent('fangyuan_6')
    wx.navigateTo({
      url: '../readHouse/readHouse',
    })
  },
  toAccount(e) {
    app.mtj.trackEvent('fangyuan_7')
    wx.navigateTo({
      url: '../account/account',
    })
    // wx.reLaunch({
    //   url: '/pages/account/account?status=0&path=' + route,
    // })
  },
  toDetail(e) {
    that.setData({
      modalName: null
    })
    wx.navigateTo({
      url: '../houseDetail/houseDetail?id=' + e.currentTarget.dataset.id,
    })
  },
  toAssess(e){
    wx.navigateTo({
      url: '../houseAssess/houseAssess'
    })
  },
  toVie(e){
    wx.navigateTo({
      url: '../houseVie/houseVie'
    })
  },
  deleteHouse(e){
    let data = {
      house_id: that.data.houseId
    }
    api.request('/pms/house/delete.do', 'POST', data, true).then(res => {
      console.log('deleteHouse:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.hideModal()
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          mask: true,
          duration: 2000,
          success(res) {
            // console.log('deleteHouse')
            // that.getList()
            // let datas = {
            //   current_page: 1,
            //   page_size: 20
            // }
            // that.getMyHouse(datas)
            setTimeout(function () {
              let datas = {
                current_page: 1,
                page_size: 20
              }
              that.getMyHouse(datas)
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
  listTouchStart(e) {// ListTouch触摸开始
    console.log(e)
    that.data.lastX = e.touches[0].pageX
    that.data.lastY = e.touches[0].pageY
    // that.setData({
    //   listTouchStart: e.touches[0].pageX
    // })
    // this.listTouchStart = e.touches[0].pageX
  },
  listTouchMove(e) { // ListTouch计算方向
    // console.log(e)
    if (that.data.flag != 0) {
      return
    }
    let currentX = e.touches[0].pageX
    let currentY = e.touches[0].pageY
    let tx = currentX - that.data.lastX
    let ty = currentY - that.data.lastY
    let text = ''
    console.log(Math.abs(tx) > Math.abs(ty))
    // 左右方向滑动
    if (Math.abs(tx) > Math.abs(ty)) {
      if (tx < 0) {
        text = '向左滑动'
        that.data.flag = 1
      } else if (tx > 0) {
        text = '向右滑动'
        that.data.flag = 2
      }
    } else { //上下方向滑动
      if (ty < 0) {
        text = '向上滑动'
        that.data.flag = 3
      } else if (ty > 0) {
        text = '向下滑动'
        that.data.flag = 4
      }
    }

    that.data.lastX = currentX
    that.data.lastY = currentY
    that.data.text = text
    // console.log(e.touches[0].pageX)
    // console.log(that.data.listTouchStart)
    // that.setData({
    //   listTouchDirection: e.touches[0].pageX - that.data.listTouchStart > 30 ? 'right' : e.touches[0].pageX - that.data.listTouchStart < -30 ? 'left' : null
    // })
    // this.listTouchDirection = e.touches[0].pageX - this.listTouchStart > 0 ? 'right' : 'left'
  },
  listTouchEnd(e) {// ListTouch计算滚动
    console.log(e)
    if (that.data.flag == 1) {
      that.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else if (that.data.flag == 2) {
      that.setData({
        modalName: null
      })
    }
    that.data.flag = 0
    // if (that.data.listTouchDirection == 'left') {
    //   that.setData({
    //     modalName: e.currentTarget.dataset.target
    //   })
    // } else {
    //   that.setData({
    //     modalName: null
    //   })
    // }
    // that.setData({
    //   listTouchDirection: null
    // })
    // if (this.listTouchDirection == 'left') {
    //   this.modalName = e.currentTarget.dataset.target
    // } else {
    //   this.modalName = null
    // }
    // this.listTouchDirection = null
  },
  onPullDownRefresh: function () {
    // that.getMyHouse(data)
    that.getList()
    // let data = {
    //   current_page: 1,
    //   page_size: 20
    // }
    // that.getMyHouse(data)
  },
  onReachBottom: function () {
    let totalPage = that.data.totalPage
    let data = that.data.pages
    
    if (totalPage >= data.current_page) {
      that.getMyHouse(data)
    }
  },
})
const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
const today = util.formatDates(new Date())
var that
Page({
  data: {
    dateList: '',
    newArray: [],
    houseList: [],
    houseIdList: [],
    emptyContainer: false,
    showContainer: false,
    today: today,
    toRelation: null,
    emptyText: '',
    btnText: '',
    modalName: null,
    modalTips: false,
    switchValue: '',
    // switchStatus: null,
    modalData: [],
    curDate: '',
    houseId: '',
    curData: '',
    mask: false,
    isLogin: null,
    sourceObj: {
      ['01']: {
        source_text: '途家',
      }, ['02']: {
        source_text: '爱彼迎'
      }, ['04']: {
        source_text: '小猪'
      }, ['05']: {
        source_text: '榛果'
      }
    }
  },
  onLoad: function () {
    that = this
    that.setData({
      isLogin: app.globalData.isLogin
    })
    console.log(app.globalData.isLogin)
    // if (!app.globalData.isLogin) {
    //   return
    // }
    that.initDate()
    that.getList()
  },
  getList(e) {
    api.request('/pms/system/user/account_house_data.do', 'POST', '', true).then(res => {
      console.log("getList：", res.data)
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        wx.setStorageSync('serverTime', art.server_time)
        if (art.bind_house_num == 0) {
          that.showEmpty()
          if (art.account_online == 0) {
            that.pushRelation(0)
          } else {
            that.pushRelation(1)
          }
        } else {
          that.getHouse()
        }
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  getHouse(e) {//获取房源列表
    that.hideModal()
    // that.setData({
    //   modalName: null
    // })
    let data = {
      assess_status: null
    }
    api.request('/pms/house/assess_list.do', 'POST', data, true).then(res => {
      console.log("getHouse", res.data)
      if (res.data.rlt_code == "S_0000") {
        if (res.data.data.length > 0) {
          let houseList = res.data.data
          let houseIdList = []
          houseList.map((item, index, arr) => {
            houseIdList.push(item.id)
          })
          let dateList = that.data.dateList
          let calendarData = {
            house_ids: houseIdList,
            // start_date: today
          }
          that.getCalendarData(calendarData)
          that.setData({
            houseList: houseList,
            houseIdList: houseIdList,
            showContainer: true,
            emptyContainer: false
          })
        } else {
          that.setData({
            showContainer: false,
            emptyContainer: true
          })
        }
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
  syncHouse(e) {//同步房态
    that.setData({
      mask: true
    })
    api.request('/pms/house/status/sync_all_status.do', 'POST', '', true).then(res => {
      console.log("syncHouse", res.data)
      if (res.data.rlt_code == "S_0000" || res.data.rlt_code == "PMS_0021") {
        wx.showLoading({
          title: '同步中',
          mask: true,
        })
        setTimeout(function () {
          that.setData({
            mask: false
          })
          that.getHouse()
        }, 10000)
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      // wx.stopPullDownRefresh()
    })
  },
  getCalendarData(data) {//获取房态列表
    console.log(data)
    api.request('/pms/house/status/calendar.do', 'POST', data, true).then(res => {
      console.log("getCalendarData", res.data)
      if (res.data.rlt_code == "S_0000") {
        let dataList = res.data.data
        that.handleArray(dataList)
        that.setData({
          // scrollLeft: 0,
          list: dataList.calendars,
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  handleArray(data) {
    console.log(data)
    let calendars = data.calendars //.slice(0, 7)
    // let orderList = data.orders
    let houseList = that.data.houseList
    let houseIdList = that.data.houseIdList
    let newArray = new Array()
    houseList.map((item, index, arr) => {
      // for (let i = 0; i < item.instance_count; i++) {
      newArray.push({
        house_name: item.name.trim(),
        house_id: item.id,
        instance_count: item.instance_count,
        house_index: index,
      })
      // }
    })
    newArray.map((item, index, arr) => { //数组
      item.calendars = new Array(10)
      calendars.map((itemc, indexc, arrc) => { //房源列表数据
        if (item.house_id == itemc.house_id) {
          itemc.calendars.map((items, indexs, arrs) => {//房源列表日期数据
            // item.calendars.push(items)
            item.calendars.splice(indexs, 1, items)
            // item.calendars[indexs].order = new Array
            // items.order_ids.map((itemo, indexo, arro) => {
            //   orderList.map((itemos, indexos, arros) => {
            //     if (itemo == itemos.id) {
            //       item.calendars[indexs].order.push(itemos)

            //     }
            //   })
            // })
          })
        }
      })
    })
    console.log(newArray)
    that.setData({
      newArray: newArray
    })
  },
  showModal(e) {
    console.log(e)
    let target = e.currentTarget.dataset.target
    that.setData({
      modalName: target
    })
    if (target == 'cells') {
      let sources = e.currentTarget.dataset.sources
      let date = e.currentTarget.dataset.date
      let houseId = e.currentTarget.dataset.id
      that.setData({
        modalData: sources,
        curDate: date,
        houseId: houseId,
        curData: houseId + date
      })
      console.log(that.data.curData)
    }
  },
  hideModal(e) {
    that.setData({
      modalName: null
    })
  },
  hideModalTips(){
    let modalData = that.data.modalData
    that.setData({
      modalTips: false,
      switchValue: '',
      modalData: modalData
    })
  },
  switchChange(e) {
    console.log(e)
    let data = {
      house_id: that.data.houseId,
      day: that.data.curDate,
      source: e.currentTarget.dataset.source,
      status: e.detail.value ? '1' : '0'
    }
    that.setData({
      modalTips: true,
      switchValue: data,
      // switchStatus: e.detail.value
    })
  },
  sourceUpdate(e) { // 
    console.log(e)
    let data = that.data.switchValue
    api.request('/pms/house/status/source/update.do', 'POST', data, true).then(res => {
      console.log("sourceUpdate", res.data)
      if (res.data.rlt_code == "S_0000") {
        that.setData({
          modalTips: false,
        })
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          mask: true,
          duration: 2000,
          success(res) {
            setTimeout(function () {
              that.getHouse()
            }, 2000)
          }
        })
        // that.showToast('请求成功，请稍后刷新重试')
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      // wx.stopPullDownRefresh()
    })
  },
  toBind(e) {
    let toRelation = that.data.toRelation
    console.log(toRelation)
    if (toRelation == 0) {
      wx.navigateTo({
        url: '/pages/account/account',
      })
    } else {
      wx.reLaunch({
        url: '/pages/house/house?num=0',
      })
    }
  },
  toVie(e){
    wx.navigateTo({
      // url: '/pages/houseVie/houseVie?id=' + e.currentTarget.dataset.id + '&calendar=' + true,
      url: '/pages/demo/demo?id=' + e.currentTarget.dataset.id + '&calendar=' + true,
    })
  },
  toAccount(){
    wx.navigateTo({
      url: '../account/account',
    })
  },
  // 获取今天开始往后10天
  initDate() {
    let newDate = new Date();
    let d = {
      'year': newDate.getFullYear(),
      // 'month': newDate.getMonth() + 1,
      'days': [],
    };
    for (let i = 0; i < 10; i++) {
      let dd = util.dateAddDay(newDate, i);
      if (util.formatDates(new Date(dd)) == today) {
        d.days.push({
          'date': util.formatDates(new Date(dd)),
          'key': util.formatDate(new Date(dd)),
          'year': util.formatYear(new Date(dd)),
          'months': util.formatMM(new Date(dd)),
          'month': util.formatMMs(new Date(dd)),
          'day': util.formatDD(new Date(dd)),
          'week': '今天'
        })
      } else {
        d.days.push({
          'date': util.formatDates(new Date(dd)),
          'key': util.formatDate(new Date(dd)),
          'year': util.formatYear(new Date(dd)),
          'months': util.formatMM(new Date(dd)),
          'month': util.formatMMs(new Date(dd)),
          'day': util.formatDD(new Date(dd)),
          'week': util.formatWeeks(new Date(dd)),
        });
      }
    }
    // return d;
    console.log(d)
    that.setData({
      dateList: d
    })
  },
  pushRelation(e) {
    console.log('pushRelation:', e)
    that.setData({
      toRelation: e
    })
    if (e == 0) {
      that.setData({
        emptyText: '您还没有绑定民宿平台账号',
        btnText: '去绑定'
      })
    } else {
      that.setData({
        emptyText: '您还没有关联民宿平台房源',
        btnText: '去关联'
      })
    }
  },
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
  showEmpty(e) {
    console.log('showEmpty')
    that.setData({
      showContainer: false,
      emptyContainer: true
    })
  },
  onPullDownRefresh: function () {
    that.getList()
  },
})
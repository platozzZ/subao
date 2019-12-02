const app = getApp()
const calendar = require('../../utils/calendar.js')
const api = require('../../utils/request.js')
const getAll = require('../../utils/getAll.js')
const util = require('../../utils/util.js')
const today = util.formatDates(new Date())
var that
Page({
  data: {
    dateList: [],   // 日历数据数组
    datesList: [],
    today: today,
    year: '',
    curIndex: 18,
    scrollLeft: 0,
    scLeft: 30,
    houseList: [],
    houseIdList: [],
    list: [],
    toRelation: null,
    houseId: '',
    newArray: [],
    modalName: null,
    curData: '',
    curDate: '',
    modalData: '',
    radioValue: '',
    switchTujias: '',
    switchAirbnbs: '',
    switchXiaozhu: '',
    switchZhenguo: '',
    switchMuniao: '', 
    emptyText: '',
    btnText: '',
    emptyContainer: false,
    showContainer: false,
    orderId: '',
    showChangeModal: false,
    preWeek: false,
    nextWeek: false,
    mask: false,
    isLogin: null
  },
  onLoad(options) {
    that = this
    // console.log(app)

    if (!app.globalData.isLogin) {
      return
    }
    that.setData({
      isLogin: app.globalData.isLogin
    })
    console.log(that.data.toRelation)
    that.initDates(); // 日历组件初始化
    // that.getHouse()
    // that.getSystemInfo()
    console.log(that.data.datesList)
    let calendar = that.data.datesList
    calendar.map((item, index) => {
      item.days.map((items, indexs) => {
        if (items.date == today) {
          that.setData({
            curIndex: index,
            year: item.year
          })
        }
      })
    })
  },
  getList(e) {
    api.request('/pms/system/user/account_house_data.do', 'POST', '', true).then(res => {
      console.log("getList：", res.data)
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        if (art.bind_house_num == 0){
          that.showEmpty()
          if (art.account_online == 0) {
            that.pushRelation(0)
          } else {
            that.pushRelation(1)
          }
        } else {
          console.log('that.getHouse()')
          that.getHouse()
        }
      } else {
        // that.setData({
        //   showContainer: false,
        //   emptyContainer: true
        // })
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  getHouse(e) {//获取房源列表
    that.setData({
      modalName: null
    })
    api.request('/pms/house/status/all.do', 'POST', '', true).then(res => {
      console.log("getHouse", res.data)
      if (res.data.rlt_code == "S_0000") {
        if (res.data.data.length > 0) {
          let houseList = res.data.data
          let houseIdList = []
          houseList.map((item, index, arr) => {
            houseIdList.push(item.id)
          })
          let datesList = that.data.datesList
          let calendarData = {
            house_ids: houseIdList,
            start_date: datesList[that.data.curIndex].days[0].date
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
        // that.showToast('请求成功，请稍后刷新重试')
        wx.showLoading({
          title: '同步中',
          // mask: true,
        })
        setTimeout(function(){
          // wx.hideLoading()
          that.setData({
            mask: false
          })
          that.getHouse()
        },10000)
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
  handleArray(data){
    console.log(data)
    let calendars = data.calendars //.slice(0, 7)
    let orderList = data.orders
    let houseList = that.data.houseList
    let houseIdList = that.data.houseIdList
    // let length = 0
    let newArray = new Array()
    // houseList.map((item, index, arr) => {
    //   length += item.instance_count
    // })
    houseList.map((item, index, arr) => {
      for (let i = 0; i < item.instance_count; i++){
        newArray.push({
          house_name: item.name.trim(),
          house_id: item.id,
          count: i,
          house_index: index,
        })
      }
    })
    newArray.map((item, index, arr) => { //数组
      item.calendars = new Array(10)
      calendars.map((itemc,indexc,arrc) =>{ //房源列表数据

        // itemc.calendars = itemc.calendars.slice(0, 7)
        if (item.house_id == itemc.house_id){
          itemc.calendars.map((items, indexs, arrs) => {//房源列表日期数据
            // item.calendars.push(items)
            item.calendars.splice(indexs, 1, items)
            item.calendars[indexs].order = new Array
            items.order_ids.map((itemo, indexo, arro) => {
              orderList.map((itemos, indexos, arros) => {
                if (itemo == itemos.id) {
                  item.calendars[indexs].order.push(itemos)
                  
                }
              })
            })
          })
        }
      })
    })
    console.log(newArray)
    that.setData({
      newArray: newArray
    })
  },
  missingNumber(nums) {
    var n = 0, len = nums.length;
    for (var i = 0; i < len; i++) {
      n += nums[i];
    }
    return (1 + len) * (len / 2) - n;
  },
  showModal(e) {
    console.log(e);
    let modalName = e.currentTarget.dataset.target
    if (modalName == 'cells') {
      // console.log(JSON.parse(e.currentTarget.dataset.data));
      let data = e.currentTarget.dataset.data
      console.log(data)
      that.setData({
        modalData: data,
        curDate: e.currentTarget.dataset.date,
        houseId: e.currentTarget.dataset.houseid,
        curData: e.currentTarget.dataset.date + '' + e.currentTarget.dataset.houseid + e.currentTarget.dataset.index + e.currentTarget.dataset.count
      })
      data.map(item => {
        if (item.source == '01') {
          that.setData({
            switchTujias: item.status,
          })
        } else if (item.source == '02') {
          that.setData({
            switchAirbnbs: item.status,
          })
        } else if (item.source == '04') {
          that.setData({
            switchXiaozhu: item.status,
          })
        } else if (item.source == '05') {
          that.setData({
            switchZhenguo: item.status,
          })
        }
      })
      if (e.currentTarget.dataset.id) {
        that.setData({
          orderId: e.currentTarget.dataset.id
        })
      } else {
        that.setData({
          orderId: ''
        })
      }
    }
    that.setData({
      modalName: modalName,
    })
  },
  hideModal(e) {
    that.setData({
      modalName: null
    })
  },
  radioChange(e) {
    that.setData({
      radioValue: e.detail.value
    })
    // this.radioValue = e.detail.value
  },
  switchTujias(e) {
    console.log(e)
    let data = {
      house_id: that.data.houseId,
      day: that.data.curDate,
      source: e.currentTarget.dataset.source,
      status: e.detail.value ? '1' : '0'
    }
    that.setData({
      switchTujias: e.detail.value,
      showChangeModal: true,
      switchValue: data
    })
    // that.sourceSubmit(data)
    // this.SwitchTujia = e.detail.value
  },
  switchAirbnbs(e) {
    console.log(e)
    let data = {
      house_id: that.data.houseId,
      day: that.data.curDate,
      source: e.currentTarget.dataset.source,
      status: e.detail.value ? '1' : '0'
    }
    that.setData({
      switchAirbnbs: e.detail.value,
      showChangeModal: true,
      switchValue: data
    })
    // this.SwitchAirbnb = e.detail.value
  },
  switchXiaozhu(e) {
    console.log(e)
    let data = {
      house_id: that.data.houseId,
      day: that.data.curDate,
      source: e.currentTarget.dataset.source,
      status: e.detail.value ? '1' : '0'
    }
    that.setData({
      switchXiaozhu: e.detail.value,
      showChangeModal: true,
      switchValue: data
    })
    // this.SwitchAirbnb = e.detail.value
  },
  switchZhenguo(e) {
    console.log(e)
    let data = {
      house_id: that.data.houseId,
      day: that.data.curDate,
      source: e.currentTarget.dataset.source,
      status: e.detail.value ? '1' : '0'
    }
    that.setData({
      switchZhenguo: e.detail.value,
      showChangeModal: true,
      switchValue: data
    })
    // this.SwitchAirbnb = e.detail.value
  },
  switchMuniao(e){
    console.log(e)
    let data = {
      house_id: that.data.houseId,
      day: that.data.curDate,
      source: e.currentTarget.dataset.source,
      status: e.detail.value ? '1' : '0'
    }
    that.setData({
      switchMuniao: e.detail.value,
      showChangeModal: true,
      switchValue: data
    })
  },
  cancelChangeModal(e) {
    if (e.currentTarget.dataset.source == '01') {//途家
      that.setData({
        switchTujias: !that.data.switchTujias
      })
    } else if (e.currentTarget.dataset.source == '02') {
      that.setData({
        switchAirbnbs: !that.data.switchAirbnbs
      })
    } else if (e.currentTarget.dataset.source == '04') {
      that.setData({
        switchXiaozhu: !that.data.switchXiaozhu
      })
    } else if (e.currentTarget.dataset.source == '05') {
      that.setData({
        switchZhenguo: !that.data.switchZhenguo
      })
    }
    that.hideModal()
    that.setData({
      showChangeModal: false,
    })
  },
  sourceUpdate(e) { // 
    console.log(e)
    let data = that.data.switchValue
    api.request('/pms/house/status/source/update.do', 'POST', data, true).then(res => {
      console.log("sourceUpdate", res.data)
      if (res.data.rlt_code == "S_0000") {
        that.hideModal()
        that.setData({
          showChangeModal: false
        })
        wx.showToast({
          title: '提交成功',
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
  toToday(e) {
    let today = e.currentTarget.dataset.day
    let calendar = that.data.datesList
    let houseIdList = that.data.houseIdList
    let calendarData
    calendar.map((item, index) => {
      item.days.map((items, indexs) => {
        if (items.date == today) {
          calendarData = {
            house_ids: houseIdList,
            start_date: calendar[index].days[0].date
          }
          console.log(index)
          that.setData({
            curIndex: index,
            year: item.year,
            preWeek: false,
            nextWeek: false,
          })
        }
      })
    })
    that.getCalendarData(calendarData)
    that.scrollLeft()
  },
  toBind(e) {
    let toRelation = that.data.toRelation
    console.log(toRelation)
    if (toRelation == 0){
      wx.navigateTo({
        url: '/pages/account/account',
      })
    } else {
      wx.reLaunch({
        url: '/pages/house/house?num=0',
      })
    }
  },
  pushRelation(e){
    console.log('pushRelation:', e)
    that.setData({
      toRelation: e
    })
    if(e == 0){
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
  showEmpty(e){
    console.log('showEmpty')
    that.setData({
      showContainer: false,
      emptyContainer: true
    })
  },
  toDetail(e) {
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?id=' + that.data.orderId
    })
    that.hideModal()
  },
  nextWeek(e) {
    let calendar = that.data.datesList
    let houseIdList = that.data.houseIdList
    let curIndex = that.data.curIndex
    let calendarData
    console.log(curIndex)
    if (curIndex == calendar.length - 1){
      // that.setData({
      //   nextWeek: true
      // })
      // that.showToast('暂无更多数据')
      return
    }
    if (curIndex == calendar.length - 2) {
      that.setData({
        nextWeek: true
      })
    }
    that.setData({
      preWeek: false
    })
    calendar.map((item, index) => {
      item.days.map((items, indexs) => {
        if (items.date == calendar[curIndex + 1].days[0].date) {
          calendarData = {
            house_ids: houseIdList,
            start_date: calendar[index].days[0].date
          }
          that.setData({
            curIndex: index,
            year: item.year
          })
        }
      })
    })
    that.getCalendarData(calendarData)
    that.scrollLeft()
  },
  preWeek(e) {

    let calendar = that.data.datesList
    let houseIdList = that.data.houseIdList
    let curIndex = that.data.curIndex
    let calendarData
    console.log(curIndex)
    if (curIndex == 0) {
      // that.setData({
      //   preWeek: true
      // })
      // that.showToast('暂无更多数据')
      return
    }
    if (curIndex == 1) {
      that.setData({
        preWeek: true
      })
      // that.showToast('暂无更多数据')
    }
    that.setData({
      nextWeek: false
    })
    calendar.map((item, index) => {
      item.days.map((items, indexs) => {
        if (items.date == calendar[curIndex - 1].days[0].date) {
          calendarData = {
            house_ids: houseIdList,
            start_date: calendar[index].days[0].date
          }
          that.setData({
            curIndex: index,
            year: item.year
          })
        }
      })
    })
    that.getCalendarData(calendarData)
    that.scrollLeft()



    // let calendar = that.data.datesList
    // let houseIdList = that.data.houseIdList
    // let curIndex = that.data.curIndex
    // console.log(curIndex)
    // if (curIndex > 0) {
    //   that.setData({
    //     // listTouchDirection: null,
    //     touchMove: 0,
    //   })
    //   calendar.map((item, index) => {
    //     item.days.map((items, indexs) => {
    //       if (items.date == calendar[curIndex - 1].days[0].date) {
    //         console.log(indexs)
    //         that.setData({
    //           curIndex: index,
    //           year: item.year
    //         })
    //       }
    //     })
    //   })
    //   let calendarData = {
    //     house_ids: houseIdList,
    //     start_date: calendar[curIndex - 1].days[0].date
    //   }
    //   that.getCalendarData(calendarData)
    // } else {
    //   that.showToast('暂无更多数据')
    // }
  },
  scrollLeft(e){
    that.setData({
      scrollLeft: 0
    })
  },
  toAddorder(e) {
    wx.navigateTo({
      url: '/pages/addOrder/addOrder?id=' + that.data.houseId + '&curDate=' + that.data.curDate
    })
    that.hideModal()
  },
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
  onShow(){
    that.setData({
      isLogin: app.globalData.isLogin
    })
    if (!app.globalData.isLogin) {
      return
    }
    that.getList()
    // let list = that.data.list
    // console.log('list.length > 0 && !that.data.emptyContainer:', list.length > 0 && !that.data.emptyContainer)
    // //  || !that.data.emptyContainer
    // if (list.length > 0 && !that.data.emptyContainer){
    //   return
    // }
    // getAll.getAll(that, true, false)
  },
  zeroIng(e) {
    that.setData({
      touchMove: 0
    })
  },
  
  listTouchStart(e) {// ListTouch触摸开始
    // console.log(e)
    that.data.lastX = e.touches[0].pageX
    that.data.lastY = e.touches[0].pageY
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
  },
  listTouchEnd(e) {// ListTouch计算滚动
    console.log(e)
    console.log(that.data.text)
    if (that.data.flag == 1) {
      that.setData({
        touchMove: that.data.rollingDistance
      })
    } else if (that.data.flag == 2) {
      that.setData({
        touchMove: 0
      })
    }
    that.data.flag = 0
  },

  initDates(){
    let newDate = new Date();
    for (var i = -18; i <= 18; i++) {
      that.updateDates(calendar.DateAddDay(newDate, i * 10));
    }
  },
  // 获取今天开始往后10天
  calculateDates(_date) {
    // var first = calendar.FirstDayInThisWeek(_date);
    var d = {
      'year': _date.getFullYear(),
      'month': _date.getMonth() + 1,
      'days': [],
    };
    for (var i = 0; i < 10; i++) {
      var dd = calendar.DateAddDay(_date, i);
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
    return d;
  },
  // 更新日期数组数据
  updateDates(_date, atBefore) {
    var week = this.calculateDates(_date);
    // console.log(week)
    if (atBefore) {
      this.setData({
        datesList: [week].concat(this.data.datesList),
      });
    } else {
      this.setData({
        datesList: this.data.datesList.concat(week),
      });
    }
  },


  initDate() {
    var d = new Date();
    var month = calendar.addZero(d.getMonth() + 1),
      day = calendar.addZero(d.getDate());
    for (var i = -20; i <= 25; i++) {
      this.updateDate(calendar.DateAddDay(d, i * 7));
    }
  },
  // 获取这周从周日到周六的日期
  calculateDate(_date) {
    var first = calendar.FirstDayInThisWeek(_date);
    // console.log(first)
    var d = {
      'year': first.getFullYear(),
      'month': first.getMonth() + 1,
      'days': [],
    };
    for (var i = 0; i < 7; i++) {
      var dd = calendar.DateAddDay(first, i);

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
    return d;
  },
  // 更新日期数组数据
  updateDate(_date, atBefore) {
    var week = this.calculateDate(_date);
    // console.log(week)
    if (atBefore) {
      this.setData({
        dateList: [week].concat(this.data.dateList),
      });
    } else {
      this.setData({
        dateList: this.data.dateList.concat(week),
      });
    }
  },
  // 日历组件轮播切换
  dateSwiperChange(e) {
    // console.log(e)
    var index = e.detail.current;
    var d = this.data.dateList[index];
    var D = utils.Uppercase(d.month)
    this.setData({
      swiperCurrent: index,
      dateMonth: D + '月',
    });
  },

  onPullDownRefresh: function () {
    // getAll.getAll(that, true, false)
    that.getList()
  },
  onReachBottom: function () {

  },
  // onShareAppMessage: function (options) {
  //   console.log(options)
  //   return {
  //     title: '宿宝',
  //     path: "/pages/home/home",
  //     imageUrl: "https://pms.magi.link/static/img/subao01.png",
  //     success: function (res) {
  //       console.log('onShareAppMessage  success:', res)
  //     },
  //     fail: function (res) {
  //       console.log('onShareAppMessage  fail:', res)
  //     }
  //   }
  // }
})
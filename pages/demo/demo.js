import * as echarts from '../../ec-canvas/echarts'
const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
let serverTime = wx.getStorageSync('serverTime')
let thisYear = util.formatYear(new Date(serverTime))
let thisMonth = util.formatMM(new Date(serverTime))
let thisDay = util.formatDD(new Date(serverTime))
var that
Page({
  data: {
    houseList: [],
    art: [],
    cardCur: 0,
    houseId: '',
    swiperIndex: 1,
    calendarIndex: 0,
    monthIndex: 0,
    typeList: ['公寓', '复式', '别墅', '农家乐', '客栈', '四合院', '渔家乐', '度假村', '老洋房', '房车营地', '帐篷营地', '韩屋', '竹屋', '蒙古包', '集装箱', '游艇', '木屋', '吊脚楼', '碉楼'],
    rangehouseList: [{ key: "请选择", data: null }, { key: "一居室", data: 1 }, { key: "二居室", data: 2, }, { key: "三居室", data: 3, }, { key: "四居室", data: 4, }, { key: "五居室", data: 5, }],
    cityArr: [{ key: "500m", data: 0.5 }, { key: "1Km", data: 1 }, { key: "2Km", data: 2 }],
    typeIndex: null,
    houseIndex: null,
    cityIndex: 0,
    houseLine: {
      lazyLoad: true,
      // onInit: initChart
    },
    date: ['日', '一', '二', '三', '四', '五', '六'],
    calendars: [[], [], [], [], [], []],
    maxCount: 3,
    houseDetail: [],
    houseCalendar: [],
    year: '',
    month: '',
    today: '',
    selectDate: '',
    selectCount: '',
    selectIndex: '',
    modalShow: false,
    showCalendars: false,
    showchart: false,
    oneprice: '',
    checkedLength: 0,
    isFirst: true,
    isRefresh: false,
    isSwiper: true,
    isIphoneX: false,
    isCalendar: false,
    modalName: null,
    truePlat: [],
    falsePlat: []
  },
  onLoad(options) {
    console.log(options)
    that = this
    if (!!options.id && options.calendar == 'true') {
      that.setData({
        houseId: options.id,
        isCalendar: true
      })
    }
    let data = {
      assess_status: null
    }
    that.getMyHouse(data)
    let today = util.formatDates(new Date(serverTime))
    console.log(today)
    that.setData({
      today,
      year: thisYear,
      month: thisMonth,
      isIphoneX: app.globalData.isIphoneX
    })
  },
  onShow() {
    if (that.data.isRefresh) {
      let list = that.data.houseList
      list.map((item, index, arr) => {
        if (item.id == that.data.houseId) {
          that.setData({
            cardCur: index
          })
        }
      })
    }
    that.setData({
      isFirst: false
    })
    if (!that.data.isFirst && that.data.swiperIndex == 1) {
      that.getHousePlat(that.data.houseId)
    }
  },

  getMyHouse(data) {
    // let pages = data
    api.request('/pms/house/assess_list.do', 'POST', data, true).then(res => {
      console.log('getMyHouse:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let datas = res.data.data
        console.log(datas)
        // let list = datas.filter(item => item.bind_source) 
        // console.log(list)
        that.setData({
          houseList: datas,
          // houseId: datas[0].id,
          // 'pages.current_page': res.data.data.current_page + 1,
        })
        let houseData = {
          calendar_type: 1,
          year: thisYear,
          month: thisMonth
        }
        if (!that.data.isCalendar) {
          that.setData({
            houseId: datas[0].id,
          })
          houseData.house_ids= [datas[0].id]
          // that.getCalendar(datas[0].id)
          // that.getHousePlat(datas[0].id)
        } else {
          datas.map((item, index) => {
            if (item.id == that.data.houseId) {
              console.log(that.data.houseId)
              that.setData({
                cardCur: index
              })
            }
          })
          houseData.house_ids = [that.data.houseId]
          // that.getCalendar(that.data.houseId)
          // that.getHousePlat(that.data.houseId)
        }
        console.log(houseData)
        that.getHouseCalendar(houseData)
        // if (datas[0].city_flag == 1 || datas[0].tujia_flag == 1) {
        //   return
        // }
        // // that.ecComponent = that.selectComponent('#houseChart')
        // console.log(that)
        // that.getData(datas[0].id, that.data.cityArr[that.data.cityIndex].data, null, null)
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  getData(e, s, v, d) {
    let data = {
      house_id: e,
      radius: s,
      layout: v,
      type: d
    }
    console.log(data)
    api.request('/pms/house/price/month_avg_price.do', 'POST', data, true).then(res => {
      console.log('getData:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          art: res.data.data,
          showchart: true
        })
        if (res.data.data[0].avg_price.length == 0) {
          that.showToast('该条件下无同行民宿价格')
          return
        }

        that.ecComponent = that.selectComponent('#houseChart')
        that.initChart(res.data.data, 0)
      } else if (res.data.rlt_code == 'PMS_0040') {
        that.setData({
          showchart: false
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  cardSwiper(e) {
    console.log(e)
    let _data = that.data
    that.setData({
      cardCur: e.detail.current,
      houseId: _data.houseList[e.detail.current].id,
      // isSwiper: false
    })
    console.log(that.data.isSwiper)
    // setTimeout(function () {
    //   that.setData({
    //     isSwiper: true
    //   })
    // }, 2000)
    console.log(that.data.isSwiper)
    if (_data.swiperIndex == 0) {
      if (_data.houseList[e.detail.current].city_flag == 1 || _data.houseList[e.detail.current].tujia_flag == 1) {
        return
      }
      that.getData(_data.houseList[e.detail.current].id, _data.cityArr[_data.cityIndex].data, _data.houseIndex ? _data.rangehouseList[_data.houseIndex].data : null, _data.typeIndex ? _data.typeList[_data.typeIndex] : null)
    } else {
      that.getCalendar(_data.houseList[e.detail.current].id)
      that.getHousePlat(_data.houseList[e.detail.current].id)
    }
  },

  tabSelect(e) {
    console.log(e)
    let target = e.currentTarget.dataset.target
    let id = e.currentTarget.dataset.id
    let data = target + "Index"
    that.setData({
      [data]: id
    })
    console.log(id == 0 && target == 'swiper')
    if (id == 0 && target == 'swiper') {
      // that.ecComponent = that.selectComponent('#houseChart')
      // that.initChart(that.data.art, id)
    }
    if (target == 'month') {
      // that.ecComponent = that.selectComponent('#houseChart')
      that.initChart(that.data.art, id)
    }
    if (id == 1 && target == 'swiper') {
      that.getCalendar(that.data.houseId)
      that.getHousePlat(that.data.houseId)
    }
  },
  dateInit: function (year, month, arr) {
    console.log(arr)
    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArr = []; //需要遍历的日历数组数据
    let arrLen = 0; //dateArr的数组长度

    let startWeek = new Date(year + '/' + month + '/' + 1).getDay(); //目标月1号对应的星期
    let dayNums = arr.length; //获取目标月有多少天
    let endWeek = new Date(year + '/' + month + '/' + dayNums).getDay(); //目标月最后一天对应的星期
    let obj = {};
    let num = 0;
    arrLen = startWeek + dayNums + 6 - endWeek;
    console.log(startWeek)
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek && i < dayNums + startWeek) {
        num = i - startWeek;
        obj = arr[num]
        if (thisDay == i - startWeek + 1) {
          obj.day = '今'
        } else {
          obj.day = i - startWeek + 1
        }
      } else {
        obj = {};
      }
      dateArr[i] = obj;
    }
    return dateArr
  },
  getHouseCalendar(data){
    api.request('/pms/house/status/calendar.do', 'POST', data, true).then(res => {
      console.log("getHouseCalendar", res.data)
      if (res.data.rlt_code == "S_0000") {
        let calendar = that.dateInit(thisYear, thisMonth, res.data.data.calendars[0].calendars)
        console.log(calendar)
        // calendar.map((item,index) => {

        // })
        that.setData({
          houseCalendar: calendar
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  getCalendar(e) {
    let data = {
      house_id: e
    }
    console.log(data)
    api.request('/pms/house/price/price_calendar.do', 'POST', data, true).then(res => {
      console.log('getCalendar:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        let newArr = []
        let todayMonth = util.formatMMs(new Date())
        let todayDay = util.formatDD(new Date())
        art.map((item, index, arr) => {
          newArr.push(item.month)
          item.date = util.formatDates(new Date(Date.parse(item.year + '/' + item.month + '/' + item.day)))
          if (item.day == todayDay && item.month == todayMonth) {
            item.day = '今'
          }
        })
        newArr = Array.from(new Set(newArr))
        // console.log(newArr)
        let calendars = [[], [], [], [], [], []]
        newArr.map((item, index, arr) => {
          let calendarArr = []
          art.map((iteml, indexl, arrl) => {
            if (item == iteml.month) {
              calendarArr.push(iteml)
            }
          })
          // console.log(calendarArr)
          calendars[index] = calendarArr
          // console.log(calendars)
        })
        calendars.map((item, index, arr) => {
          arr[index] = that.dateInit(item[0].year, item[0].month, item)
        })
        console.log(calendars)
        that.setData({
          calendars,
          showCalendars: true
        })
      } else {
        // that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  pickerChange(e) {
    console.log(e)
    let target = e.currentTarget.dataset.target
    // let id = e.currentTarget.dataset.id
    let data = target + "Index"
    let _data = that.data
    that.setData({
      [data]: e.detail.value
    })
    if (target == 'city') {
      that.getData(_data.houseId, _data.cityArr[e.detail.value].data, _data.houseIndex ? _data.rangehouseList[_data.houseIndex].data : null, _data.typeIndex ? _data.typeList[_data.typeIndex] : null)
    } else if (target == 'house') {
      that.getData(_data.houseId, _data.cityArr[_data.cityIndex].data, _data.rangehouseList[e.detail.value].data, _data.typeIndex ? _data.typeList[_data.typeIndex] : null)
    } else if (target == 'type') {
      that.getData(_data.houseId, _data.cityArr[_data.cityIndex].data, _data.houseIndex ? _data.rangehouseList[_data.houseIndex].data : null, _data.typeList[e.detail.value])
    }
  },

  //选择单个日期更改价格
  selectDate(e) {
    console.log(e)
    let date = e.currentTarget.dataset.date;
    let count = e.currentTarget.dataset.count
    let indexs = e.currentTarget.dataset.index;
    // let datenum = e.currentTarget.dataset.datenum;
    // let nowmonth = e.currentTarget.dataset.nowmonth
    // let tags = e.currentTarget.dataset.tags
    // console.log(tags)
    let houseDetail = that.data.houseDetail
    let calendars = that.data.calendars
    // console.log(count)
    // console.log(indexs)
    // console.log(houseDetail)
    // console.log(calendars)
    houseDetail.map((item, index) => {
      console.log(item)
      console.log(calendars[count][indexs])
      if (calendars[count][indexs].data.length == 0) {
        item.oldprice = ''
      } else {
        calendars[count][indexs].data.map((iteml, indexl) => {
          console.log(iteml)
          if (item.source == iteml.source) {
            item.oldprice = iteml.price
          }
        })
      }
    })
    console.log(houseDetail)
    that.setData({
      houseDetail: houseDetail,
      selectDate: date,
      selectCount: count,
      selectIndex: indexs,
      // confirmdate: date,
      modalShow: true
    })
    // if (tags == '') {
    //   tags = ''
    // }
    // that.getHousePlat(that.data.id, tags)

    // console.log(date)
  },
  //确定modal修改价格
  modalConfirm(e) {
    // console.log(e)
    let value = {}
    value.house_id = that.data.houseId
    value.update_list = []
    let houseDetail = that.data.houseDetail
    let checkedLength = that.data.checkedLength
    if (checkedLength == 0) {
      that.showToast('无修改价格，注意查看')
      return
    }
    for (let i = 0; i < houseDetail.length; i++) {
      if (houseDetail[i].checked) {
        if (houseDetail[i].price == '') {
          that.showToast('无修改价格，注意查看')
          return
        } else if (houseDetail[i].price == 0) {
          that.showToast('价格不能为0，请重新输入')
          return
        }
        value.update_list.push({ source: houseDetail[i].source, price: houseDetail[i].price, date: that.data.selectDate })
      }
    }
    console.log(value)
    wx.showLoading({
      title: '价格同步中'
    })
    that.hideModal()
    api.request('/pms/house/price/update_price.do', 'POST', value, true, true).then(res => {
      console.log('价格修改结果:', res.data)
      wx.hideLoading()
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        let truePlat = []
        let falsePlat = []
        art.map(item => {
          if (item.successFlag) {
            truePlat.push(item.source)
          } else {
            falsePlat.push(item.source)
          }
        })

        that.setData({
          confirmdate2: value.update_list[0].date,

        })
        if (falsePlat != '') {
          that.setData({
            modalName: 'uploadError',
            truePlat: truePlat,
            falsePlat: falsePlat
          })
        }
        that.getCalendar(that.data.houseId)

      } else {
        wx.showToast({
          title: '价格同步失败',
          image: '/images/updateError.png',
          duration: 2000
        })
        // that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => {

    })

  },

  //关闭modal
  hideModal() {
    let houseDetail = that.data.houseDetail
    houseDetail.map((item, index) => {
      item.price = ''
      item.checked = false
    })
    that.setData({
      modalShow: false,
      oneprice: '',
      selectDate: '',
      checkedLength: 0,
      houseDetail: houseDetail
    })
  },
  //点击单个checkbox
  checkTap(e) {
    console.log(e)
    let houseDetail = that.data.houseDetail
    let index = e.currentTarget.dataset.index
    let checkedData = e.currentTarget.dataset.checked
    let checkedLength = that.data.checkedLength
    houseDetail[index].checked = !houseDetail[index].checked
    console.log(index)
    if (!checkedData) {
      checkedLength++
    } else {
      checkedLength--
    }
    console.log(checkedLength)
    if (checkedLength < 2) {
      that.setData({
        oneprice: ''
      })
    }
    if (that.data.oneprice != '') {
      houseDetail.map(item => {
        if (item.checked) {
          item.price = that.data.oneprice
          console.log(item)
        }
      })
    }
    that.setData({
      houseDetail: houseDetail,
      checkedLength: checkedLength
    })
    // console.log(that.)
  },
  //监听单个价格修改
  bindSonInput(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index;
    let houseDetail = that.data.houseDetail
    houseDetail[index].price = e.detail.value
    that.setData({
      houseDetail
    })
  },
  //同一修改价格
  bindOnePrice(e) {
    let houseDetail = that.data.houseDetail

    houseDetail.map(item => {
      if (item.checked) {
        item.price = e.detail.value
        console.log(item)
      }
    })
    that.setData({
      houseDetail,
      oneprice: e.detail.value
    })

  },
  //获取房源平台列表
  getHousePlat(e) {
    let data = {
      house_id: e
    }
    api.request('/pms/house/detail.do', 'POST', data, true, false).then(res => {
      console.log('房源平台列表:', res.data)

      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data.bind_detail
        art.map((item, index) => {
          item.checked = false
          item.price = ''
        })
        console.log(art)
        that.setData({
          houseDetail: art
        })

      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => { })
  },
  //查看更多月份
  moreDate() {
    that.setData({
      maxCount: 6
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

  //重新登录
  relog(e) {
    let id = e.currentTarget.dataset.id;
    let source = e.currentTarget.dataset.source;
    wx.navigateTo({
      url: '../account/account'
    })
  },
  toAll(e) {
    wx.navigateTo({
      url: '../houseAll/houseAll?id=' + that.data.houseId,
    })
  },
  initChart(art, i) {
    console.log(art)
    let date = []
    art[i].house_price.map((item, index, arr) => {
      date.push(art[i].month + '/' + (index + 1))
    })
    console.log(date)
    let index = new Date().getDate()
    let startValue, endValue
    if (i == 0) {
      startValue = date.length - index < 7 ? date[date.length - 7] : date[index - 1]
      endValue = date.length - index < 7 ? date[date.length - 1] : date[index + 5]
    } else {
      startValue = date[0]
      endValue = date[6]
    }
    console.log(startValue)
    console.log(endValue)
    that.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      var option = {
        color: ['#00e0ff', '#0060e4'],
        grid: {
          top: '40',
          left: '0',
          right: '15',
          bottom: '0',
          containLabel: true,
          borderWidth: 0
        },
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0],
            startValue: startValue,
            endValue: endValue,
            zoomLock: true
            // type: 'inside',
            // xAxisIndex: [0],
            // startValue: date[index - 1],
            // endValue: date[index + 5],
            // zoomLock: true
          },
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            show: false,//轴线不显示
            //   lineStyle: {
            //     color: '#fff',
            //   }
          },
          axisTick: {
            show: false // 刻度线不限时
          },
          axisLabel: {
            textStyle: {
              color: '#9f9f9f',
              fontSize: '11'
            },

          },
          data: date
        },
        yAxis: {
          type: 'value',
          splitNumber: 3,
          axisTick: {
            show: false
          },
          axisLine: {
            show: false,//轴线不显示
          },
          axisLabel: {
            // margin: 20,
            textStyle: {
              color: '#9f9f9f',
              fontSize: '11'
            },

          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#999',
              opacity: 0.2
            }
          },
        },
        series: [
          {
            name: '我的',
            type: 'line',
            stack: '我的',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(0,248,255,0.2)' // 0% 处的颜色
                }, {
                  offset: 1, color: 'rgba(255,255,255,0.2)' // 100% 处的颜色
                }],
                global: false // 缺省为 false
              }
            },
            data: art[i].house_price
          },
          {
            name: '同行民宿',
            type: 'line',
            stack: '同行民宿',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(0,96,228,0.2)' // 0% 处的颜色
                }, {
                  offset: 1, color: 'rgba(255,255,255,0.2)' // 100% 处的颜色
                }],
                global: false // 缺省为 false
              }
            },
            label: {
              normal: {
                show: true,
                // position: 'top',
                // color: 'rgb(0,132,211)',
                // backgroundColor: 'rgb(183,234,255)',
                // padding: [3, 7],
                // borderRadius: 8,
              }
            },
            data: art[i].avg_price
          }
        ]
      }
      console.log(option)
      chart.setOption(option);

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });

  },
  //关闭同步情况弹框
  closeModal() {
    that.setData({
      modalName: null,
      truePlat: [],
      falsePlat: []
    })
  }
})
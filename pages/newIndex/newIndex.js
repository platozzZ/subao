import * as echarts from '../../ec-canvas/echarts'
const app = getApp();
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
const login = require('../../utils/wxLogin.js')
const getAll = require('../../utils/getAll.js')
var that
Page({
  data: {
    lookList: [],
    art: '',
    chartData: '',
    statu: 0,
    lastTime: '',
    isLogin: false,
    unHouseNum: '',
    totalNum: '',
    typeList: ['公寓','别墅','复式'],
    typeValue: '公寓',
    cityArr: ["北京", "上海", "广州", "深圳", "重庆", "成都", "西安", "杭州", "青岛", "武汉"],
    cityIndex: 0,
    tabCur: 0,
    tools: [
      {
        title: '上传房源',
        btntext: '立即上传',
        disabled: false,
        icon: '/images/index-pt.png',
        des: [
          {
            title: '平台多',
            color: "#f39b48"
          }, {
            title: '上线快',
            color: "#6ec3ff"
        }
        ]
      }, 
      {
        title: '民宿房源竞争力评估',
        btntext: '立即获取',
        disabled: false,
        icon: '/images/index-pg.png',
        isFree: true,
        des: [
          {
            title: '科学算法',
            color: "#c03fff"
          }, {
            title: '高效准确',
            color: "#0094fe"
          }
        ]
      }, 
      {
        title: '实时掌握周边房源定价',
        btntext: '立即获取',
        disabled: false,
        icon: '/images/index-jg.png',
        isFree: true,
        des: [
          {
            title: '实时监控',
            color: "#0094fe"
          }, {
            title: '海量对比',
            color: "#00e0ff"
          }, {
            title: '一键改价',
            color: "#f39b48"
          }
        ]
      }, 
      {
        title: '优秀民宿装修参考',
        btntext: '立即上线',
        disabled: true,
        icon: '/images/index-zx.png',
        des: [{
          title: '时下流行',
          color: "#c03fff"
        }, {
          title: '最受欢迎',
          color: "#0094fe"
        }]
      },
      {
        title: '查看周边房源位置',
        btntext: '立即上线',
        disabled: true,
        icon: '/images/index-wz.png',
        des: [{
          title: '定位精准',
          color: "#0094fe"
        }, {
          title: '信息齐全',
          color: "#f39b48"
        }]
      },
    ],
    indexLine: {
      lazyLoad: true,
      // onInit: initChart
    },
  },
  onReady(){
  },
  onLoad: function(options) {
    that = this
    that.ecComponent = that.selectComponent('#indexChart')
    // that.getTotalNum() // 获取累计房屋测评
    that.getLookList()  //获取文章列表
    console.log(that)
    // that.getWeekPrice(that.data.cityArr[that.data.cityIndex], that.data.typeValue)
    
  },
  //点击顶部nav

  topnav(e) {
    let index = e.currentTarget.dataset.index;
    console.log(index)
    //status==0  已登录未关联宿宝房源
    // if (!that.data.isLogin){
    //   wx.navigateTo({
    //     url: '../login/login?path=newIndex'
    //   })
    //   return
    // }
    app.globalData.tabCur = 1
    wx.switchTab({
      url: '../house/house',
    })
    if(index == 5){
      app.mtj.trackEvent('shouye_1');
    }
  }, 
  getPhoneNumber(e) {
    console.log(e)
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    let data = {
      iv: e.detail.iv,
      encrypted_data: e.detail.encryptedData
    }
    let storageOpenid = wx.getStorageSync('openid')
    let globalOpenid = app.globalData.open_id
    data.openid = this.checkOpenid(storageOpenid) ? storageOpenid : globalOpenid
    console.log(data)
    api.request('/pms/weixin/decrypt_authorization', 'POST', data, true, false, false, app).then(res => {
      console.log('getPhoneNumber:', res.data)

      if (res.data.rlt_code == 'S_0000') {
        wx.setStorageSync('token', res.data.data.access_token)
        app.globalData.isLogin = true
        app.globalData.user_mobile = res.data.data.user_mobile
        wx.showToast({
          title: '授权成功',
          success(res) {
            setTimeout(function () {
              let target = e.currentTarget.dataset.target
              let index = e.currentTarget.dataset.index
              if (index == 0) {
                wx.navigateTo({
                  url: '../updateSelect/updateSelect?status=0',
                })
              } else if (index == 1 || index == 2){
                wx.switchTab({
                  url: '/pages/house/house',
                })
              } else {
                that.onLoad()
              }
              
            }, 2000)
          }
        })
      } else {
        this.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => { })
  },

  checkOpenid(e) {
    if (e == 0 || e == undefined || e == null || e == false || e == '') {
      return false
    } else {
      return true
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
  //获取最新评估时间
  getWeekPrice(e,v) {
    let data = {
      city: e,
      type: v
    }
    console.log(data)
    api.request('/pms/house/price/week_avg_price', 'POST', data, true, false).then(res => {
      console.log('getWeekPrice:',res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.initIndexChart(res.data.data.price_list)
        // that.initIndexChart()
        that.setData({
          chartData: res.data.data
        })
        // that.setData({
        //   lastTime: util.formatDates(new Date(res.data.data.latest_assess_time)),
        // })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => { })
  },
  //获取最新评估时间
  getLatestTime() {
    api.request('/pms/house/assess/latest_assess_time.do', 'POST', '', true, true).then(res => {
      console.log(res.data)

      if (res.data.rlt_code == 'S_0000') {

        that.setData({
          lastTime: util.formatDates(new Date(res.data.data.latest_assess_time)),
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => { })
  },
  //点击工具
  toolTap(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index;
    if (index == 0) {
      app.mtj.trackEvent('shouye_2');
      wx.navigateTo({
        url: '../updateSelect/updateSelect?status=0',
      })
    } else if (index == 1) {
      wx.switchTab({
        url: '../house/house',
      })
    } else if (index == 2) {
      wx.switchTab({
        url: '../house/house',
      })
    } else {
      that.showToast('此工具暂未开放，程序员小哥哥努力开发中')
    }

  },


  tabSelect(e) {
    console.log(e)
    // let target = e.currentTarget.dataset.target
    let id = e.currentTarget.dataset.id
    let value = e.currentTarget.dataset.value
    // let data = target + "Index"
    that.setData({
      typeValue: value
    })
    
    that.getWeekPrice(that.data.cityArr[that.data.cityIndex], value)
  },
  pickerChange(e){
    console.log(e)
    that.setData({
      cityIndex: e.detail.value
    })
    that.getWeekPrice(that.data.cityArr[e.detail.value], that.data.typeValue)
  },
  toList() {
    wx.navigateTo({
      url: '../uploadStep1/uploadStep1?first=true',
    })
  },

  //获取未评估的房源数量
  getUnhouseNum() {
    api.request('/pms/house/assess/unassess_housenum.do', 'POST', '', true, false, false, app).then(res => {
      console.log('getUnhouseNum:',res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          unHouseNum: res.data.data.unassess_housenum
        })
        // if (res.data.data.unassess_housenum == 0){
        //   return
        // }
        that.getAssessLevel()
      } 
      // else {
      //   that.showToast(res.data.rlt_msg)
      // }
    }).catch(res => {
      console.log(res)

    }).finally(() => {})
  },
  //获取已评估等级数据
  getAssessLevel() {
    api.request('/pms/house/assess/low_assess.do', 'POST', '', true, false, false, app).then(res => {
      console.log('getAssessLevel:',res.data)
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        if(!art){
          return
        }
        that.getLatestTime()
        art.lastTime = util.formatDates(new Date(art.latest_assess_time))
        that.setData({
          art: art,
        })
      }
      //  else {
      //   that.showToast(res.data.rlt_msg)
      // }
    }).catch(res => {
      console.log(res)

    }).finally(() => {})
  },
  //获取累计房屋测评
  getTotalNum() {
    api.request('/pms/house/assess/total_assess_num', 'POST', '', true, false, false, app).then(res => {
      console.log('getTotalNum:',res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          totalNum: res.data.data.total_assess_num || 0
        })
      }
      //  else {
      //   that.showToast(res.data.rlt_msg)
      // }
    }).catch(res => {
      console.log(res)

    }).finally(() => {})
  },

  // 获取首页文章列表
  getLookList() {

    api.request('/pms/article/hot_list', 'POST', '', true, true).then(res => {
      console.log('文章列表:',res.data)

      if (res.data.rlt_code == 'S_0000') {

        that.setData({
          lookList: res.data.data,
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => { })
  },

  //查看更多
  toMore() {
    wx.navigateTo({
      url: '../lookMoreArticle/lookMoreArticle',
    })
  },
  //跳转look文章详情

  lookDetail(e) {
    let id=e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../experienceShare/experienceShare?id='+id,
    })
  },

  onShow() {
    that.setData({
      isLogin: app.globalData.isLogin
    })

    if (!app.globalData.isLogin){
      return
    }

    // that.getUnhouseNum() // 获取未评估房源
 
    // that.getAssessLevel() // 获取已评估等级
  },

  initIndexChart(art) {
    // console.log(art)
    let data = []
    art.map((item,index,arr) => {
      item = Math.floor(item)
      // console.log(item)
      data.push(item)
    })
    console.log(data)
    that.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      var option = {
        color: ['rgb(0,205,255 )'],
        grid: {
          show: true,
          top: '25',
          left: '15',
          right: '30',
          bottom: '10',
          containLabel: true,
          borderWidth: 0
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisTick: {
            show: false // 刻度线不限时
          },
          axisLine: {
            show: false,//轴线不显示
            lineStyle: {
              color: 'rgb(159,159,159)',
            }
          },
          axisLabel: {
            textStyle: {
              color: 'rgba(255,255,255,.6)',
              fontSize: '11'
            },

          },

          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: 'rgb(255,255,255)',
              opacity: 0.3
            }
          },
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: [
          {
            type: 'value',
            // axisLabel: {
            //   formatter: '{value} 元'
            // },
            splitNumber: 3,
            axisTick: {
              show: false
            },
            axisLine: {
              show: false,//轴线不显示
              //   lineStyle: {
              //     color: '#fff',
              //   }
            },
            axisLabel: {
              margin: 20,
              textStyle: {
                color: 'rgba(255,255,255,.6)',
                fontSize: '11'
              },

            },
            splitLine: {
              show: false,
              lineStyle: {
                type: 'dashed',
                // color: 'rgb(229,229,229)',
                // opacity: 0.5
              }
            },
          }
        ],
        series: [
          {
            name: '',
            type: 'line',
            stack: '总量',
            smooth: true,//折线平滑显示
            lineStyle: {
              width: 4
            },
            label: {
              normal: {
                show: true,
                position: 'top',
                color: 'rgb(0,132,211)',
                backgroundColor: 'rgb(183,234,255)',
                padding: [3, 7],
                borderRadius: 8,
              }
            },
            data: data
          }
        ]
      }
      // console.log(option)
      chart.setOption(option);

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });

  },
  onShareAppMessage: function (options) {
    console.log(options)
    console.log(app.globalData)
    return {
      title: app.globalData.shareTitle ? app.globalData.shareTitle : '经营民宿用宿宝，订单翻倍涨',
      path: "/pages/home/home",
      imageUrl: app.globalData.shareImg ? app.globalData.shareImg : 'https://magisubao.oss-cn-beijing.aliyuncs.com/images/public/subao01.png',
      success: function (res) {
        console.log('onShareAppMessage  success:', res)
      },
      fail: function (res) {
        console.log('onShareAppMessage  fail:', res)
      }
    }
  }

})
import * as echarts from '../../ec-canvas/echarts'
const app = getApp();
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
Page({
  data: {
    houseId: '',
    art: {},
    isLogin: false,
    ecLine: {
      lazyLoad: true,
    },
    imgHeight: 200,
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
  },
  onLoad: function(options) {
    that = this
    console.log(that.selectComponent('#mainChart'))
    that.setData({
      houseId: options.id,
      isLogin: app.globalData.isLogin
    })
    that.getData(options.id)
    that.ecComponent4 = that.selectComponent('#mainChart');
  },
  //顶部问号跳转历史记录
  underscore() {
    wx.navigateTo({
      url: '../understandScore/understandScore?id=' + that.data.houseId,
    })
  },
  //点击房源评估详情
  todetail() {
    app.mtj.trackEvent('fangyuan_9')
     wx.navigateTo({
       url: '../result/result?id=' + that.data.houseId,
     })
  },
  //点击工具
  toolTap(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index;
    if (index == 0) {
      app.mtj.trackEvent('fangyuan_10')
      wx.navigateTo({
        url: '../updateSelect/updateSelect?status=0',
      })
    } else if (index == 1) {
      wx.navigateTo({
        url: '../houseAssess/houseAssess'
      })
    } else if (index == 2) {
      wx.navigateTo({
        url: '../houseVie/houseVie'
      })
    } else {
      that.showToast('此工具暂未开放，程序员小哥哥努力开发中')
    }

  },

  //获取评估数据
  getData(id) {
    console.log(that.selectComponent('#mainChart'))
    let data = {
      house_id: id
    }
    api.request('/pms/house/assess/view_assess.do', 'POST', data, true, false).then(res => {
      console.log('getData:',res.data)

      if (res.data.rlt_code == 'S_0000') {
        // var data = res.data.data
        var art = res.data.data
        art.latest_assess_time = util.formatDates(new Date(art.latest_assess_time))

        that.setData({
          art: art,
        })
        that.initCanvasss(art)
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => {})
  },
  bgLoad(e) {
    console.log(e)
    // let id = e.currentTarget.id
    let imgWidth = app.globalData.screenWidth
    let imgHeight = e.detail.height / e.detail.width * imgWidth
    that.setData({
      imgHeight: imgHeight
    })
  },
  initCanvasss: function (art) {
    console.log(art)
    console.log(that)
    that.ecComponent4.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      console.log(chart)
      var option = {
        radar: [
          {
            indicator: [
              { text: '客源', max: 300 },
              { text: '装修', max: 300 },
              { text: '价格', max: 300 },
              { text: '位置', max: 200 },
            ],
            radius: 50,
            splitNumber: '3',
            axisLine: {
              lineStyle: {
                color: 'rgba(79,204,255, 0.33 )'
              }

            },

            splitLine: {
              lineStyle: {
                // 使用深浅的间隔色
                color: ['rgba(0,212,255,0.69 )']
              }

            },
            splitArea: {
              areaStyle: {
                color: 'rgba(79,204,255, 0.33 )'

              }

            }
          }
        ],
        // backgroundColor: 'rgb(43,111,228)',
        color: 'rgba(79,204,255, 0.33 )',
        textStyle: {
          color: 'rgba(255,255,255,0.6)'
        },
        series: [
          {
            type: 'radar',
            itemStyle: {
              opacity: 0
            },
            radar: {
              label: {
                normal: {
                  show: true,
                  position: 'top',
                  color: '#ff4444'
                }
              },
            },
            data: [
              {
                value: [art.customer_score, art.fitment_score, art.price_score, art.location_score],
                // value: [120, 30, 80, 50],
                areaStyle: {
                  color: 'rgba(0,212,255,0.69 )'
                }
              }
            ]
          }
        ]
      }
      chart.setOption(option);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },
  //modal显示
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      duration: 2000,
      mask: true
    })
  },


})
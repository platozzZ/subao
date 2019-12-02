
import * as echarts from '../../ec-canvas/echarts'
const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that

Page({
  data: {
    art: '',
    bgHeight: 0,
    textbgHeight: 0,
    wzNum: 200,
    houseList: [],
    rsStatus: ['较差', '良好', '优秀', '极好'],
    showMore: false,
    fold: null,
    wzIndex: 0,
    jg1Index: 0,
    jg2Index: 0,
    jg3Index: 0,
    jlIndex: 0,
    zxIndex: 0,
    ecLine: {
      lazyLoad: true ,
      // onInit: initChart
    },
    ecLine2: {
      lazyLoad: true,
    },
    ecBar: {
      lazyLoad: true,
    },
    tagList: [
      {
        name: '洗浴',
        list: [
          { name: '卫生纸', disabled: false }, 
          { name: '毛巾', disabled: false }, 
          { name: '沐浴露/洗发水', disabled: false }, 
          { name: '香皂', disabled: false },
          { name: '牙具', disabled: false },
          { name: '浴巾', disabled: false },
        ]
      }, {
        name: '居家',
        list: [
          { name: 'WI-FI', disabled: false }, 
          { name: '冰箱', disabled: false }, 
          { name: '电视', disabled: false }, 
          { name: '暖气', disabled: false }, 
          { name: '洗衣机', disabled: false }, 
          { name: '空调', disabled: false }, 
          { name: '热水淋浴', disabled: false }, 
          { name: '拖鞋', disabled: false }, 
          { name: '吹风机', disabled: false }, 
          { name: '净水机', disabled: false }, 
          { name: '热水壶', disabled: false }, 
          { name: '晾衣架', disabled: false }, 
          { name: '电熨斗', disabled: false }, 
          { name: '空气净化器', disabled: false }, 
          { name: '洗衣粉/液', disabled: false }, 
          { name: '茶几', disabled: false }, 
          { name: '休闲椅', disabled: false }, 
          { name: '沙发', disabled: false }, 
          { name: '地毯', disabled: false }, 
          { name: '加湿器', disabled: false }
        ]
      },{
        name: '餐厨',
        list: [
          { name: '餐具', disabled: false }, 
          { name: '微波炉', disabled: false }, 
          { name: '烹饪锅具', disabled: false }, 
          { name: '调料', disabled: true },
        ]
      },
    ]
    
  },
  onLoad: function (options) {
    // util.formatDates(new Date(dd))
    that = this
    console.log(options)
    that.getData(options.id)
    var query = wx.createSelectorQuery();
    //选择id
    query.selectAll('.location').boundingClientRect(function (rect) {
      console.log(rect)
      for(let i = 0; i < rect.length; i ++ ){
        if(rect[i].height > 22){
          that.setData({
            showMore: true,
            fold: true
          })
          return
        }
      }
      
    }).exec();

    // 获取组件
    that.ecComponent = that.selectComponent('#chart00');
    that.ecComponent2 = that.selectComponent('#chart2');
    that.ecComponent3 = that.selectComponent('#chart3');
  },
  getData(e) {
    let data = {
      house_id: e
    }
    api.request('/pms/house/assess/assess_detail.do', 'POST', data, true).then(res => {
      console.log('getData:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        art.createTime = util.formatDates(new Date(art.create_time))
        let tagList = that.data.tagList
        let i = 0
        art.fitment_exclude_facilities.map((item,index,arr) => {
          tagList.map((itemt,indext) => {
            itemt.list.map((iteml,indexl) => {
              if(item == iteml.name){
                iteml.disabled = true
                i = i + 1
              }
            })
            itemt.list.sort(that.sortBy('disabled',true))
          })
        })
        art.fitmentLength = i
        let new1 = art.near_500m_basic_position.type_1 ? art.near_500m_basic_position.type_1: []
        let new2 = art.near_500m_basic_position.type_5 ? new1.concat(art.near_500m_basic_position.type_5) : new1
        let near500 = new Array(4)
        near500.splice(0, 1, new2 ? new2.length:0)
        near500.splice(1, 1, art.near_500m_basic_position.type_2 ? art.near_500m_basic_position.type_2.length : 0)
        near500.splice(2, 1, art.near_500m_basic_position.type_3 ? art.near_500m_basic_position.type_3.length : 0)
        near500.splice(3, 1, art.near_500m_basic_position.type_4 ? art.near_500m_basic_position.type_4.length : 0)
        art.near500 = near500

        let new3 = art.near_1000m_basic_position.type_1 ? art.near_1000m_basic_position.type_1 : []
        let new4 = art.near_1000m_basic_position.type_5 ? new3.concat(art.near_1000m_basic_position.type_5) : new3
        let near1000 = new Array(4)
        near1000.splice(0, 1, new4 ? new4.length : 0)
        near1000.splice(1, 1, art.near_1000m_basic_position.type_2 ? art.near_1000m_basic_position.type_2.length : 0)
        near1000.splice(2, 1, art.near_1000m_basic_position.type_3 ? art.near_1000m_basic_position.type_3.length : 0)
        near1000.splice(3, 1, art.near_1000m_basic_position.type_4 ? art.near_1000m_basic_position.type_4.length : 0)
        art.near1000 = near1000

        let near500Index = 0
        let near500Max = 0
        art.near500.map((item,index,arr) =>{
          if (item > near500Max){
            near500Max = item
            near500Index = index
            // return
          }
        })
        art.near500Index = near500Index
        let near1000Index = 0
        let near1000Max = 0
        art.near1000.map((item, index, arr) => {
          if (item > near1000Max) {
            near1000Max = item
            near1000Index = index
            // return
          }
        })
        art.near1000Index = near1000Index
        console.log('art:', art)
        that.setData({
          art: art,
          tagList: tagList
        })
        that.initNear(art)
        that.initLayout(art)
        that.initType(art)
      } else {
        // that.showToast(art.rlt_msg)
      }
    }).catch(res => {
      // that.showToast(art.rlt_msg)
    }).finally(() => { })
  },
  /**数组根据数组对象中的某个属性值进行排序的方法 
     * 使用例子：newArray.sort(sortBy('number',false)) //表示根据number属性降序排列;若第二个参数不传递，默认表示升序排序
     * @param attr 排序的属性 如number属性
     * @param rev true表示升序排列，false降序排序
     * */
  sortBy(attr, rev) {
    //第二个参数没有传递 默认升序排列
    if (rev == undefined) {
      rev = 1;
    } else {
      rev = (rev) ? 1 : -1;
    }

    return function (a, b) {
      a = a[attr];
      b = b[attr];
      if (a < b) {
        return rev * -1;
      }
      if (a > b) {
        return rev * 1;
      }
      return 0;
    }
  },
  initNear(art) {
    console.log(that)
    // console.log(this)
    let e = art.month_avg_price_distance
    let data = e[that.data.jlIndex][that.data.jg1Index]
    console.log(e)
    console.log(data)
    let date = []
    data.data.map((item,index,arr) => {
      date.push((index + 1) + '日')
    })
    console.log(date)
    let index = new Date().getDate()
    let startValue, endValue
    if (that.data.jg1Index == 0) {
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
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: '#fff' // 0% 处的颜色
          }, {
            offset: 1, color: 'rgba(115,173,255,0.5)' // 100% 处的颜色
          }],
          global: false // 缺省为 false
        },
        grid: {
          top: '30',
          left: '10',
          right: '3.5%',
          bottom: '10',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0],
            startValue: startValue,
            endValue: endValue,
            zoomLock: true
          },
        ],
        xAxis: [
          {
            type: 'category',
            axisTick: {
              show: false // 刻度线不限时
            },
            boundaryGap: false,
            axisLine: {
              show: false,//轴线不显示
              lineStyle: {
                color: 'rgb(159,159,159)',
              }
            },
            axisLabel: {
              textStyle: {
                color: '#999',
                fontSize: '10'
              },

            },
            data: date
          }
        ],
        yAxis: [
          {
            type: 'value',
            // axisLabel: {
            //   formatter: '{value} 元'
            // },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false,//轴线不显示
              lineStyle: {
                color: 'rgb(159,159,159)',
              }
            },
            axisLabel: {
              textStyle: {
                color: '#999',
                fontSize: '10'
              },

            },
            splitLine: {
              lineStyle: {
                // type: 'dashed'
                color: 'rgb(229,229,229)',
                opacity: 0.5
              }
            },
          }
        ],
        series: [
          {
            name: '均价',
            type: 'line',
            stack: '总量',
            // smooth: true,//折线平滑显示
            label: {
              normal: {
                show: true,
                position: 'top',
                color: 'rgb(0,248,255)'
              }
            },
            areaStyle: { normal: {} },
            data: data.data
          }
        ]
      }
      // console.log(option)
      chart.setOption(option);

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });

  },
  initLayout(art) {
    let e = art.month_avg_price_layout
    let data = e[that.data.jg2Index]
    console.log(e)
    console.log(data)
    that.ecComponent2.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      var option = {
        // textStyle: {
        //   fontSize: '10'
        // },
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgb(0,96,228)' // 0% 处的颜色
          }, {
            offset: 1, color: '#fff' // 100% 处的颜色
          }],
          global: false // 缺省为 false
        },
        grid: {
          top: '30',
          left: '10',
          right: '20',
          bottom: '10',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            axisTick: {
              show: false // 刻度线不限时
            },
            boundaryGap: false,
            axisLine: {
              show: false,//轴线不显示
              lineStyle: {
                color: 'rgb(159,159,159)',
              }
            },
            axisLabel: {
              textStyle: {
                color: '#999',
                fontSize: '10'
              },

            },
            data: ['一居室', '二居室', '三居室',]
          }
        ],
        yAxis: [
          {
            type: 'value',
            // axisLabel: {
            //   formatter: '{value} 元'
            // },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false,//轴线不显示
              lineStyle: {
                color: 'rgb(159,159,159)',
              }
            }, 
            axisLabel: {
              textStyle: {
                color: '#999',
                fontSize: '10'
              },

            },
            splitLine: {
              lineStyle: {
                // type: 'dashed'
                color: 'rgb(229,229,229)',
                opacity: 0.5
              }
            },
          }
        ],
        series: [
          {
            name: '均价',
            type: 'line',
            stack: '总量',
            smooth: true,//折线平滑显示
            label: {
              normal: {
                show: true,
                position: 'top',
                color: 'rgb(0,96,228)'
              }
            },
            areaStyle: { normal: {} },
            data: data.data
          }
        ]
      }
      chart.setOption(option);

      return chart;
    });

  },
  initType(art){
    let e = art.month_avg_price_type
    let data = e[that.data.jg3Index]
    console.log(e)
    console.log(data)
    that.ecComponent3.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      var option = {
        grid: {
          top: '30',
          left: '10',
          right: '0%',
          bottom: '10',
          containLabel: true
        },
        xAxis: {
          axisLabel: {
            textStyle: {
              color: '#999',
              fontSize: '10'
            },

          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false,//轴线不显示
            lineStyle: {
              color: 'rgb(159,159,159)',
              //   width: 0
            }
          },
          data: ['公寓', '复式', '别墅', '客栈', '农家乐'],

        },
        yAxis: {
          axisLine: {
            show: false,//轴线不显示
            lineStyle: {
              color: 'rgb(159,159,159)',
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              // type: 'dashed'
              color: 'rgb(229,229,229)',
              opacity: 0.5
            }
          },
          axisLabel: {
            // formatter: '{value} 元',
            textStyle: {
              color: '#999',
              fontSize: '10'
            }
          }
        },
        series: [

          {
            type: 'bar',
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    { offset: 0, color: 'rgb(115,173,255)' },
                    { offset: 1, color: 'rgb(203,229,255)' }
                  ]
                )
              },

            },
            label: {
              show: true, //开启显示
              position: 'top', //在上方显示
              textStyle: { //数值样式
                color: 'rgb(115,173,255 )',
                fontSize: 10,
                fontWeight: 600
              }
            },
            data: data.data,
            barWidth: 10,
          }
        ]
      }
      chart.setOption(option);
      return chart;
    });

  },
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
  bgLoad(e) {
    console.log(e)
    let id = e.currentTarget.id
    let imgWidth = app.globalData.screenWidth
    let imgHeight = e.detail.height / e.detail.width * imgWidth
    that.setData({
      [id + 'Height']: imgHeight
    })
  },
  bindFold(){
    that.setData({
      fold: !that.data.fold
    })
  },
  tabSelect(e) {
    console.log(e)
    let target = e.currentTarget.dataset.target
    let id = e.currentTarget.dataset.id
    let data = target + "Index"
    that.setData({
      [data]: id
    })
    if (target == 'jg1' || target == 'jl') {
      that.initNear(that.data.art)
    } else if (target == 'jg2'){
      that.initLayout(that.data.art)
    } else if (target == 'jg3') {
      that.initType(that.data.art)
    }
  },
  toList() {
    wx.navigateTo({
      url: '../uploadStep1/uploadStep1?first=true',
    })
  },
  onShow: function () {
    // that.getData()

    // that.init()
  },
})



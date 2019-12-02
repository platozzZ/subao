const app = getApp()
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'
var that
Page({
  data: {
    art: '',
    multiShow: true,
    houseId: '',
    minNum: 1,
    maxNum: 1,
    maxDate: 0,
    presetTime: '',
    recepTion: '',
    isIndex: null,
    isArr: ['12:00后', '13:00后', '14:00后', '15:00后'],
    ieIndex: null,
    ieArr: ['21:00前', '22:00前', '23:00前', '24:00前', '次日1:00前', '次日2:00前', '次日3:00前', '不限时间'],
    oeIndex: null,
    oeArr: ['12:00前', '13:00前', '14:00前', '15:00前'],
    wsIndex: null,
    wsArr: ['一客一扫', '一天一扫', '两天一扫', '三天一扫', '四天一扫', '五天一扫', '六天一扫', '七天一扫'],
    bdIndex: null,
    bdArr: ['一客一换', '一天一换', '两天一换', '三天一换', '四天一换', '五天一换', '六天一换', '七天一换'],
    pageType: null
  },
  onLoad: function (options) {
    app.mtj.trackEvent('wode_16')
    that = this
    console.log(options)
    that.initValidate()
    that.setData({
      houseId: options.id
    })
    let data = {
      upload_house_id: options.id,
      type: 6
    }
    that.getData(data)
    if (options.type == 0) {
      that.setData({
        pageType: 0
      })
    }
  },

  getData(e) {
    console.log(e)
    api.request('/pms/upload/house/detail.do', 'POST', e, true).then(res => {
      console.log('getData:', res.data)
      // let art = res.data
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        let isArr = that.data.isArr
        let ieArr = that.data.ieArr
        let oeArr = that.data.oeArr
        let wsArr = that.data.wsArr
        let bdArr = that.data.bdArr
        isArr.map((item, index, arr) => {
          if (item == art.live_time_min) {
            that.setData({
              isIndex: index
            })
          }
        })
        ieArr.map((item, index, arr) => {
          if (item == art.live_time_max) {
            that.setData({
              ieIndex: index
            })
          }
        })
        oeArr.map((item, index, arr) => {
          if (item == art.checkout_time_max) {
            that.setData({
              oeIndex: index
            })
          }
        })
        wsArr.map((item, index, arr) => {
          if (item == art.cleaning_type) {
            that.setData({
              wsIndex: index
            })
          }
        })
        bdArr.map((item, index, arr) => {
          if (item == art.sheet_replace) {
            that.setData({
              bdIndex: index
            })
          }
        })

        that.setData({
          art: art,
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)
      // that.showToast(res.data.rlt_msg)
    }).finally(() => { })
  },
  formSubmit(e) {
    console.log(e)
    let target = e.detail.target.dataset.target
    let data = e.detail.value
    data.type = 6
    data.target = target
    data.upload_house_id = that.data.houseId
    console.log(data)
    if (target == 'next') {
      if (!that.WxValidate.checkForm(data)) {
        const error = that.WxValidate.errorList[0]
        console.log(error)
        that.showToast(error.msg)
        return false
      } else {
        that.updateHouse(data)
      }
      return
    }
    that.updateHouse(data)

  },
  updateHouse(e) {
    console.log(e)
    api.request('/pms/upload/house/update.do', 'POST', e, true).then(res => {
      console.log('updateHouse:', res.data)
      let art = res.data
      if (art.rlt_code == 'S_0000') {
        if (e.target == 'next') {
          wx.redirectTo({
            url: '../uploadStep7/uploadStep7?id=' + e.upload_house_id + '&type=' + that.data.pageType,
          })
          return
        }
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      } else {
        that.showToast(art.rlt_msg)
      }
    }).catch(res => {
      that.showToast(art.rlt_msg)
    }).finally(() => { })
  },



  pickChange(e) {
    console.log(e)
    let target = e.currentTarget.dataset.target
    let data = target + "Index"
    that.setData({
      [data]: e.detail.value
    })
  },
  dateChange(e) {
    console.log(e)
    let value = e.detail.value
    // that.setData({
    //   maxDate: e.detail.value
    // })
    if(value == 0){
      that.setData({
        'art.days_max': 0
      })
    } else {
      that.setData({
        'art.days_max': e.detail.value
      })
    }
    
  },

  ifshowArea(e) {
    console.log(e)
    let t_show = e.currentTarget.dataset.show == "yes" ? true : false;
    if (t_show) {//不显示textarea 
      that.setData({
        multiShow: t_show
      });
    } else {//显示textarea 
      that.setData({
        multiShow: t_show
      });
    }
  },
  textareaInput(e) {
    that.setData({
      'art.leave_message': e.detail.value
    })
  },
  bindMinus(e) {
    let target = e.currentTarget.dataset.target
    let num
    if (target == 'min') {
      num = that.data.art.days_min
    } else {
      num = that.data.art.days_max
    }
    num--;
    if (target == 'min') {
      that.setData({
        'art.days_min': num,
      })
    } else {
      that.setData({
        'art.days_max': num,
      })
    }
  },
  bindPlus(e) {
    console.log(e)
    let target = e.currentTarget.dataset.target
    let num
    if (target == 'min') {
      num = that.data.art.days_min
    } else {
      num = that.data.art.days_max
    }
    num++;
    if (target == 'min') {
      that.setData({
        'art.days_min': num,
      })
    } else {
      that.setData({
        'art.days_max': num,
      })
    }
  },
  onShow: function () {

  },
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      days_min: {
        required: true,
      },
      days_max: {
        required: true,
      },
      preset_time_now: {
        required: true,
      },
      live_time_min: {
        required: true,
      },
      live_time_max: {
        required: true,
      },
      checkout_time_max: {
        required: true,
      },
      cleaning_type: {
        required: true,
      },
      sheet_replace: {
        required: true,
      },
      reception_require: {
        required: true,
      },
    }
    const messages = {
      days_min: {
        required: '请选择最少预定天数',
      },
      days_max: {
        required: '请选择最多预定天数',
      },
      preset_time_now: {
        required: '请选择当天预定时间',
      },
      live_time_min: {
        required: '请选择最早入住时间',
      },
      live_time_max: {
        required: '请选择最晚入住时间',
      },
      checkout_time_max: {
        required: '请选择最晚退房时间',
      },
      cleaning_type: {
        required: '请选择卫生打扫',
      },
      sheet_replace: {
        required: '请选择被单更换',
      },
      reception_require: {
        required: '请选择接待要求',
      },
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },


})
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
import WxValidate from '../../utils/WxValidate'
var that
Page({
  data: {
    startDate: '',
    endDate: '',
    houseId: '',
    start: ''
  },
  onLoad (options) {
    console.log(options)
    that = this
    let curDate = options.curDate
    let endDate = util.formatDates(new Date(Date.parse(new Date(curDate)) + 24 *3600 * 1000))
    console.log(endDate)
    that.setData({
      startDate: curDate,
      endDate: endDate,
      houseId: options.id,
      start: endDate
    })
    that.initValidate()
  },
  formSubmit(e){
    console.log(e)
    let data = e.detail.value
    console.log(data)
    if (!that.WxValidate.checkForm(data)) {
      const error = that.WxValidate.errorList[0]
      console.log(error)
      that.showToast(error.msg)
      return false
    } else {
      let start = Date.parse(new Date(data.checkin_date))
      let end = Date.parse(new Date(data.checkout_date))
      if (end < start){
        that.showToast('离店时间不能小于入住时间，请重新选择')
      } else {
        that.addOrder(data)
      }
    }
  },
  addOrder(data) {
    api.request('/pms/order/add.do', 'POST', data, true).then(res => {
      console.log("addOrder", res.data)
      if (res.data.rlt_code == "S_0000") {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          mask: true,
          duration: 2000,
          success(res){
            let pages = getCurrentPages();    //获取当前页面信息栈
            let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈
            setTimeout(function () {
              prevPage.getHouse()
              wx.navigateBack()
            },2000)
          }
        })
        // that.showToast("读取中，请稍后刷新页面查看")
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      // wx.stopPullDownRefresh()
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
  startDateChange(e){
    console.log(e)
    let endDate = util.formatDates(new Date(Date.parse(new Date(e.detail.value)) + 24 * 3600 * 1000))
    console.log(endDate)
    that.setData({
      startDate: e.detail.value,
      start: endDate
    })
  },
  endDateChange(e) {
    console.log(e)
    that.setData({
      endDate: e.detail.value
    })
  },
  initValidate(){
    let rules = {
      checkin_date: {
        required: true,
      },
      checkout_date: {
        required: true,
      },
      guest_name: {
        required: true,
      },
      guest_mobile: {
        required: true,
        tel: true,
      }, 
    }
    let messages = {
      checkin_date: {
        required: '请输入入住时间',
      },
      checkout_date: {
        required: '请输入离店时间',
      },
      guest_name: {
        required: '请输入房客姓名',
      },
      guest_mobile: {
        required: '手机号不能为空',
        tel: '请输入正确的手机号',
      },
    }
    this.WxValidate = new WxValidate(rules, messages)
  }
})
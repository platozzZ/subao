const app = getApp()
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'
var that
Page({
  data: {
    region: ['','',''],
    houseId: '',
    pageType: null
  },
  onLoad(options) {
    app.mtj.trackEvent('wode_12')
    that = this
    console.log(options)
    that.initValidate()
    that.setData({
      houseId: options.id
    })
    let data = {
      upload_house_id: options.id,
      type: 2
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
        let region = that.data.region
        region[0] = art.province
        region[1] = art.city
        region[2] = art.area
        console.log(region)
        that.setData({
          art: art,
          region: region
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
    data.type = 2
    data.target = target
    data.upload_house_id = that.data.houseId
    console.log(data)
    if (target == 'next'){
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
  updateHouse(e){
    console.log(e)
    api.request('/pms/upload/house/update.do', 'POST', e, true).then(res => {
      console.log('updateHouse:', res.data)
      let art = res.data
      if (art.rlt_code == 'S_0000') {
        if(e.target == 'next'){
          wx.redirectTo({
            url: '../uploadStep3/uploadStep3?id=' + e.upload_house_id + '&type=' + that.data.pageType,
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
  pickChange(e){
    console.log(e)
    that.setData({
      region: e.detail.value
    })
  },
  onShow: function () {

  },
  onUnload: function () {

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
      province: {
        required: true,
      },
      city: {
        required: true,
      },
      area: {
        required: true,
      },
      address: {
        required: true,
      },
      district: {
        required: true,
      },
    }
    const messages = {
      province: {
        required: '请选择城市',
      },
      city: {
        required: '请选择城市',
      },
      area: {
        required: '请选择城市',
      },
      address: {
        required: '请输入具体地址',
      },
      district: {
        required: '请输入小区名称',
      },
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },

})
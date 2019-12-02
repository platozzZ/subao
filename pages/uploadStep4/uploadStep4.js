const app = getApp()
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'
var that
Page({
  data: {
    art: '',
    lightspotShow: true,
    traffic_locationShow: true,
    nearby_sthShow: true,
    other_sthShow: true,
    houseId: '',
    tsValue: '',
    jtValue: '',
    ssValue: '',
    qtValue: '',
    pageType: null
  },
  onLoad(options) {
    app.mtj.trackEvent('wode_14')
    that = this
    console.log(options)
    that.initValidate()
    that.setData({
      houseId: options.id
    })
    let data = {
      upload_house_id: options.id,
      type: 4
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
        that.setData({
          art: art
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
    console.log(that.data.art)
    let target = e.detail.target.dataset.target
    let data = e.detail.value
    data.type = 4
    data.target = target
    data.upload_house_id = that.data.houseId
    console.log(data)
    if (target == 'next') {
      if (!that.WxValidate.checkForm(data)) {
        const error = that.WxValidate.errorList[0]
        console.log(error)
        that.showToast(error.msg)
        return false
      } else if (data.traffic_location.length > 0 && data.traffic_location.length < 30) {
        that.showToast('交通位置不能少于30字')
        return
      } else if (data.nearby_sth.length > 0 && data.nearby_sth.length < 30) {
        that.showToast('周边设施不能少于30字')
        return
      } else if (data.other_sth.length > 0 && data.other_sth.length < 30) {
        that.showToast('交通位置不能少于30字')
        return
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
            url: '../uploadStep5/uploadStep5?id=' + e.upload_house_id + '&type=' + that.data.pageType,
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
      that.showToast(res.data.rlt_msg)
    }).finally(() => { })
  },


  ifshowArea(e) {
    console.log(e)
    let t_show = e.currentTarget.dataset.show == "yes" ? true : false;
    let target = e.currentTarget.dataset.target
    let data = target + 'Show'
    console.log(data)
    if (t_show) {//不显示textarea 
      that.setData({
        [data]: t_show
      });
    } else {//显示textarea 
      that.setData({
        [data]: t_show
      });
    }
  },
  textareaAInput(e){
    console.log(e)
    let target = e.currentTarget.dataset.target
    that.setData({
      ['art.' + target]: e.detail.value
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

    //      lightspot,    特色亮点
        //      traffic_location,  交通位置
        //      nearby_sth, 周边设施
        //      other_sth,  其他

      lightspot: {
        required: true,
        rangelength: [30, 1000]
      },
      
      traffic_location: {
        required: false,
        minlength: 30
      },
      nearby_sth: {
        required: false,
        minlength: 30
      },
      other_sth: {
        required: false,
        minlength: 30
      },
    }
    const messages = {
      lightspot: {
        required: '请输入特色亮点',
        rangelength: '特色亮点不能低于30个字'
      },
      traffic_location: {
        required: false,
        minlength: '交通位置不能低于30个字'
      },
      nearby_sth: {
        required: false,
        minlength: '周边设施不能低于30个字'
      },
      other_sth: {
        required: false,
        minlength: '其他房屋说明不能低于30个字'
      },
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },

})
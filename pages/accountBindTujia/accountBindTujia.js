const app = getApp()
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'
const code = require('../../utils/getCode.js')
let sourceObj = {
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
var that
Page({
  data: {
    account: '',
    loginType: null,
    source: '',
    delta: '',
    accountId: '',
    reg: false,
    second: 300,
    codeUrl: '',
    verifyValue: '',
    pwdValue: ''
  },
  onLoad(options) {
    that = this
    let title = sourceObj[options.source].source_text
    wx.setNavigationBarTitle({
      title: title + '账号绑定',
    })
    console.log(options)
    that.setData({
      source: options.source,
      loginType: options.type,
      accountId: options.id,
      account: options.account,
      delta: options.delta
    })
    // that.getData(options.id)
    that.initValidate(options.type)
  },
  formSubmit(e) {
    console.log(e)
    let data = e.detail.value
    console.log(data)
    if (!that.WxValidate.checkForm(data)) {
      const error = that.WxValidate.errorList[0]
      console.log(error)
      that.showToast(error.msg)
      return false
    } else {
      if(that.data.loginType == 0){
        that.getVerifyImage()
        return
      }
      that.tujiaLogin(data)
    }

  },
  verifyValue(e) {
    that.setData({     
      verifyValue: e.detail.value
    })
  },
  //获取图片验证码（途家）
  getVerifyImage(e) {
    that.setData({
      verifyValue: '',
      modalName: 'image'
    })
    // console.log(e)
    api.request('/pms/third/account/tujia/verify_image.do', 'POST', '', true).then(res => {
      console.log('getVerifyImage:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          codeUrl: "data:image/png;base64," + res.data.data
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      // wx.stopPullDownRefresh()
    })
  },
  msgCode(data) {
    console.log(data)
    api.request('/pms/third/account/tujia/login_code.do', 'POST', data, true).then(res => {
      console.log('msgCode:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let time = that.data.second//获取最初的秒数
        code.getCode(that, time);　　//调用倒计时函数
        that.setData({
          modalName: null
        })
      } else {
        wx.showToast({
          title: res.data.rlt_msg,
          icon: 'none',
          duration: 2000,
          success(res) {
            setTimeout(function () {
              that.getVerifyImage()
            }, 2000)
          }
        })
      }
    }).catch(res => {

    }).finally(() => {
    })
  },
  //途家账号登录
  tujiaLogin(data) {
    console.log(data)
    api.request('/pms/third/account/tujia/login.do', 'POST', data, true).then(res => {
      console.log('tujiaLogin:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.backList()
      } else {
        
        that.showToast(res.data.rlt_msg)
        if(that.data.loginType == 0){
          setTimeout(function () {
            that.getVerifyImage()
          },2000)
        }
      }
    }).catch(res => {

    }).finally(() => {
    })
  },
  codeSubmit(e) {
    console.log(e)
    let value = e.detail.value
    if (!value.verify_code || !value.account_id) {
      that.showToast('请输入验证码')
      return
    }
    if (that.data.loginType == 0) {
      that.tujiaLogin(value)
      return
    }
    that.msgCode(value)
  },
  pwdValue(e){
    that.setData({
      pwdValue: e.detail.value
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
  showModal(e) {
    // if (e == 'image' || e.currentTarget.dataset.target == 'image') {
      that.getVerifyImage()
      that.setData({
        modalName: 'image'
      })
    //   return
    // }
    // that.setData({
    //   modalName: 'msg'
    // })
  },
  hideModal(e) {
    that.setData({
      modalName: null,
      verifyValue: ''
    })
  },
  backList(e) {
    wx.showToast({
      title: '绑定成功',
      icon: 'success',
      mask: true,
      duration: 2000,
      success(res) {
        console.log(that.data.delta)
        let delta = that.data.delta
        setTimeout(function () {
          if (delta == 2) {
            wx.navigateBack({
              delta: 2
            })
          } else {
            wx.navigateBack()
          }
        }, 2000)
      }
    })
  },
  initValidate(e) {
    // 验证字段的规则
    let rules, messages
    if (e == 0) {
      rules = {
        password: {
          required: true,
          rangelength: [6, 16]
        },
      }
      messages = {
        password: {
          required: '密码不能为空',
          rangelength: '请输入6~16位密码'
        }
      }
    } else {
      rules = {
        code: {
          required: true,
        },
        verify_code: {
          required: true,
        },
      }
      messages = {
        code: {
          required: '请输入验证码',
        },
        verify_code: {
          required: '请先获取短信验证码',
        },
      }
    }
    console.log(rules, messages)
    // 创建实例对象
    that.WxValidate = new WxValidate(rules, messages)

  },

  getData(e, noLoading) {
    let data = {
      account_id: e
    }
    console.log(data)
    api.request('/pms/third/account/detail.do', 'POST', data, true, noLoading).then(res => {
      console.log('getData:', res.data)
      if (res.data.rlt_code == "S_0000") {
        let art = res.data.data
        that.setData({
          account: art.account,
        })
      }
    }).catch(res => {

    }).finally(() => { })
  },
})
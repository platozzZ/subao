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
    btnText: '登录并绑定',
    btnDisabled: false,
    setInterval: true,
    codePhone: '',
    modalName: null,
    sourceTitle: ''
  },
  onLoad(options) {
    that = this
    let title = sourceObj[options.source].source_text
    console.log(title)
    wx.setNavigationBarTitle({
      title: title + '账号绑定',
    })
    console.log(options)
    that.setData({
      source: options.source,
      loginType: options.type,
      accountId: options.id,
      delta: options.delta,
      sourceTitle: title
    })
    that.getData(options.id)
    that.initValidate()
  },

  getData(e, noLoading,loginType) {
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
        if (art.login_status == '00') {
          that.backList()
          return
        }
        if (art.login_status == '02'){
          that.setData({
            btnText: '登录中...',
            btnDisabled: true,
            setInterval: true
          })
          if (that.data.setInterval){
            setTimeout(function () {
              that.getData(that.data.accountId, true)
            }, 10000)
          }
          return
        }
        if (art.login_status == '03'){
          that.setData({
            btnText: '登录中...',
            btnDisabled: false,
            setInterval: false,
            modalName: 'code',
            codePhone: ''
          })
          return
        }
        if (art.login_status == '01' || art.login_status == '04') {
          console.log(noLoading)
          if (noLoading) {
            that.showToast('登录失败,请重试')
          }
        }
        that.setData({
          btnText: '登录并绑定',
          btnDisabled: false,
          setInterval: false
        })
        
      }
    }).catch(res => {

    }).finally(() => { })
  },
  formSubmit(e) {
    console.log(e)
    // if (that.data.loginType == 1 && !that.data.getCode && that.data.loginStatus != '03'){
    //   that.showToast("请先获取验证码")
    //   return
    // }
    let data = e.detail.value
    console.log(data)
    if (!that.WxValidate.checkForm(data)) {
      const error = that.WxValidate.errorList[0]
      console.log(error)
      that.showToast(error.msg)
      return false
    } else {
      // if(that.data.loginType == 1){
      //   that.codeLogin(data)
      // } else {
        that.accountLogin(data)
      // }
    }

  },
  hideModal(){
    that.setData({
      modalName: null
    })
  },
  //账号登录
  accountLogin(data) {
    let datas
    if (!data.account_id){
      datas = {
        account_id: that.data.accountId,
        login_type: that.data.loginType
      }
    } else {
      datas = data
    }
    console.log(data)
    api.request('/pms/third/account/login_with_type.do', 'POST', datas, true).then(res => {
      console.log('accountLogin:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let time = that.data.second//获取最初的秒数
        code.getCode(that, time);　　//调用倒计时函数
        that.setData({
          getCode: true
        })
        that.getData(that.data.accountId,true)
        // that.backList()
        // wx.navigateBack({
        //   delta: that.data.delta
        // })
      } else {
        that.showToast(res.data.rlt_msg)

      }
    }).catch(res => {

    }).finally(() => {
    })
  },
  //验证码账号登录
  codeLogin(e) {
    let data = e.detail.value
    console.log(data)
    if (!data.code){
      that.showToast("请输入短信验证码")
      return
    }
    api.request('/pms/third/account/login_sms_code.do', 'POST', data, true).then(res => {
      console.log('codeLogin:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          modalName: null
        })
        that.getData(that.data.accountId, true)
        // that.backList()
        // wx.navigateBack({
        //   delta: that.data.delta
        // })
      } else {
        that.showToast(res.data.rlt_msg)

      }
    }).catch(res => {

    }).finally(() => {
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
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },

  initValidate(e) {
    // 验证字段的规则
    // let rules, messages
    // if (e == 0) {
    let rules = {
        password: {
          required: true,
          rangelength: [6, 16]
        },
      }
    let messages = {
        password: {
          required: '密码不能为空',
          rangelength: '请输入6~16位密码'
        }
      }
    // } else {
    //   rules = {
    //     code: {
    //       required: true,
    //     },
    //     // verify_code: {
    //     //   required: true,
    //     // },
    //   }
    //   messages = {
    //     code: {
    //       required: '请输入验证码',
    //     },
    //     // verify_code: {
    //     //   required: '请先获取短信验证码',
    //     // },
    //   }
    // }
    console.log(rules, messages)
    // 创建实例对象
    that.WxValidate = new WxValidate(rules, messages)

  },
  onUnload(){
    that.setData({
      setInterval: false
    })
  }
})
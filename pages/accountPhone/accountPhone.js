const app = getApp()
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'
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
    showActionSheet: false,
    source: '',
    accountId: ''
  },
  onLoad(options) {
    that = this
    console.log(options)
    that.setData({
      source: options.source
    })
    let title = sourceObj[options.source].source_text
    wx.setNavigationBarTitle({
      title: title + '账号绑定',
    })
    that.initValidate()
  },
  formSubmit(e) {
    console.log(e)
    let data = e.detail.value
    // "account": "17516267558",
    // "source": "06",
    // "last_login_type": "", //0账号密码登录 1验证码登录 2稍后登录存储url
    console.log(data)
    if (!that.WxValidate.checkForm(data)) {
      const error = that.WxValidate.errorList[0]
      console.log(error)
      that.showToast(error.msg)
      return false
    } else {
      that.showActionSheet(data)
    }

  },
  addAccount(e){
    let data = e
    api.request('/pms/third/account/add_account.do', 'POST', data, true).then(res => {
      console.log('addAccount:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        console.log(data)

        if (that.data.source == '01') {
          if (data.last_login_type == 2) {
            wx.navigateTo({
              url: '../accountPaste/accountPaste?id=' + res.data.data.account_id + '&source=' + that.data.source + '&delta=2'
            })
            return
          } else {
            wx.navigateTo({
              url: '../accountBindTujia/accountBindTujia?type=' + data.last_login_type + '&account=' + data.account + '&id=' + res.data.data.account_id + '&source=' + that.data.source + '&delta=2'
            })
            return
          }
        } else {
          if (data.last_login_type == 2) {
            wx.navigateTo({
              url: '../accountPaste/accountPaste?id=' + res.data.data.account_id + '&source=' + that.data.source + '&delta=2'
            })
            return
          } else if (data.last_login_type == 1) {
            wx.navigateTo({
              url: '../accountBind1/accountBind1?type=' + data.last_login_type + '&id=' + res.data.data.account_id + '&source=' + that.data.source + '&delta=2'
            })
            // wx.navigateTo({
            //   url: '../accountBind1/accountBind1?type=' + type + '&id=' + e.currentTarget.dataset.id + '&source=' + e.currentTarget.dataset.source + '&delta=1'
            // })
            return
          } else {
            wx.navigateTo({
              url: '../accountBind/accountBind?type=' + data.last_login_type + '&id=' + res.data.data.account_id + '&source=' + that.data.source + '&delta=2'
            })
            // wx.navigateTo({
            //   url: '../accountBind/accountBind?type=' + type + '&id=' + e.currentTarget.dataset.id + '&source=' + e.currentTarget.dataset.source + '&delta=1'
            // })
            return
          }
        }


        // if (data.last_login_type == 2){
        //   wx.navigateTo({
        //     url: '../accountPaste/accountPaste?id=' + res.data.data.account_id + '&source=' + that.data.source + '&delta=2'
        //   })
        //   return
        // }
        // if(that.data.source == '01'){
        //   wx.navigateTo({
        //     url: '../accountBindTujia/accountBindTujia?type=' + data.last_login_type + '&account=' + data.account + '&id=' + res.data.data.account_id + '&source=' + that.data.source + '&delta=2'
        //   })
        //   return
        // }
        // wx.navigateTo({
        //   url: '../accountBind/accountBind?type=' + data.last_login_type + '&id=' + res.data.data.account_id + '&source=' + that.data.source + '&delta=2'
        // })
        // that.setData({
        //   // showActionSheet: true,
        //   accountId: res.data.data.account_id
        // })
        // that.showActionSheet()
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => { })
  },
  showActionSheet(e) {
    console.log(e)
    let data = e
    let itemList = [
      '验证码登录方式绑定',
      '密码登录方式绑定',
      '暂不绑定，仅读取房源信息'
    ]
    wx.showActionSheet({
      itemList: itemList,
      success(res) {
        let index = res.tapIndex
        console.log(res.tapIndex)
        let type
        if(index == 0){
          type = 1
        } else if (index == 1){
          type = 0
        } else {
          type = 2
        }
        data.last_login_type = type
        console.log(data)
        that.addAccount(data)

      },
      fail(res) {
        console.log(res.errMsg)
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
  initValidate() {
    // 验证字段的规则
    const rules = {
      account: {
        required: true,
        tel: true,
      },
    }
    const messages = {
      account: {
        required: '手机号不能为空',
        tel: '请输入正确的手机号',
      },
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
})
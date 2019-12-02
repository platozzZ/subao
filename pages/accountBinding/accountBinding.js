const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
let sourceObj = {
  ['01']: {
    source_text: '途家',
  },
  ['02']: {
    source_text: '爱彼迎'
  },
  ['04']: {
    source_text: '小猪'
  },
  ['05']: {
    source_text: '榛果'
  },
  ['06']: {
    source_text: '木鸟'
  }
}
Page({
  data: {
    source: '',
    title: '',
    account: '', //手机号
    accountId: '',
    loginTime: '',

  },
  onLoad(options) {
    that = this
    that.setData({
      source: options.source,
      accountId: options.id
    })
    let title = sourceObj[options.source].source_text
    wx.setNavigationBarTitle({
      title: title + '账号绑定',
    })
    that.getData(options.id)
  },


  //重新绑定
  reConfirm(e) {
    console.log(e)

    wx.showActionSheet({
      itemList: ['验证码登录方式绑定', '密码登录方式绑定'],
      success(res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          that.selectLogin(that.data.accountId,1)
        } else if (res.tapIndex == 1) {
          that.selectLogin(that.data.accountId, 0)
        }

      },
      fail(res) {
        console.log(res.errMsg)
      }
    })

  },
  //修改登录类型
  selectLogin(id,loginType){
    let data = {
      account_id: id,
      last_login_type: loginType
    }
    console.log(data)
    api.request('/pms/third/account/update_login_type.do', 'POST', data, true, false).then(res => {
      console.log('修改登录类型：', res.data)

      if (res.data.rlt_code == 'S_0000') {
        //0 账号密码登录 1验证码登录
        if (that.data.source == '01') { 
          wx.navigateTo({
            url: '../accountBindTujia/accountBindTujia?type=' + loginType + '&id=' + id + '&account=' + that.data.account + '&source=' + that.data.source + '&delta=2'
          })
          return
        } else {
          if (loginType == 1) {
            wx.navigateTo({
              url: '../accountBind1/accountBind1?type=' + loginType + '&id=' + id + '&account=' + that.data.account + '&source=' + that.data.source + '&delta=2'
            })
            return
          } else {
            wx.navigateTo({
              url: '../accountBind/accountBind?type=' + loginType + '&id=' + id + '&account=' + that.data.account + '&source=' + that.data.source + '&delta=2'
            })
            return
          }
        }
        // if (that.data.source == '01') {
        //   wx.navigateTo({
        //     url: '../accountBindTujia/accountBindTujia?type=' + loginType + '&id=' + id + '&source=' + that.data.source + '&delta=2'
        //   })
        //   return
        // }
        // wx.navigateTo({
        //   url: '../accountBind/accountBind?type=' + loginType + '&id=' + id + '&source=' + that.data.source + '&delta=2'
        // })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => { })

  },
  //获取平台账号详情
  getData(e, noLoading) {
    let data = {
      account_id: e
    }
    console.log(data)
    api.request('/pms/third/account/detail.do', 'POST', data, true, noLoading).then(res => {

      if (res.data.rlt_code == "S_0000") {
        console.log('getData:', res.data)
        let detail = res.data.data
        console.log(util.formatAllTime(new Date(detail.last_login_time)))
        let title = sourceObj[detail.source].source_text
        that.setData({
          account: detail.account,
          title: title,
          loginTime: util.formatAllTime(new Date(detail.last_login_time))
        })

        console.log(that.data.account)
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {})
  },

  //toast框
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  }

})
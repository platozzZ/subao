const app = getApp()
const api = require('../../utils/request.js')
var that
Page({
  data: {
    kf_mobile: '',
    kf_wechat: '',
    showModal: false,
    codeModal: false,
    isLogin: null,
    user_mobile: '',
    tools: [{
        title: '上传房源',
        disabled: false,
        icon: '/images/index-pt.png',
      },
      {
        title: '房源测评',
        disabled: false,
        icon: '/images/index-pg.png',
      },
      {
        title: '周边房源价格',
        disabled: false,
        icon: '/images/index-jg.png',
      },
      {
        title: '民宿装修',
        disabled: true,
        icon: '/images/zhuangxiugray.png',
      },
      {
        title: '经营统计',
        disabled: true,
        icon: '/images/tongjigray.png',
      },
    ],
    online: false,
    onlineFlag: false,
    noSet: false
  },
  onLoad: function(options) {
    that = this

    if (!app.globalData.isLogin) {
      return
    }

    // that.getData()
  },
  onShow: function() {
    console.log('onshow')
    console.log(app.globalData.isLogin)
    console.log(app.globalData.user_mobile)
    that.setData({
      isLogin: app.globalData.isLogin,
      user_mobile: app.globalData.user_mobile
    })
    if (!app.globalData.isLogin) {
      return
    }
    that.getOnline()
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {

        } else {//用户已经授权过了
          that.setData({
            noSet: false,

          })
        }
      }
    })

  },
  //兼容未授权相册
  getSetting() {
     wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {//这里是用户同意授权后的回调
            
              that.setData({
                noSet: false,
              })
              that.save()
            },
            fail() {//这里是用户拒绝授权后的回调
               that.setData({
                noSet: true,
              })
            }
          })
        } else { //用户已经授权过了
        
          that.save()
        }
      }
    })
  },
  //点击工具
  toolTap(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index;
    if (index == 0) {
      app.mtj.trackEvent('shouye_2');
      wx.navigateTo({
        url: '../updateSelect/updateSelect?status=0',
      })
    } else if (index == 1) {
      wx.switchTab({
        url: '../house/house',
      })
    } else if (index == 2) {
      wx.switchTab({
        url: '../house/house',
      })
    } else {
      that.showToast('此工具暂未开放，程序员小哥哥努力开发中')
    }

  },
  //点击微信公众号
  wxCodeShow() {
    wx.setClipboardData({
      data: 'magisubao',
      success(res) {
        wx.showToast({
          title: '公众号已复制',
          success: function() {
            that.setData({
              codeModal: true
            })
          }
        })

      }
    })


  },
  //保存相册
  save() {
    wx.downloadFile({
      url: 'https://magicdn.oss-cn-beijing.aliyuncs.com/pms/miniapp/static/wxCode.png',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1500
            })
            that.codeHide()
          },
          fail: function (err) {
            that.codeHide()
            that.setData({
              noSet: true,
            })
          }
        })
      }
    })
  },
  codeHide() {
    that.setData({
      codeModal: false
    })
  },
  //检测平台是否离线
  getOnline(e) {

    api.request('/pms/system/user/account_house_data.do', 'POST', '', true).then(res => {
      console.log("平台是否离线：", res.data)
      let art = res.data.data
      if (res.data.rlt_code == 'S_0000') {
        if (art.account_num == 0) {
          that.setData({
            online: true
          })
        } else {
          if (art.account_num != art.account_online) {
            that.setData({
              onlineFlag: true
            })
          }
        }


      } else {

        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },


  handleContact(e) {
    console.log(e.path)
    console.log(e.query)
  },
  showModal(e) {
    that.setData({
      showModal: true
    })
  },
  hideModal(e) {
    that.setData({
      showModal: false
    })
  },
  layout(e) {
    let data = {
      source: e.currentTarget.dataset.source
    }
    console.log(data)
    // let token = wx.getStorageSync('token')
    api.request('/dms/system/miniapp/logout.do', 'POST', data, true).then(res => {
      console.log('layout:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        wx.showToast({
          title: '退出成功',
          success(res) {
            app.globalData.isLogin = false
            setTimeout(function() {
              wx.reLaunch({
                url: '../newIndex/newIndex',
              })
            }, 1000)
          }
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {})
  },
  contactUs(e) {
    let that = this
    // let phone = e.currentTarget.dataset.phone
    wx.showModal({
      title: '联系客服',
      content: '是否确认联系客服？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.makePhone(e)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  makePhone(e) {
    wx.makePhoneCall({
      phoneNumber: e,
      success: function(res) {
        console.log(res)
      }
    })
  },
  getData(e) {
    let that = this
    api.request('/fuwu/service/kf_contact', 'POST').then(res => {
      console.log('kf_contact:', res.data);
      // wx.hideLoading()
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          kf_mobile: res.data.data.kf_mobile,
          kf_wechat: res.data.data.kf_wechat
        })
      }
    }).catch(res => {
      // wx.hideLoading()
      console.log('kf_contact-fail:', res);
    }).finally(() => {
      // console.log('getAddress-finally:', "结束");
    })
  },
  copyWechartCode(e) {
    wx.setClipboardData({
      data: this.data.kf_wechat,
      success(res) {
        wx.showToast({
          title: '微信号已复制',
        })
        console.log(res)
      }
    })
  },
  openActionSheet: function() {
    let that = this
    if (!that.data.kf_mobile || !that.data.kf_wechat) {
      that.getData()
    }
    wx.showActionSheet({
      itemList: ['拨打客服电话', '添加客服微信'],
      success: function(res) {
        if (res.tapIndex == 0) {
          let phone = that.data.kf_mobile
          that.contactUs(phone)
        } else if (res.tapIndex == 1) {
          that.copyWechartCode()
        }
      }
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
})
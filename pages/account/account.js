const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
import WxValidate from '../../utils/WxValidate'
var that
Page({
  data: {
    channelList: [],
    emptyList: false,
    showNext: false,
    showList: false,
    modalName: null,
    nextStatus: null,
    accountId: '',
    account: '',
    accountCode: '',
    accountNumber: '',
    accountPwd: '',
    verifyValue: '',
    changePwdValue: '',
    airbnbCode: '',
    airbnbAccount: '',
    linkType: 0,
    accountArr: ['途家', '爱彼迎', '小猪', '榛果'],
    codeUrl: '',
    showBtn: false,
    isshowModal: false,
    codeModal: false,
    xiaozhuModal: false,
    editModal: false,
    radioModal: false,
    radioValue: '',
    airbnbModal: false,
    listTouchStart: 0,
    listTouchDirection: null,
    lastX: 0,
    lastY: 0,
    flag: 0,
    text: '没有滑动',
    cancelModal: false,
    accountA: '',
    accountP: '',
  },
  onLoad: function (options) {
    app.mtj.trackEvent('wode_1')
    console.log(options)
    that = this
    that.initValidate()
    if(options.status == 0){
      that.setData({
        showBtn: true
      })
    }
    // that.getList()
  },
  // 添加账号
  addActionSheet(e) {
    that.setData({
      modalName: null
    })
    wx.showActionSheet({
      itemList: that.data.accountArr,
      success(res) {
        let sourceObj = {
          ['0']: {
            source: '01',
          }, ['1']: {
            source: '02'
          }, ['2']: {
            source: '04'
          }, ['3']: {
            source: '05'
          }
        }
        let index = res.tapIndex
        let source = sourceObj[res.tapIndex].source
        console.log(res.tapIndex)
        wx.navigateTo({
          url: '../accountPhone/accountPhone?source=' + source
        })
        if (index == 0) {
          app.mtj.trackEvent('wode_3')
        } else if (index == 1) {
          app.mtj.trackEvent('wode_4')
        } else if (index == 2) {
          app.mtj.trackEvent('wode_5')
        } else if (index == 3) {
          app.mtj.trackEvent('wode_6')
        } else if (index == 4) {
          app.mtj.trackEvent('wode_7')
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  bindActionSheet(e){
    console.log(e)
    console.log(!!e.currentTarget.dataset.houseurl)
    let itemList
    if (!!e.currentTarget.dataset.houseurl){
      itemList = [
        '验证码登录方式绑定',
        '密码登录方式绑定',
      ]
    } else {
      itemList = [
        '验证码登录方式绑定',
        '密码登录方式绑定',
        '暂不绑定，仅读取房源信息'
      ]
    }
    wx.showActionSheet({
      itemList: itemList,
      success(res) {
        let index = res.tapIndex
        console.log(res.tapIndex)
        let type
        if (index == 0) {
          type = 1
        } else if (index == 1) {
          type = 0
        } else {
          type = 2
        } 
        if (e.currentTarget.dataset.source == '01') {
          if (type == 2) {
            wx.navigateTo({
              url: '../accountPaste/accountPaste?id=' + e.currentTarget.dataset.id + '&source=' + e.currentTarget.dataset.source + '&delta=1'
            })
            return
          } else {
            wx.navigateTo({
              url: '../accountBindTujia/accountBindTujia?type=' + type + '&id=' + e.currentTarget.dataset.id + '&source=' + e.currentTarget.dataset.source + '&account=' + e.currentTarget.dataset.account + '&delta=1'
            })
            return
          }

        } else {
          if (type == 2) {
            wx.navigateTo({
              url: '../accountPaste/accountPaste?id=' + e.currentTarget.dataset.id + '&source=' + e.currentTarget.dataset.source + '&delta=1'
            })
            return
          } else if (type == 1) {
            wx.navigateTo({
              url: '../accountBind1/accountBind1?type=' + type + '&id=' + e.currentTarget.dataset.id + '&source=' + e.currentTarget.dataset.source + '&delta=1'
            })
            return
          } else {
            wx.navigateTo({
              url: '../accountBind/accountBind?type=' + type + '&id=' + e.currentTarget.dataset.id + '&source=' + e.currentTarget.dataset.source + '&delta=1'
            })
            return
          }
        }
        // if (e.currentTarget.dataset.source == '01') {
        //   wx.navigateTo({
        //     url: '../accountBindTujia/accountBindTujia?type=' + type + '&id=' + e.currentTarget.dataset.id + '&source=' + e.currentTarget.dataset.source + '&account=' + e.currentTarget.dataset.account + '&delta=1'
        //   })
        //   return
        // }
       
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  //获取渠道列表
  getList(e) {
    that.setData({
      modalName: null
    })
    api.request('/pms/third/account/list.do', 'POST', '', true).then(res => {
      console.log('getList:',res.data)
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        if (art.length > 0) {
          let loginObj = {
            ['00']: {
              login_text: '在线',//已登录
            }, ['01']: {
              login_text: '离线'//已掉线
            }, ['02']: {
              login_text: '登录中'
            }, ['03']: {
              login_text: '登录中'//输入验证码
            }, ['04']: {
              login_text: '离线'//登录失败
            }, ['05']: {
              login_text: '登录中'//小猪 榛果 爱彼迎
            }
          }
          let sourceObj = {
            ['01']: {
              source_text: '途家',
            }, ['02']: {
              source_text: '爱彼迎'
            }, ['04']: {
              source_text: '小猪'
            }, ['05']: {
              source_text: '榛果'
            }, ['06']: {
              source_text: '木鸟'
            }
          }
          art.map((item, index, arr) => {
            let actions = sourceObj[item.source]
            let login = loginObj[item.login_status]
            item.source_text = actions.source_text
            item.login_text = login.login_text
            item.lastLoginTime = util.formatAllTime(new Date(item.last_login_time))
          })
          console.log(art)
          that.setData({
            channelList: art,
            showList: true,
            emptyList: false
          })
          // for (let i = 0; i < art.length; i++) {
          //   if (art[i].login_status == '03') {
          //     that.setData({
          //       airbnbAccount: art[i].account,
          //       accountId: art[i].id,
          //       modalName: 'airbnbModal',
          //     })
          //     console.log(i)
          //     break
          //   }
          // }
          console.log(that.data.showBtn)
          if (that.data.showBtn) {
            let loginLength = art.length
            let newlength = []
            for (let i = 0; i < art.length; i++) {
              if (art[i].login_status == '00') {
                newlength.push(i)
              }
            }
            console.log(loginLength)
            console.log(newlength.length)
            if (newlength.length > 0) {
              that.setData({
                showNext: true
              })
              if (loginLength > newlength.length) {
                that.setData({
                  isshowModal: true
                })
              } else {
                that.setData({
                  isshowModal: false
                })
              }
            } else {
              that.setData({
                showNext: false
              })
            }
          }
        } else {
          that.setData({
            showList: false,
            emptyList: true
          })
        }
      } else {
        that.setData({
          emptyList: true
        })
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      that.setData({
        emptyList: true
      })
      that.showToast(res.data.rlt_msg)
    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  toAccountdetail(e){
    console.log(e)
    let id = e.currentTarget.dataset.id
    let type = e.currentTarget.dataset.type
    let source = e.currentTarget.dataset.source
    let status = e.currentTarget.dataset.status
    if (type == 2) {
      wx.navigateTo({
        url: '../accountPaste/accountPaste?id=' + id + '&source=' + source + '&delta=1'
      })
      return
    }
    if (status == '00'){
      wx.navigateTo({
        url: '../accountBinding/accountBinding?id=' + id + '&source=' + source
      })
      return
    }
    if (source == '01') {
      wx.navigateTo({
        url: '../accountBindTujia/accountBindTujia?type=' + type + '&id=' + id + '&source=' + source + '&account=' + e.currentTarget.dataset.account + '&delta=1'
      })
      return
    }
    wx.navigateTo({
      url: '../accountBind/accountBind?type=' + type + '&id=' + id + '&source=' + source + '&delta=1' + '&status=' + status
    })
  },
  //toast框
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
  showModal(e) {
    console.log(e)
    console.log(!isNaN(e))
    if (!isNaN(e)) {
      let account
      let accountCode
      if (e == 0) {
        account = '途家',
        accountCode = '01'
      } else if (e == 1) {
        account = '爱彼迎',
        accountCode = '02'
      } else if (e == 2) {
        account = '小猪',
        accountCode = '04'
      } else if (e == 3) {
        account = '榛果',
        accountCode = '05'
      } else if (e == 4) {
        account = '木鸟',
        accountCode = '06'
      }
      that.setData({
        modalName: 'addAccount',
        account: account,
        accountCode: accountCode
      })
      return
    }
    console.log(e)
    let modalName = e.currentTarget.dataset.target
    console.log(modalName)
    // that.data.accountId = e.currentTarget.dataset.id
    that.setData({
      modalName: modalName,
      accountId: e.currentTarget.dataset.id,
    })
    if (modalName == 'tujia') {
      that.getVerifyImage()
    } else if (modalName == 'airbnb') {
      that.airBnbActionSheet(e.currentTarget.dataset.id)
    } else if (modalName == 'xiaozhu') {
      let data = {
        account_id: e.currentTarget.dataset.id,
        has_code: 0
      }
      that.xiaozhuLogin(data)
    } else if (modalName == 'zhenguo') {
      let data = {
        account_id: e.currentTarget.dataset.id,
        login_type: 0
      }
      that.zhenguoLogin(data)
    } else if (modalName == 'muniao') {
      that.getMuniaoVerifyImage()
    } else if (modalName == 'next') {
      that.setData({
        nextStatus: e.currentTarget.dataset.status
      })
    }
  },
  hideModal(e) {
    console.log(e)
    that.setData({
      modalName: null,
      codeUrl: ''
    })
    that.stringTarget(e)
  },
  stringTarget(e) {
    console.log(e)
    console.log(typeof (e) == 'string')
    if (typeof (e) == 'string') {
      if (e == 'addAccount') {
        that.setData({
          account: '',
          accountCode: '',
          accountNumber: '',
          accountPwd: ''
        })
      } else if (e == 'tujia' || e == 'xiaozhu' || e == 'muniao') {
        that.setData({
          verifyValue: ''
        })
      } else if (e == 'edit') {
        that.setData({
          changePwdValue: ''
        })
      } else if (e == 'airbnb') {
        that.setData({
          airbnbCode: ''
        })
      }
      return
    }
    console.log(e)
    if (e.currentTarget.dataset.target == 'addAccount') {
      that.setData({
        account: '',
        accountCode: '',
        accountNumber: '',
        accountPwd: ''
      })
    } else if (e.currentTarget.dataset.target == 'tujia' || e.currentTarget.dataset.target == 'xiaozhu') {
      that.setData({
        verifyValue: ''
      })
    } else if (e.currentTarget.dataset.target == 'edit') {
      that.setData({
        changePwdValue: ''
      })
    } else if (e.currentTarget.dataset.target == 'airbnb') {
      that.setData({
        airbnbCode: ''
      })
    }
  },
  toMain() {

    app.mtj.trackEvent('wode_2')
    wx.reLaunch({
      url: '../main/main',
    })
  },
  toHouse() {
    app.mtj.trackEvent('wode_8')
    wx.reLaunch({
      url: '../house/house?num=0',
    })
  },

  onPullDownRefresh: function () {
    that.getList()
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      account: {
        required: true,
      },
      password: {
        required: true,
      },
    }
    const messages = {
      account: {
        required: '账号不能为空',
      },
      password: {
        required: '密码不能为空',
      },

    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)

  },
  onShow(){
    that.getList()
  },


  deleteAccount(e) { // 删除账号
    let data = e
    // {"account_id":"137517862272204806"}
    api.request('/pms/third/account/delete.do', 'POST', data, true).then(res => {
      console.log('deleteAccount:', res.data)
      if (res.data.rlt_code == 'S_0000') {

      } else {

        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  logoutAccount(e) { // 账号下线
    let data = e
    // {"account_id":"137517862272204806"}
    api.request('/pms/third/account/logout.do', 'POST', data, true).then(res => {
      console.log('logoutAccount:', res.data)
      if (res.data.rlt_code == 'S_0000') {

      } else {

        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  listTouchStart(e) {// ListTouch触摸开始
    console.log(e)
    that.data.lastX = e.touches[0].pageX
    that.data.lastY = e.touches[0].pageY
    // that.setData({
    //   listTouchStart: e.touches[0].pageX
    // })
    // this.listTouchStart = e.touches[0].pageX
  },
  listTouchMove(e) { // ListTouch计算方向
    // console.log(e)
    if (that.data.flag != 0) {
      return
    }
    let currentX = e.touches[0].pageX
    let currentY = e.touches[0].pageY
    let tx = currentX - that.data.lastX
    let ty = currentY - that.data.lastY
    let text = ''
    console.log(Math.abs(tx) > Math.abs(ty))
    // 左右方向滑动
    if (Math.abs(tx) > Math.abs(ty)) {
      if (tx < 0) {
        text = '向左滑动'
        that.data.flag = 1
      } else if (tx > 0) {
        text = '向右滑动'
        that.data.flag = 2
      }
    } else { //上下方向滑动
      if (ty < 0) {
        text = '向上滑动'
        that.data.flag = 3
      } else if (ty > 0) {
        text = '向下滑动'
        that.data.flag = 4
      }
    }

    that.data.lastX = currentX
    that.data.lastY = currentY
    that.data.text = text
    // that.setData({
    //   listTouchDirection: e.touches[0].pageX - that.data.listTouchStart > 30 ? 'right' : e.touches[0].pageX - that.data.listTouchStart < -30 ? 'left' : null
    // })
    // this.listTouchDirection = e.touches[0].pageX - this.listTouchStart > 0 ? 'right' : 'left'
  },
  listTouchEnd(e) {// ListTouch计算滚动
    console.log(e)
    if (that.data.flag == 1) {
      that.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else if (that.data.flag == 2) {
      that.setData({
        modalName: null
      })
    }
    that.data.flag = 0
    // if (that.data.listTouchDirection == 'left'){
    //   that.setData({
    //     modalName: e.currentTarget.dataset.target
    //   })
    // } else {
    //   that.setData({
    //     modalName: null
    //   })
    // }
    // that.setData({
    //   listTouchDirection: null
    // })
    // if (this.listTouchDirection == 'left') {
    //   this.modalName = e.currentTarget.dataset.target
    // } else {
    //   this.modalName = null
    // }
    // this.listTouchDirection = null
  },
})
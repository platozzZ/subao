const app = getApp()
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'

var that
Page({
  data: {
    houseId: '',
    art: '',
    houseArt: '',
    accountList: [],
    checkList: [
      { source: "01", name: '途家', checked: false, auth_status: '0', status: '0', account: '', account_id: ''},
      { source: "02", name: '爱彼迎', checked: false, auth_status: '0', status: '0', account: '', account_id: ''},
      { source: "05", name: '榛果', checked: false, auth_status: '0', status: '0', account: '', account_id: ''},
      { source: "04", name: '小猪', checked: false, auth_status: '0', status: '0', account: '', account_id: ''},
    ],
    sources: [],
    source: '',
    formData: '',
    sourceObj: {
      ['01']: {
        source_text: '途家',
      }, ['02']: {
        source_text: '爱彼迎'
      }, ['04']: {
        source_text: '小猪'
      }, ['05']: {
        source_text: '榛果'
      }
    },
    loginObj: {
      ['00']: {
        auth_status: '2',
      }, ['01']: {
        auth_status: '3'
      }, ['02']: {
        auth_status: '1'
      }, ['03']: {
        auth_status: '1'
      }, ['04']: {
        auth_status: '3'
      }, ['05']: {
        auth_status: '1'
      }
    },
    accountIndex: null,
    source01Index: null,
    source02Index: null,
    source04Index: null,
    source05Index: null,
    // source06Index: null,
    pageType: null,
    modalName: null,
    isRefresh: false,
    selectIndex: 0,
    curSource: 0,
    authStatus: true,
  },
  onLoad: function (options) {
    app.mtj.trackEvent('wode_11')
    that = this
    let item = decodeURIComponent(options.item);
    let itemData = JSON.parse(item);
    let checkList = that.data.checkList
    let len = 0
    console.log(options)
    console.log(itemData)
    itemData.sources.map((itemc, indexc) => {
      checkList.map((item, index, arr) => {
        if (item.source == itemc){
          checkList.splice(index, 1);
        }
      })
    })
    // console.log()
    // checkList.map((item,index,arr) => {
    //   itemData.sources.map((itemc, indexc) => {
    //     console.log(itemc)
    //     if (item.source == itemc){
    //       console.log(itemc)
    //       arr.splice(index, 1);
    //       console.log(arr)
    //     }
    //   })
    // })
    console.log(checkList)
    if (!!itemData.sources_info) {
      let sourceInfo = JSON.parse(itemData.sources_info);
      console.log(sourceInfo)
      checkList.map((item, index, arr) => {
        sourceInfo.map((items, indexs) => {
          if (item.source == items.source) {
            item.checked = true
            item.status = items.status
            item.auth_status = items.auth_status
            item.account = items.account
            item.account_id = items.account_id
            len++
          }
        })
      })
      for (let i = 0; i < sourceInfo.length; i++) {
        if (sourceInfo[i].auth_status != 2) {
          that.setData({
            authStatus: false
          })
          break
        }
      }
    }
    
    console.log(checkList)
    that.setData({
      houseArt: itemData,
      checkList: checkList,
      curSource: len
    })
    // that.initValidate()
  },
  onShow: function () {
    that.getList()
  },
  getData(e) {
    console.log(e)
    api.request('/pms/upload/house/detail.do', 'POST', e, true).then(res => {
      console.log('getData:', res.data)
      // let art = res.data
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        let sources = art.sources
        console.log(sources)
        let sourcesList = new Array(sources)
        console.log(sourcesList)
        let newArr
        sourcesList.map((item, index, arr) => {
          console.log(item)
          let jsonItem = JSON.parse(item)
          console.log(jsonItem)
          newArr = jsonItem
        })
        console.log(newArr)
        let checkList = that.data.checkList
        let len = 0
        newArr.map((item, index, arr) => {
          checkList.map((itemc, indexc, arrc) => {
            if (item.source == itemc.source) {
              itemc.auth_status = item.auth_status 
              itemc.account = item.account
              itemc.status = item.status
              itemc.account_id = item.account_id
              itemc.checked = true
              len++
            }
          })
        })
        console.log(checkList)
        that.setData({
          art: art,
          checkList: checkList,
          curSource: len
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)
      // that.showToast(res.data.rlt_msg)
    }).finally(() => { })
  },
  formSubmit(e){
    console.log(e)
    let data = e.detail.value
    data.upload_type = Number(data.upload_type)
    data.order_result_fee = that.data.curSource * 5
    data.house_id = that.data.houseArt.id
    let checkList = that.data.checkList
    data.sources.map((item, index, arr) => {
      checkList.map((iteml,indexl,arrl) =>{
        if (item == iteml.source) {
          arr.splice(index, 1, { source: item, status: '0', auth_status: iteml.auth_status, account: iteml.account ? iteml.account : '', account_id: iteml.account_id ? iteml.account_id : '' })
        }
      })
    })
    console.log(data)
    // if (!that.WxValidate.checkForm(data)) {
    //   const error = that.WxValidate.errorList[0]
    //   console.log(error)
    //   that.showToast(error.msg)
    //   return false
    // } else {
      for(let i = 0; i < data.sources.length; i ++ ){
        if (data.sources[i].auth_status != '2'){
          that.setData({
            modalName: 'tips',
            formData: data
          })
          console.log('111')
          return
        }
      }
      if (!!that.data.houseArt.upload_house_id) {
        data.upload_house_id = that.data.houseArt.upload_house_id
        data.type = 1
        that.updateHouse(data)
        return
      }
      that.addHouse(data)
      
    // }
  },
  toProgress(e) {
    wx.navigateTo({
      url: '../progress/progress?id=' + e.currentTarget.dataset.id,
    })
  },
  toNext(e){
    let data = that.data.formData
    if (!!that.data.houseArt.upload_house_id) {
      data.upload_house_id = that.data.houseArt.upload_house_id
      data.type = 1
      that.updateHouse(data)
      return
    }
    that.addHouse(data)
  },
  getList(e) {
    that.setData({
      modalName: null
    })
    api.request('/pms/third/account/list.do', 'POST', '', true, true).then(res => {
      console.log('getList:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        let checkList = that.data.checkList
        let newList = { '01': [], '02': [], '04': [], '05': []}
        art.map((item,index,arr) => {
          if(item.source == '06'){
            arr.splice(index, 1);
          }
        })
        console.log(art)
        art.map((item, index, arr) => {
          item.checked = false
          newList[item.source].push(item)
        })
        checkList.map((item,index,arr) => {
          newList[item.source].map((itemn, indexn, arrn) => {
            let sourceIndex = that.data['source' + item.source + 'Index']
            // console.log(item.source, sourceIndex)
            if (indexn == sourceIndex) {
              // item.checked = true
              // item.source = item
              item.status = '0'
              item.auth_status = itemn.login_status ? that.data.loginObj[itemn.login_status].auth_status : '0'
              item.account = itemn.account ? itemn.account : ''
              item.account_id = itemn.id ? itemn.id : ''
            }
          })
        })
        console.log(checkList)
        console.log(newList)
        that.setData({
          accountList: newList,
          checkList: checkList
        })
      }
    }).catch(res => {
    }).finally(() => {
    })
  },
  checkTap(e) {
    let checkList = that.data.checkList
    let source = e.currentTarget.dataset.source
    let target = e.currentTarget.dataset.target
    let len = 0
    checkList.map((item, index, arr) => {
      if(item.source == source){
        item.auth_status = '0'
        item.account = ''
        item.account_id = ''
        item.checked = !item.checked
      } 
      if (item.checked) {
        len++
      }
    })
    console.log('checkTap:',checkList)
    that.setData({
      checkList: checkList,
      [target + 'Index']: null,
      curSource: len
    })
  },
  autHorize(e){
    console.log(e)
    let source = e.currentTarget.dataset.source
    let accountList = that.data.accountList
    console.log(that.data.checkList)
    if (accountList[source].length == 0) {
      let target = e.currentTarget.dataset.target
      that.setData({
        [target + 'Index']: 0
      })
      wx.navigateTo({
        url: '../account/account'
      })
      return
    } else if (accountList[source].length == 1){
      let checkList = that.data.checkList
      checkList.map((item, index, arr) => {
        if (item.source == source){
          item.auth_status = that.data.loginObj[accountList[source][0].login_status].auth_status
          item.account = accountList[source][0].account
          item.account_id = accountList[source][0].id
        }
      })
      let target = e.currentTarget.dataset.target
      that.setData({
        checkList: checkList,
        [target + 'Index']: 0
      })
      if (accountList[source][0].login_status != "00"){
        wx.navigateTo({
          url: '../account/account'
        })
      }
    } else {
      that.setData({
        source: source,
        modalName: 'source'
      })
    }
  },
  toAccount(e){
    // console.log(e)
    // let source = e.currentTarget.dataset.source
    // let accountList = that.data.accountList
    wx.navigateTo({
      url: '../account/account'
    })
  },

  showModal(e) {
    that.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e){
    that.setData({
      modalName: null
    })
  },
  radioTap(e){
    console.log(e)
    let source = that.data.source
    
    let accountList = that.data.accountList
    let i = e.currentTarget.dataset.index
    let target = e.currentTarget.dataset.target
    console.log(target)
    accountList[source].map((item,index,arr) => {
      item.checked = false
      if(i == index){
        item.checked = true
      }
    })
    console.log(i)
    that.setData({
      accountList: accountList,
      accountIndex: i,
      [target + 'Index']: i
    })
  },
  modalConfirm(e){
    let value = e.detail.value
    console.log(value)
    if (!value.account || !value.login_status){
      that.showToast('请选择希望发布的账号')
      return
    }
    let checkList = that.data.checkList
    let source = that.data.source
    checkList.map((item, index, arr) => {
      if(item.source == source){
        item.auth_status = that.data.loginObj[value.login_status].auth_status
        item.account = value.account
        item.account_id = value.id
      }
    })
    for (let i = 0; i < checkList.length; i++) {
      if (checkList[i].source == source) {
        if (checkList[i].auth_status == 3 || checkList[i].auth_status == 0) {
          wx.navigateTo({
            url: '../account/account'
          })
          break
        }
      }
    }
    that.setData({
      checkList: checkList,
      modalName: null
    })
    
  },
  addHouse(data){
    api.request('/pms/upload/house/add.do', 'POST', data, true).then(res => {
      console.log('addHouse:', res.data)
      let art = res.data
      if (art.rlt_code == 'S_0000') {
        that.setData({
          'houseArt.upload_house_id': art.data.id
        })
        that.pay(art.data.id)
        // that.setData({
        //   houseId: art.data.id
        // })
        // wx.redirectTo({
        //   url: '../uploadStep2/uploadStep2?id=' + art.data.id + '&type=' + that.data.pageType,
        // })
      } else {
        that.showToast(art.rlt_msg)
      }
    }).catch(res => {
      that.showToast(art.rlt_msg)
    }).finally(() => { })
  },
  updateHouse(e) {
    console.log(e)
    api.request('/pms/upload/house/update.do', 'POST', e, true).then(res => {
      console.log('updateHouse:', res.data)
      let art = res.data
      if (art.rlt_code == 'S_0000') {
        if (that.data.houseArt.order_status != 1) {
          that.pay(e.upload_house_id)
          return
        }
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000,
          success(res) {
            wx.navigateBack()
          }
        })
      } else {
        that.showToast(art.rlt_msg)
      }
    }).catch(res => {
      // that.showToast(res.rlt_msg)
    }).finally(() => { })
  }, 
  pay(e) {
    let data = {
      upload_house_id: e
    }
    console.log(data)
    that.hideModal()
    api.request('/pms/weixin/order/pay/upload_unified_order.do', 'POST', data, true).then(res => {
      console.log('pay:', res.data);
      let payData = res.data
      if (payData.rlt_code == 'S_0000') {
        wx.requestPayment({
          timeStamp: payData.data.timeStamp,
          nonceStr: payData.data.nonceStr,
          package: payData.data.package,
          signType: payData.data.signType,
          paySign: payData.data.paySign,
          success(res) {
            console.log('pay-success:', res)
            // if (that.data.selectIndex == 0) {
            //   wx.redirectTo({
            //     url: '../uploadStep2/uploadStep2?id=' + e + '&type=' + that.data.pageType,
            //   })
            //   return
            // }
            wx.navigateBack()
            // wx.switchTab({
            //   url: '../orderList/orderList',
            //   success(e) {
            //     let page = getCurrentPages().pop();
            //     if (page == undefined || page == null) return;
            //     page.onLoad();
            //   }
            // })
          },
          fail(res) {
            console.log('pay-fail:', res)
            that.showToast('支付失败')

          },
          complete: function (res) {
            console.log(res)
          }
        })
      } else {
        console.log('pay-codeFail:', payData)
        that.showToast(payData.rlt_msg)

      }
    }).catch(res => {
      wx.hideLoading()
      console.log('pay-fail:', res);
    }).finally(() => { })
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
      house_name: {
        required: true,
        rangelength: [5, 20]
      },
      sources: {
        required: true,
      },
    }
    const messages = {
      house_name: {
        required: '请输入房源名称',
        rangelength: '房源名称长度为5~20位'
      },
      sources: {
        required: '请至少选择一个平台',
      },
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onUnload() {
    console.log('onunload')
    // wx.navigateTo({
    //   url: '../demo/demo',
    // })
  }

})
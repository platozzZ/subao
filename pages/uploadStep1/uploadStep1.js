const app = getApp()
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'

var that
Page({
  data: {
    houseId: '',
    art: '',
    accountList: [],
    checkList: [
      { source: "01", name: '途家', checked: false, auth_status: '0', status: '0', account: '', account_id: ''},
      { source: "02", name: '爱彼迎', checked: false, auth_status: '0', status: '0', account: '', account_id: ''},
      { source: "05", name: '榛果', checked: false, auth_status: '0', status: '0', account: '', account_id: ''},
      { source: "04", name: '小猪', checked: false, auth_status: '0', status: '0', account: '', account_id: ''},
      // { source: "06", name: '木鸟', checked: false, auth_status: '0', status: '0', account: '', account_id: ''}
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
    authStatus: true,
    selectIndex: 0,
    orderStatus: null,
    curSource: 0,
    getUrlList: [
      {
        title: '途家',
        list: [
          '打开途家APP', '切换为房客', '找到您的房源（若有多套请任选一个）', '点击分享，选择短信','复制短信内容中的链接'
        ]
      },{
        title: '爱彼迎',
        list: [
          '打开爱彼迎APP', '切换为旅行模式', '找到您的房源（若有多套请任选一个）', '点击分享，选择短信', '复制短信内容中的链接'
        ]
      }, {
        title: '美团榛果',
        list: [
          '打开美团民宿APP', '切换到房东', '进入房源预览（若有多套请任选一个）', '点击分享，选择短信', '复制短信内容中的链接'
        ]
      }, {
        title: '小猪',
        list: [
          '打开小猪APP', '切换成房东', '进入房源预览（若有多套请任选一个）', '点击分享，选择短信', '复制短信内容中的链接'
        ]
      }
    ]
  },
  onLoad: function (options) {
    app.mtj.trackEvent('wode_11')
    that = this
    console.log(options)
    if(!!options.item){
      let item = decodeURIComponent(options.item);
      let itemData = JSON.parse(item)
      let checkList = that.data.checkList
      let len = 0
      if (!!itemData.source_info) {
        let sourceInfo = JSON.parse(itemData.source_info);
        console.log(sourceInfo)
        checkList.map((item, index, arr) => {
          sourceInfo.map((items, indexs) => {
            if (item.source == items.source) {
              // "source": "02",
              //   "status": "0",  //status 0未上传 1已提交 2上传成功 3上传失败
              //     "auth_status": "0",  //0未授权 1授权中 2授权成功 3授权失败
              //       "account": ""  //账号
              item.checked = true
              item.status = items.status
              item.auth_status = items.auth_status
              item.account = items.account
              item.account_id = items.account_id
              len++
            }
          })
        })
        for (let i = 0; i < sourceInfo.length; i++){
          if (sourceInfo[i].auth_status != 2){
            that.setData({
              authStatus: false
            })
            break
          }
        }
        
      }
      that.setData({
        checkList: checkList,
        art: itemData,
        curSource: len
      })
      console.log(itemData)
    }
    that.setData({
      selectIndex: options.origin,
      
      // orderStatus: options.order
    })
    wx.setNavigationBarTitle({
      title: options.origin == 0 ? '选择平台(1/9)' : '上传多平台'
    })
    that.initValidate(options.origin)
    // if(options.id){
    //   that.setData({
    //     houseId: options.id
    //   })
    // }
    // if (!options.first){
    //   let data = {
    //     upload_house_id: options.id,
    //     type: 1
    //   }
    //   that.getData(data)
    // }
    if(options.type == 0){
      that.setData({
        pageType: 0
      })
    }
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
            // if (itemc.checked) {
            //   len++
            // }
          })
        })
        console.log(len)
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
    let checkList = that.data.checkList
    data.sources.map((item, index, arr) => {
      checkList.map((iteml,indexl,arrl) =>{
        if (item == iteml.source) {
          arr.splice(index, 1, { source: item, status: '0', auth_status: iteml.auth_status, account: iteml.account ? iteml.account : '', account_id: iteml.account_id ? iteml.account_id : '' })
        }
      })
    })
    data.upload_type = Number(that.data.selectIndex)
    data.order_result_fee = that.data.curSource * 5
    if (!that.WxValidate.checkForm(data)) {
      const error = that.WxValidate.errorList[0]
      console.log(error)
      that.showToast(error.msg)
      return false
    } else {
      console.log(data)
      for(let i = 0; i < data.sources.length; i ++ ){
        if (data.sources[i].auth_status != '2'){
          that.setData({
            modalName: 'tips',
            formData: data
          })
          return
        }
      }
      if (!!that.data.art.id) {
        data.upload_house_id = that.data.art.id
        data.type = 1
        that.updateHouse(data)
        return
      }
      that.addHouse(data)
      
    }
  },
  toNext(e){
    let data = that.data.formData
    // data.upload_type = Number(that.data.selectIndex)
    // data.order_result_fee = that.data.curSource * 5
    // data.
    if (!!that.data.art.id) {
      data.upload_house_id = that.data.art.id
      data.type = 1
      that.updateHouse(data)
      return
    }
    that.addHouse(data)
  },
  toProgress(e) {
    wx.navigateTo({
      url: '../progress/progress?id=' + e.currentTarget.dataset.id,
    })
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
      if (item.checked){
        len++
      }
    })
    console.log(len)
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
          'art.id': art.data.id
        })
        that.pay(art.data.id)
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
        if (that.data.art.order_status != 1) {
          that.pay(e.upload_house_id)
          return
        }
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000,
          success(res){
            if(that.data.selectIndex == 0){
              wx.redirectTo({
                url: '../uploadStep2/uploadStep2?id=' + e.upload_house_id + '&type=' + that.data.pageType,
              })
              return
            }
            wx.navigateBack()
          }
        })
      } else {
        that.showToast(art.rlt_msg)
      }
    }).catch(res => {
      that.showToast(art.rlt_msg)
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
            if (that.data.selectIndex == 0){
              wx.redirectTo({
                url: '../uploadStep2/uploadStep2?id=' + e + '&type=' + that.data.pageType,
              })
              return
            }
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
  textareaInput(e){
    that.setData({
      'art.house_url': e.detail.value
    })
  },
  showModal(e){
    that.setData({
      modalName: e.currentTarget.dataset.target
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
    console.log(e)
    let rules, messages
    if(e == 0){
      rules = {
        house_name: {
          required: true,
          rangelength: [5, 20]
        },
        sources: {
          required: true,
        },
      }
      messages = {
        house_name: {
          required: '请输入房源名称',
          rangelength: '房源名称长度为5~20位'
        },
        sources: {
          required: '请至少选择一个平台',
        },
      }
    } else {
      rules = {
        house_name: {
          required: true,
          rangelength: [5, 20]
        },
        house_url: {
          required: true,
        },
        sources: {
          required: true,
        },
      }
      messages = {
        house_name: {
          required: '请输入房源名称',
          rangelength: '房源名称长度为5~20位'
        },
        house_url: {
          required: '请粘贴房源链接',
        },
        sources: {
          required: '请至少选择一个平台',
        },
      }
    }
    // // 验证字段的规则
    // const rules = {
    //   house_name: {
    //     required: true,
    //     rangelength: [5, 20]
    //   },
    //   sources: {
    //     required: true,
    //   },
    // }
    // const messages = {
    //   house_name: {
    //     required: '请输入房源名称',
    //     rangelength: '房源名称长度为5~20位'
    //   },
    //   sources: {
    //     required: '请至少选择一个平台',
    //   },
    // }
    console.log(rules)
    console.log(messages)
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
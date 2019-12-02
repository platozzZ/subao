const app = getApp();
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'
var that
Page({
  data: {
    houseId: '',
    art: {
      clean_price_flag: '否'
    },

    rizuval:'',
    qingjieval:'',
    zhengce:'',
    house_id:'',
    clean_price_flag:'',
    yesno: [
      { title: '是',checked:false},
      { title: '否',checked:false}
      
    ],
    pageType: null
  },
  onLoad: function (options) {
    app.mtj.trackEvent('wode_17')
    that = this
    console.log(options)
    that.initValidate('否')
    that.setData({
      houseId: options.id
      // house_id: '190998604779946048'
    })
    let data = {
      upload_house_id: options.id,
      type: 7
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

  //是否收取清洁费选择

  radioChange(e) {
    console.log(e.detail.value)

    that.initValidate(e.detail.value)
    that.setData({
      'art.clean_price_flag': e.detail.value
    })
 
  },
  formSubmit(e) {
    console.log(e)
    let target = e.detail.target.dataset.target
    let data = e.detail.value
    data.type = 7
    data.target = target
    data.upload_house_id = that.data.houseId
    console.log(data)
    if (target == 'next') {
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
  updateHouse(e) {
    console.log(e)
    api.request('/pms/upload/house/update.do', 'POST', e, true).then(res => {
      console.log('updateHouse:', res.data)
      let art = res.data
      if (art.rlt_code == 'S_0000') {
        if (e.target == 'next') {
          wx.redirectTo({
            url: '../uploadStep8/uploadStep8?id=' + e.upload_house_id + '&type=' + that.data.pageType,
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

//退订政策
// toding(){
//   wx.navigateTo({
//     url: '../resetPolicy/resetPolicy?zhengce='+that.data.zhengce,
//   })
// },
// // form 提交
//   formSubmit(e) {
//     console.log(e)
//     console.log(e.detail.value)
   
//     var target = e.detail.target.dataset.target
   
//     let data = e.detail.value
//     if(target=='next'){
//       if (data.day_price == '') {
//         that.showToast('请填写日租价格')
//         return false;
//       }
//     }
  
//     api.request('/pms/upload/house/update.do', 'POST', data, true, true).then(res => {
//       console.log(res.data)
//       if (res.data.rlt_code == 'S_0000') {
//         // that.showToast(res.data.rlt_msg)
//         if (target == 'next') {
//           wx.redirectTo({
//             url: '../uploadStep8/uploadStep8?id=' + that.data.house_id,
//           })
//           return
//         }
//         wx.showToast({
//           title: '保存成功',
//           icon: 'success',
//           duration: 2000
//         })

//       } else {
//         that.showToast(res.data.rlt_msg)
//       }
//     }).catch(res => {

//     }).finally(() => {

//     })

  
//   console.log(target)

//   },
 

  initValidate(e) {
    // 验证字段的规则
    let rules, messages
    if (e == '是') {
      rules = {
        day_price: {
          required: true,
          range: [0, 100000]
        },
        clean_price_flag: {
          required: true,
        },
        clean_price: {
          required: true,
          range: [0, 10000]
        },
        refund_rule: {
          required: true,
        },
      }
      messages = {
        day_price: {
          required: '请输入日租价格',
          range: '请输入正确的日租价格'
        },
        clean_price_flag: {
          required: '请选择是否收取清洁费',
        },
        clean_price: {
          required: '请输入清洁费价格',
          range: '请输入正确的清洁费价格'
        },
        refund_rule: {
          required: '请选择退订政策',
        },
      }
    } else {
      rules = {
        day_price: {
          required: true,
          range: [0, 10000]
        },
        clean_price_flag: {
          required: true,
        },
        // clean_price: {
        //   required: true,
        // },
        refund_rule: {
          required: true,
        },
      }
      messages = {
        day_price: {
          required: '请输入日租价格',
          range: '请输入正确的日租价格'
        },
        clean_price_flag: {
          required: '请选择是否收取清洁费',
        },
        // clean_price: {
        //   required: '请输入清洁费价格',
        // },
        refund_rule: {
          required: '请选择退订政策',
        },
      }
    }
    // console.log(rules)
    // console.log(messages)
    // 创建实例对象
    that.WxValidate = new WxValidate(rules, messages)

  },
//modal显示
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      duration: 2000,
      mask: true
    })
  },


})
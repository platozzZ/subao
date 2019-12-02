const app = getApp();
const api = require('../../utils/request.js')
const baseUrl = require('../../utils/baseUrl.js')
var that
Page({
  data: {
    art: '',
    imgList: [],
    house_id: '',
    pageType: null
  },
  onLoad: function (options) {
    app.mtj.trackEvent('wode_19')
    that = this
    that.setData({
      house_id: options.id
    })
    if(options.list){
      that.setData({
        list: true
      })
    }
    let data = {
      upload_house_id: options.id,
      type: 9
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
        let imgList = []
        if (!!art.house_cert_img){
          let house_cert_img = new Array(art.house_cert_img)
          house_cert_img.map((item, index, arr) => {
            let jsonItem = JSON.parse(item)
            imgList = jsonItem
          })
        }
        that.setData({
          art: art,
          imgList: imgList
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)
      // that.showToast(res.data.rlt_msg)
    }).finally(() => { })
  },
  // 添加图片
  chooseImage(e) {
    wx.chooseImage({
      count: 9, //默认9 只代表一次可以上传的数量 不代表总数量
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], //从相册选择
      success: (res) => {
        console.log(res)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths;
        let tempLength = tempFilePaths.length;
        that.uploadImage(tempFilePaths, 0, tempLength)
      }
    });
  },
  // 获取图片链接  uploadFile
  uploadImage(tempFilePaths, i, length) {
    console.log(tempFilePaths, i, length)
    let that = this
    wx.uploadFile({
      url: baseUrl + '/pms/file/upload.do',
      filePath: tempFilePaths[i],
      name: 'file',
      header: {
        'access_token': wx.getStorageSync('token')
      },
      formData: {
        "house_id": that.data.house_id,
      },
      success: function (res) {
        console.log(res)
        let imgList = that.data.imgList
        console.log(imgList)
        console.log(JSON.parse(res.data))
        console.log(JSON.parse(res.data).data)
        imgList.push(JSON.parse(res.data).data)
        that.setData({
          imgList
        })

        i++;
        if (i < length) {
          that.uploadImage(tempFilePaths, i, length)
        } else {
          console.log(that.data.imgList)
        }

      }
    })
  },
  // 预览图片
  viewImage(e) {
    wx.previewImage({
      urls: that.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  // 删除图片
  delImg(e) {
    let index = e.currentTarget.dataset.index
    let imgList = that.data.imgList
    imgList.splice(index, 1)
    that.setData({
      imgList
    })
  },
  // 提交
  submit(e) {
    let target = e.currentTarget.dataset.target
    if (that.data.imgList == '' && target == 'next') {
      that.showToast('请上传房屋资质')
      return
    }
    let data = {
      house_cert_img: that.data.imgList,
      upload_house_id: that.data.house_id,
      type: 9

    }
    api.request('/pms/upload/house/update.do', 'POST', data, true, true).then(res => {
      console.log('submit:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        if (target == 'next') {
          // if (that.data.art.order_status == 1){
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 2000,
              success(res) {
                setTimeout(function () {
                  if (that.data.pageType == 0) {
                    console.log('navigateBack')
                    wx.navigateBack()
                    return
                  }
                  console.log('redirectTo')
                  wx.redirectTo({
                    url: '../updateList/updateList?id=' + that.data.house_id,
                  })
                }, 2000)
              }
            })
          // } else {
          //   wx.redirectTo({
          //     url: '../uploadStep1/uploadStep1?id=' + that.data.house_id,
          //   })
          // }
          return
        }
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },


//modal显示
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      duration: 2000,
      mask: true
    })
  }






  
})
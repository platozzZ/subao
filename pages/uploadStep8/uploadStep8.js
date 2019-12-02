const app = getApp();
const api = require('../../utils/request.js')
const baseUrl = require('../../utils/baseUrl.js')

var that
Page({
  data: {
    house_id: '',
    coverList: [],
    bedroomList: [],
    livroomList: [],
    kitchenList: [],
    bathroomList: [],
    otherList: [],
    pageType: null
  },
  onLoad: function (options) {
    app.mtj.trackEvent('wode_18')
    that = this
    console.log(options)
    that.setData({
       house_id: options.id
      // house_id:'190998604779946048'
   
    }) 
    let data = {
      upload_house_id: options.id,
      type: 8
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
        let coverList = that.data.coverList
        if (!!art.cover_img){
          coverList.push(art.cover_img)
          console.log(coverList)
        }
        // let coverList = []
        let bedroomList = []
        let livroomList = []
        let kitchenList = []
        let bathroomList = []
        let otherList = []
        if (!!art.bedroom_img) {
          let bedroom_img = new Array(art.bedroom_img)
          bedroom_img.map((item, index, arr) => {
            let jsonItem = JSON.parse(item)
            bedroomList = jsonItem
          })
        }
        if (!!art.livingroom_img) {
          let livingroom_img = new Array(art.livingroom_img)
          livingroom_img.map((item, index, arr) => {
            let jsonItem = JSON.parse(item)
            livroomList = jsonItem
          })
        }
        if (!!art.kitchen_img) {
          let kitchen_img = new Array(art.kitchen_img)
          kitchen_img.map((item, index, arr) => {
            let jsonItem = JSON.parse(item)
            kitchenList = jsonItem
          })
        }
        if (!!art.bathroom_img) {
          let bathroom_img = new Array(art.bathroom_img)
          bathroom_img.map((item, index, arr) => {
            let jsonItem = JSON.parse(item)
            bathroomList = jsonItem
          })
        }
        if (!!art.other_img) {
          let other_img = new Array(art.other_img)
          other_img.map((item, index, arr) => {
            let jsonItem = JSON.parse(item)
            otherList = jsonItem
          })
        }


        that.setData({
          coverList: coverList,
          bedroomList: bedroomList,
          livroomList: livroomList,
          kitchenList: kitchenList,
          bathroomList: bathroomList,
          otherList: otherList,
          
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
    let length
    let index = e.currentTarget.dataset.index
    // coverList: [],
    // bedroomList: [],
    // livroomList: [],
    // kitchenList: [],
    // bathroomList: [],
    // otherList: []
    if (index == 0){
      length = 1 - that.data.coverList.length
    } else if (index == 1){
      length = 10 - that.data.bedroomList.length
    } else if (index == 2) {
      length = 10 - that.data.livroomList.length
    } else if (index == 3) {
      length = 10 - that.data.kitchenList.length
    } else if (index == 4) {
      length = 10 - that.data.bathroomList.length
    } else if (index == 5) {
      length = 10 - that.data.otherList.length
    }
    wx.chooseImage({
      count: length, //默认9 只代表一次可以上传的数量 不代表总数量
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album','camera'], //从相册选择
      success: (res) => {
        console.log(res)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths;
        let tempLength = tempFilePaths.length;
        that.uploadImage(tempFilePaths, 0, tempLength, index)
        // if (this.data.imgList.length != 0) {
        //   this.setData({
        //     imgList: this.data.imgList.concat(res.tempFilePaths)
        //   })
        // } else {
        //   this.setData({
        //     imgList: res.tempFilePaths
        //   })
        // }
      }
    });
  },
  // 获取图片链接  uploadFile
  uploadImage(tempFilePaths, i, length, index) {
    console.log(tempFilePaths, i, length, index)
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
        let data = res.data
        console.log(res)
        let imgList
        if (index == 0) {
          imgList = that.data.coverList
          imgList.push(JSON.parse(res.data).data)
          that.setData({
            coverList: imgList
          })
        } else if (index == 1) {
          imgList = that.data.bedroomList
          imgList.push(JSON.parse(res.data).data)
          that.setData({
            bedroomList: imgList
          })
        } else if (index == 2) {
          imgList = that.data.livroomList
          imgList.push(JSON.parse(res.data).data)
          that.setData({
            livroomList: imgList
          })
        } else if (index == 3) {
          imgList = that.data.kitchenList
          imgList.push(JSON.parse(res.data).data)
          that.setData({
            kitchenList: imgList
          })
        } else if (index == 4) {
          imgList = that.data.bathroomList
          imgList.push(JSON.parse(res.data).data)
          that.setData({
            bathroomList: imgList
          })
        } else if (index == 5) {
          imgList = that.data.otherList
          imgList.push(JSON.parse(res.data).data)
          that.setData({
            otherList: imgList
          })
        }

        i++;
        if (i < length) {
          that.uploadImage(tempFilePaths, i, length, index)
        } else {
          // console.log(that.data.imgList)
        }

      }
    })
  },
  // 预览图片
  viewImage(e) {
    let index = e.currentTarget.dataset.index;
    var viewImage
    if (index == 0) {
      viewImage = that.data.coverList
    } else if (index == 1) {
      viewImage = that.data.bedroomList
    } else if (index == 2) {
      viewImage = that.data.livroomList
    } else if (index == 3) {
      viewImage = that.data.kitchenList
    } else if (index == 4) {
      viewImage = that.data.bathroomList
    } else if (index == 5) {
      viewImage = that.data.otherList
    }
    wx.previewImage({
      urls: viewImage,
      current: e.currentTarget.dataset.url
    });
  },
  // 删除图片
  delImg(e) {
    let index = e.currentTarget.dataset.index
    let item = e.currentTarget.dataset.item
    if (index == 0) {
      var coverList = that.data.coverList
      coverList.splice(item, 1)
      that.setData({
        coverList
      })
    } else if (index == 1) {
      var bedroomList = that.data.bedroomList
      bedroomList.splice(item, 1)
      that.setData({
        bedroomList
      })
    } else if (index == 2) {
      var livroomList = that.data.livroomList
      livroomList.splice(item, 1)
      that.setData({
        livroomList
      })
    } else if (index == 3) {
      var kitchenList = that.data.kitchenList
      kitchenList.splice(item, 1)
      that.setData({
        kitchenList
      })
    } else if (index == 4) {
      var bathroomList = that.data.bathroomList
      bathroomList.splice(item, 1)
      that.setData({
        bathroomList
      })
    } else if (index == 5) {
      var otherList = that.data.otherList
      otherList.splice(item, 1)
      that.setData({
        otherList
      })
    }
  },
  // 提交
  submit(e){
    let target = e.currentTarget.dataset.target
    if(target == 'next'){
      if (that.data.coverList.length == 0 || that.data.bedroomList.length == 0 || that.data.bathroomList.length == 0) {
        that.showToast('封面、卧室、卫生间至少需要各上传一张图片')
        return
      }
      if (Number(that.data.coverList.length) + Number(that.data.bedroomList.length) + Number(that.data.livroomList.length) + Number(that.data.kitchenList.length) + Number(that.data.bathroomList.length) + Number(that.data.otherList.length) < 5) {
        that.showToast('请至少上传五张图片')
        return
      }
    }
    let data = {
      cover_img: that.data.coverList[0],
      bedroom_img: that.data.bedroomList,
      livingroom_img: that.data.livroomList,
      kitchen_img: that.data.kitchenList,
      bathroom_img: that.data.bathroomList,
      other_img: that.data.otherList,
      upload_house_id: that.data.house_id,
      type: 8

    }
    api.request('/pms/upload/house/update.do', 'POST', data, true, true).then(res => {
      console.log('submit:',res.data)
      if (res.data.rlt_code == 'S_0000') {
        if (target == 'next') {
          wx.redirectTo({
            url: '../uploadStep9/uploadStep9?id=' + that.data.house_id + '&type=' + that.data.pageType,
          })
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
// 引入头像模板文件
import {defaultImg,templateImage,httpImgList} from '../../utils/headTemplate.js'
// 默认头像
const defaultAvatarUrl = defaultImg.InitUserImg;

Page({
  data: {
    // 用户信息
    userInfo: {
      // 头像
      avatarUrl: defaultAvatarUrl
    },
    // loading弹窗
    hidden: true, // true 隐藏/ false 显示
    // 是否显示头像模板
    showTemplate:false,
    // 是否合并图片
    hasNewImg: false, // 不生效
    // 是否有用户信息
    hasUserInfo: false,
    imageConf:{
      // 装载的图片集合对象
      imageArray: [],
      base64ImgList: templateImage, // 引用js文件，头像模板base64编码文件
      httpImgList: {
        // 启用状态
        useStatus: 1,
        // 远程地址图片前缀（实际访问图片地址：imageUrlPrefix+数字num+'.png'）
        imageUrlPrefix: 'https://kyh0104-1257003446.cos.ap-shanghai.myqcloud.com/image/head/',
        // 远程地址图片后缀
        imgaeUrlSuffix: '.png',
        // 远程地址的图片数量
        imageCount: 25
      }
    }
  },
  // 重选图片
  restPhoto: function (){

    this.setData({
      hidden: false
    });

    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }, 500);

  },
  /*获取微信头像*/
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail

    this.canvasDraw(avatarUrl);

    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: true,
    })

  },
  onReady: function () {

  },
  onLoad(option) {
    // 微信小程序分享
    this.initShare();
    // 初始化模板图片
    this.generateImageArray();

    let that = this;

    if( option.src != null  ){
      // 获取src地址（裁切后图片文件地址）
      that.canvasDraw2(option.src);
    }else{
      // 初始化画布并设置默认背景图片
      const query = wx.createSelectorQuery()
      query.select('#shareCanvas')
          .fields({
            id: true,
            node: true,
            size: true
          })
          .exec(this.init.bind(this));
    }

  },
  /*分享功能*/
  initShare: function (){
    // "shareAppMessage"表示“发送给朋友”按钮，"shareTimeline"表示“分享到朋友圈”按钮
    wx.showShareMenu({
      menus: ['shareAppMessage', 'shareTimeline'],// 需要显示的转发按钮名称列表.合法值包含 "shareAppMessage"、"shareTimeline"
      success(res) {
        console.log(res);
      },
      fail(e) {
        console.log(e);
      }
    });
  },
  /*分享配置：标题、路径、图片*/
  onShareAppMessage() {
    return {
      title: '柿柿看呀，换个头像~', // 分享出的卡片标题
      path: 'pages/index/index', // 他人通过卡片进入小程序的路径，可以在后面拼接URL的形式带参数
      imageUrl: '/share/share.png', // 分享出去的图片，默认为当前页面的截图。图片路径可以是本地文件路径或者网络图片路径。支持PNG及JPG。
    };
  },
  /*装载头像模板*/
  generateImageArray: function() {
    let imageArray = [];

    /*base64本地图片*/
    if( this.data.imageConf.base64ImgList.useStatus === 1 ) {
      for (let i = 0; i < this.data.imageConf.base64ImgList.imgList.length; i++) {
        let httpImgUrl = this.data.imageConf.base64ImgList.imgList[i];
        imageArray.push(httpImgUrl);
      }
    }

    /*网络地址图片*/
    // if( this.data.imageConf.httpImgList.useStatus === 1 ){
    //   for (let i = 1; i <= this.data.imageConf.httpImgList.imageCount; i++) {
    //     let httpImgUrl = this.data.imageConf.httpImgList.imageUrlPrefix + i + this.data.imageConf.httpImgList.imgaeUrlSuffix;
    //     imageArray.push(httpImgUrl);
    //   }
    // }

    /*网络地址图片*/
    // if( httpImgList.useStatus === 1 ){
    //   for (let i = 0; i < httpImgList.imgList.length; i++) {
    //     imageArray.push(httpImgList.imgList[i]);
    //   }
    // }

    this.setData({
      "imageConf.imageArray": imageArray
    });
  },
  /*canvas*/
  init(res) {
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    const dpr = wx.getSystemInfoSync().pixelRatio
    // 新接口需显示设置画布宽高；
    canvas.width = res[0].width * dpr
    canvas.height = res[0].height * dpr
    ctx.scale(dpr, dpr);

    this.setData({
      canvas,
      ctx
    });

    // 获取base64本地图片获取路径
    var base64 =  this.data.userInfo.avatarUrl;//base64格式图片
    var imgPath = wx.env.USER_DATA_PATH+'/index_'+Date.now()+ '.png';
    //如果图片字符串不含要清空的前缀,可以不执行下行代码.
    var imageData = base64.replace(/^data:image\/\w+;base64,/, "");
    var fs = wx.getFileSystemManager();
    fs.writeFileSync(imgPath, imageData, "base64");

    // 向画布载入图片的方法
    this.canvasDraw(imgPath);
  },
  canvasDraw(imgPath) {

    console.log('打印data：',this.data);

    const { canvas, ctx } = this.data;
    if (!canvas || !ctx) {
      console.error('Canvas or context is not initialized');
      return ;
    }

    // 清空画布 （ps：此处不需要清空画布，否则就需要绘制2次：背景、模板图片）
    //this.data.ctx.clearRect(0, 0, 200, 200);

    let img = this.data.canvas.createImage();
    img.onload = () => {
      // 绘制图片 img
      this.data.ctx.drawImage(img, 0, 0, 200, 200);

      /** 多个图片合并的话，由于异步执行，由于尺寸原因可能存在img2渲染早于img，所以合并 */
      /*if( img.complete ){ // img.complete表示图片是否加载完成，结果返回true和false;
        /!** 因为默认背景头像图片已经通过canvas绘制过一遍了，合成的模板图片只需要在基础上重新绘制一遍即可。 *!/
        // let img2 = this.data.canvas.createImage();
        // img2.onload = () => {
        //   // 绘制图片 img2
        //   this.data.ctx.drawImage(img2, 0, 0, 200, 200);
        // };
        // img2.src = img2Url;
      }*/

    };
    img.src = imgPath;

  },
  /*上传文件-绘制头像背景200X200*/
  canvasDraw2(imgPath){

    /*重新初始化canvas，已解决：Canvas or context is not initialized*/

    const query = wx.createSelectorQuery()
    query.select('#shareCanvas')
        .fields({
          id: true,
          node: true,
          size: true
        })
        .exec(
            (res) => {
              const canvas = res[0].node
              const ctx = canvas.getContext('2d')
              const dpr = wx.getSystemInfoSync().pixelRatio
              // 新接口需显示设置画布宽高；
              canvas.width = res[0].width * dpr
              canvas.height = res[0].height * dpr
              ctx.scale(dpr, dpr);

              // 清空画布区域
              ctx.clearRect(0, 0, 200, 200);

              // 重新设置canvas对象信息
              this.setData({
                canvas,
                ctx
              });

              // 重新执行上传本地图片业务流程逻辑
              this.setData({
                "userInfo.avatarUrl": imgPath,
                hasUserInfo: true
              })
              let img = canvas.createImage();
              img.onload = () => {
                // 绘制图片 img
                ctx.drawImage(img, 0, 0, 200, 200);
              };
              img.src = imgPath;

            }
        );
  },
  // 选择模板
  selectTemplate: function() {
    this.setData({
      showTemplate: !this.data.showTemplate
    })
  },
  // 重新选择模板
  againSelectTemplate: function() {
    this.setData({
      showTemplate: true
    });

    // 在重新选择模板时，由于之前已经绘制过一次，所以需要重新绘制背景头像；
    // 选择好模板后，只需要在次绘制一次模板即可。
    var imgPath =  this.data.userInfo.avatarUrl;
    this.canvasDraw(imgPath);

  },
  // 保存图片
  saveImgae: function(){
    // 你可以在这里执行进一步的操作，例如将图片保存到相册
    wx.canvasToTempFilePath({
      canvas: this.data.canvas, // 使用2D 需要传递的参数
      success(res) {
        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '保存成功，请在相册中查看',
            })
          }
        })
      }
    })
  },
  // 点击图片
  onImageClick: function(e) {

    this.setData({
      hidden: false, // 打开微信弹窗loding
      hasNewImg: true // 设置存在新图片
    });

    const timestamp = Date.now();
    // 获取base64本地图片获取路径
    var base64 =  e.currentTarget.dataset.img//base64格式图片
    var imgPath = wx.env.USER_DATA_PATH+'/index_'+timestamp+ '.png';
    //如果图片字符串不含要清空的前缀,可以不执行下行代码.
    var imageData = base64.replace(/^data:image\/\w+;base64,/, "");

    // 通过正则表达式判断是否是图片（http or base64）
    const imagePattern = /http(s)?:\/\/[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!$&'()*+,;=%]+/;
    const isImage = imagePattern.test(imageData);

    let imgUrl;


    if(isImage){  // http图片
      imgUrl = imageData
      this.canvasDraw(imgUrl);
    }else{
      // base64图片
      var fs = wx.getFileSystemManager();
      fs.writeFileSync(imgPath, imageData, "base64");

      this.canvasDraw(imgPath);
    }


    this.setData({
      hidden: true, // 关闭微信弹窗loding
      // hasNewImg: true // 设置存在新图片
    });

    // 关闭选择模板
    this.selectTemplate();

  },
  // 上传图片（本地缓存目录，非上传微信）
  uploadImg: function (){
    wx.chooseMedia({
      count: 1, // 最多可以选择的文件个数
      mediaType: ['image'], // 文件类型
      sizeType: ['original'], // 是否压缩所选文件
      sourceType: ['album'], // 可以指定来源是相册`album`还是相机`camera`，默认二者都有
      success(result) {

        /*原上传图片业务逻辑流程，后续步骤在`canvasDraw2`执行*/
        // that.setData({
        //   "userInfo.avatarUrl": result.tempFiles[0].tempFilePath,
        //   hasUserInfo: true
        // })
        //向画布载入图片的方法
        //that.canvasDraw(result.tempFiles[0].tempFilePath);

        // 跳转裁切
        // wx.navigateTo({
        //   url: '/pages/clip/clipHeadImg?src=' + result.tempFiles[0].tempFilePath,
        // })

        wx.redirectTo({
          url: '/pages/clip/clipHeadImg?src=' + result.tempFiles[0].tempFilePath,
        })

      },
    })
  },
})

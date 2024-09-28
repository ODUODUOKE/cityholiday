// 引入头像模板文件
import {defaultImg,templateImage} from '../../utils/headTemplate.js'
// 默认头像
const defaultAvatarUrl = defaultImg.InitUserImg;

Page({
  data: {
    // 备注
    motto: '',
    // 用户信息
    userInfo: {
      // 头像
      avatarUrl: defaultAvatarUrl,
      // 昵称
      nickName: '',
      // 临时头像，缓存
      tmpAvatarUrl: ''
    },
    // 引用js文件，头像模板base64编码文件
    templateImage,
    // loading弹窗
    hidden: true, // true 隐藏/ false 显示
    // 是否显示头像模板
    showTemplate:false,
    // 是否合并图片
    hasNewImg: false, // 不生效
    // 是否有用户信息
    hasUserInfo: false,
    imageCount: 25, // 假设我们有12张图片
    imageArray: []
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
    var imgPath =  this.data.userInfo.avatarUrl;
    this.canvasDrawSignImg(imgPath);
  },
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
  onImageClick2: function(e) {
  
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
      if(isImage){
        // http图片
        imgUrl = imageData
      }else{
        // base64图片
        var fs = wx.getFileSystemManager();
        fs.writeFileSync(imgPath, imageData, "base64");
        if( this.data.userInfo.tmpAvatarUrl=='' ){
          imgUrl = this.data.userInfo.avatarUrl;
        }else{
          imgUrl = this.data.userInfo.tmpAvatarUrl;
        }
      }
      
       
      this.canvasDraw(imgUrl,imgPath);

      this.setData({
        hidden: true, // 关闭微信弹窗loding
        // hasNewImg: true // 设置存在新图片
      });

      // 关闭选择模板
      this.selectTemplate();

  },
  // 获取本地图片到临时缓存中
  uploadImg: function (){
    var that = this;
		wx.chooseMedia({
			count: 1, // 最多可以选择的文件个数
			mediaType: ['image'], // 文件类型
			sizeType: ['original'], // 是否压缩所选文件
			sourceType: ['album'], // 可以指定来源是相册`album`还是相机`camera`，默认二者都有
			success(result) {
        that.setData({
          "userInfo.avatarUrl": result.tempFiles[0].tempFilePath,
          hasUserInfo: true
        })

        //向画布载入图片的方法 
        that.canvasDrawSignImg(result.tempFiles[0].tempFilePath);

			},
		})
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
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail

    console.log("获取微信授权头像:",avatarUrl);
    this.canvasDrawSignImg(avatarUrl);

    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: true,
    })

  },
  onShareAppMessage() {
    return {
      title: '柿柿看呀，换个头像~', // 分享出的卡片标题
      path: 'pages/index/index', // 他人通过卡片进入小程序的路径，可以在后面拼接URL的形式带参数
      imageUrl: '/share/share.png', // 分享出去的图片，默认为当前页面的截图。图片路径可以是本地文件路径或者网络图片路径。支持PNG及JPG。
    };
  },
  onLoad() {
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
    this.generateImageArray();
  },
  generateImageArray: function() {
    let imageArray = [];
    for (let i = 1; i <= this.data.imageCount; i++) {
      imageArray.push('https://kyh0104-1257003446.cos.ap-shanghai.myqcloud.com/image/head/' + i + '.png');
    }
    this.setData({
      imageArray: imageArray
    });
  },
  onReady: function () {    
    const query = wx.createSelectorQuery()
    query.select('#shareCanvas')
        .fields({
          id: true,
          node: true,
          size: true
        })
        .exec(this.init.bind(this));
  },
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

    //向画布载入图片的方法 
    this.canvasDrawSignImg(imgPath);
  },
  canvasDraw(img1Url,img2Url) {

    console.log('.....---img1:',img1Url);
    console.log('.....---img2:',img2Url);
    /** 多个图片合并的话，由于异步执行，由于尺寸原因可能存在img2渲染早于img，所以合并 */
    /** 背景图片 img */
    /** 模板图片 img2 */

    let img = this.data.canvas.createImage();
    img.onload = () => {
      // 绘制图片 img
      this.data.ctx.drawImage(img, 0, 0, 200, 200);
      // img.complete表示图片是否加载完成，结果返回true和false;
      if( img.complete ){
        /** 因为默认背景头像图片已经通过canvas绘制过一遍了，合成的模板图片只需要在基础上重新绘制一遍即可。 */
        // let img2 = this.data.canvas.createImage();
        // img2.onload = () => {
        //   // 绘制图片 img2
        //   this.data.ctx.drawImage(img2, 0, 0, 200, 200);
        // };
        // img2.src = img2Url;
      }
    };
    img.src = img1Url;

  },
  canvasDrawSignImg(imgUrl) {
    
    let img = this.data.canvas.createImage();
    img.onload = () => {
      // 绘制图片 img
      this.data.ctx.drawImage(img, 0, 0, 200, 200);
    };
    img.src = imgUrl;

  },
})

#import "RTNWechat.h"
#import <WXApi.h>

@interface RTNWechat() <WXApiDelegate>
@end

@implementation RTNWechat

RCT_EXPORT_MODULE()

// 在这里初始化微信SDK
-(instancetype)init {
  self = [super init];
  if (self) {
    NSLog(@"RTNWechat模块初始化");
    
    BOOL result = [WXApi registerApp:@"wxd477edab60670232" universalLink:@"https://www.baidu.com"];

    NSLog(@"微信SDK自动注册结果: %@", result ? @"成功" : @"失败");
    
    // 检查微信是否已安装
    BOOL isInstalled = [WXApi isWXAppInstalled];
    NSLog(@"微信是否已安装: %@", isInstalled ? @"是" : @"否");
    
    // 检查微信是否支持API
    BOOL isSupport = [WXApi isWXAppSupportApi];
    NSLog(@"微信是否支持API: %@", isSupport ? @"是" : @"否");
  
  }
  return self;
}

// 确保在主线程执行UI操作
- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

// 检查微信是否已安装
RCT_EXPORT_METHOD(isWXAppInstalled:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  BOOL isInstalled = [WXApi isWXAppInstalled];
  NSLog(@"RTNWechat isWXAppInstalled: %@", isInstalled ? @"已安装" : @"未安装");
  resolve(@(isInstalled));
}

// 登录
- (void)login:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  // 检查微信是否已安装
  if (![WXApi isWXAppInstalled]) {
    reject(@"login_error", @"WeChat is not installed", nil);
    return;
  }
  
  // 打印当前注册状态
  NSLog(@"WXApi isWXAppSupport: %d", [WXApi isWXAppInstalled]);
  
  SendAuthReq *req = [[SendAuthReq alloc] init];
  req.scope = @"snsapi_userinfo";
  
  req.state = @"wechat_login";
  
  [WXApi sendReq:req completion:^(BOOL success) {
    NSLog(@"WXApi sendReq result: %d", success);
    if (success) {
      // 请求发送成功，等待回调
      resolve(nil); // 注意：我们应该在这里resolve，否则promise会一直pending
    } else {
      reject(@"login_error", @"Failed to send login request", nil);
    }
  }];
}

// 支付
- (void)pay:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  // 检查参数
  if (!params[@"partnerId"] || !params[@"prepayId"] || !params[@"nonceStr"] || 
      !params[@"timeStamp"] || !params[@"package"] || !params[@"sign"]) {
    reject(@"pay_error", @"Missing required payment parameters", nil);
    return;
  }
  
  // 检查微信是否已安装
  if (![WXApi isWXAppInstalled]) {
    reject(@"pay_error", @"WeChat is not installed", nil);
    return;
  }
  
  PayReq *req = [[PayReq alloc] init];
  req.partnerId = params[@"partnerId"];
  req.prepayId = params[@"prepayId"];
  req.nonceStr = params[@"nonceStr"];
  req.timeStamp = [params[@"timeStamp"] intValue];
  req.package = params[@"package"];
  req.sign = params[@"sign"];
  
  [WXApi sendReq:req completion:^(BOOL success) {
    if (success) {
      // 请求发送成功，等待回调
      resolve(nil); // 添加resolve解决Promise
    } else {
      reject(@"pay_error", @"Failed to send payment request", nil);
    }
  }];
}

// 分享链接
- (void)shareLink:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  // 检查参数
  if (!params[@"webpageUrl"] || !params[@"title"]) {
    reject(@"share_error", @"Missing required share link parameters", nil);
    return;
  }
  
  // 检查微信是否已安装
  if (![WXApi isWXAppInstalled]) {
    reject(@"share_error", @"WeChat is not installed", nil);
    return;
  }
  
  WXWebpageObject *webpage = [WXWebpageObject object];
  webpage.webpageUrl = params[@"webpageUrl"];
  
  WXMediaMessage *message = [WXMediaMessage message];
  message.title = params[@"title"];
  message.description = params[@"description"] ?: @"";
  
  // 处理缩略图 - 异步加载以避免阻塞主线程
  if (params[@"thumbUrl"]) {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      NSData *imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:params[@"thumbUrl"]]];
      UIImage *thumbImage = imageData ? [UIImage imageWithData:imageData] : nil;
      
      dispatch_async(dispatch_get_main_queue(), ^{
        if (thumbImage) {
          [message setThumbImage:thumbImage];
        }
        
        message.mediaObject = webpage;
        
        SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
        req.bText = NO;
        req.message = message;
        req.scene = [params[@"scene"] intValue];
        
        [WXApi sendReq:req completion:^(BOOL success) {
          if (success) {
            // 请求发送成功，等待回调
            resolve(nil); // 添加resolve解决Promise
          } else {
            reject(@"share_error", @"Failed to send share request", nil);
          }
        }];
      });
    });
  } else {
    // 无缩略图的情况
    message.mediaObject = webpage;
    
    SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
    req.bText = NO;
    req.message = message;
    req.scene = [params[@"scene"] intValue];
    
    [WXApi sendReq:req completion:^(BOOL success) {
      if (success) {
        // 请求发送成功，等待回调
        resolve(nil); // 添加resolve解决Promise
      } else {
        reject(@"share_error", @"Failed to send share request", nil);
      }
    }];
  }
}

// 分享图片
- (void)shareImage:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  // 检查参数
  if (!params[@"image"]) {
    reject(@"share_error", @"Missing image URL", nil);
    return;
  }
  
  // 检查微信是否已安装
  if (![WXApi isWXAppInstalled]) {
    reject(@"share_error", @"WeChat is not installed", nil);
    return;
  }
  
  // 异步加载图片
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSData *imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:params[@"image"]]];
    
    if (!imageData) {
      dispatch_async(dispatch_get_main_queue(), ^{
        reject(@"share_error", @"Failed to load image", nil);
      });
      return;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
      WXImageObject *imageObject = [WXImageObject object];
      imageObject.imageData = imageData;
      
      WXMediaMessage *message = [WXMediaMessage message];
      message.mediaObject = imageObject;
      
      // 创建缩略图
      UIImage *image = [UIImage imageWithData:imageData];
      UIImage *thumbImage = [self thumbnailWithImage:image size:CGSizeMake(100, 100)];
      [message setThumbImage:thumbImage];
      
      SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
      req.bText = NO;
      req.message = message;
      req.scene = [params[@"scene"] intValue];
      
      [WXApi sendReq:req completion:^(BOOL success) {
        if (success) {
          // 请求发送成功，等待回调
          resolve(nil); // 添加resolve解决Promise
        } else {
          reject(@"share_error", @"Failed to send share request", nil);
        }
      }];
    });
  });
}

// 创建缩略图方法
- (UIImage *)thumbnailWithImage:(UIImage *)image size:(CGSize)size {
  UIGraphicsBeginImageContextWithOptions(size, NO, 0.0);
  [image drawInRect:CGRectMake(0, 0, size.width, size.height)];
  UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();
  return newImage;
}

// 处理微信回调
- (void)onResp:(BaseResp *)resp {
  if ([resp isKindOfClass:[SendAuthResp class]]) {
    // 登录回调
    SendAuthResp *authResp = (SendAuthResp *)resp;
    [self emitOnAuthResponse:@{
      @"errCode": @(authResp.errCode),
      @"errStr": authResp.errStr ?: @"",
      @"code": authResp.code ?: @"",
      @"state": authResp.state ?: @""
    }];
  } else if ([resp isKindOfClass:[PayResp class]]) {
    // 支付回调
    PayResp *payResp = (PayResp *)resp;
    [self emitOnAuthResponse:@{
      @"errCode": @(payResp.errCode),
      @"errStr": payResp.errStr ?: @""
    }];
  } else if ([resp isKindOfClass:[SendMessageToWXResp class]]) {
    // 分享回调
    SendMessageToWXResp *shareResp = (SendMessageToWXResp *)resp;
    [self emitOnAuthResponse:@{
      @"errCode": @(shareResp.errCode),
      @"errStr": shareResp.errStr ?: @""
    }];
  }
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRTNWechatSpecJSI>(params);
}

@end 
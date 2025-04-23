#import "RTNWechat.h"
#import <WXApi.h>

@interface RTNWechat() <WXApiDelegate>
@end

@implementation RTNWechat

RCT_EXPORT_MODULE()

// 在这里需要初始化微信SDK
-(instancetype)init {
  self = [super init];
  if (self) {
    // 你需要在这里设置你自己的微信AppID
    [WXApi registerApp:@"wx12345678" universalLink:@"https://www.baidu.com"];
  }
  return self;
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
    } else {
      reject(@"pay_error", @"Failed to send payment request", nil);
    }
  }];
}

// 分享链接
- (void)shareLink:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  WXWebpageObject *webpage = [WXWebpageObject object];
  webpage.webpageUrl = params[@"webpageUrl"];
  
  WXMediaMessage *message = [WXMediaMessage message];
  message.title = params[@"title"];
  message.description = params[@"description"];
  // 处理缩略图
  NSData *imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:params[@"thumbUrl"]]];
  [message setThumbImage:[UIImage imageWithData:imageData]];
  message.mediaObject = webpage;
  
  SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
  req.bText = NO;
  req.message = message;
  req.scene = [params[@"scene"] intValue];
  
  [WXApi sendReq:req completion:^(BOOL success) {
    if (success) {
      // 请求发送成功，等待回调
    } else {
      reject(@"share_error", @"Failed to send share request", nil);
    }
  }];
}

// 分享图片
- (void)shareImage:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  WXImageObject *imageObject = [WXImageObject object];
  NSData *imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:params[@"image"]]];
  imageObject.imageData = imageData;
  
  WXMediaMessage *message = [WXMediaMessage message];
  message.mediaObject = imageObject;
  [message setThumbImage:[UIImage imageWithData:imageData]];
  
  SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
  req.bText = NO;
  req.message = message;
  req.scene = [params[@"scene"] intValue];
  
  [WXApi sendReq:req completion:^(BOOL success) {
    if (success) {
      // 请求发送成功，等待回调
    } else {
      reject(@"share_error", @"Failed to send share request", nil);
    }
  }];
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
#import <React/RCTBridgeModule.h>
@interface RCT_EXTERN_MODULE(AntiSpoofing, NSObject)
RCT_EXTERN_METHOD(detect:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end

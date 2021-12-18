#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReactNativeLottieBuilder, NSObject)


RCT_EXTERN_METHOD(setColor:(NSNumber * _Nonnull)tag
                  withKeypath:(NSString * _Nonnull)keypath
                  red:(double)r
                  green:(double)g
                  blue:(double)b
                  andAlpha:(double)a);

RCT_EXTERN_METHOD(setFloat:(NSNumber * _Nonnull)tag
                  withKeypath:(NSString * _Nonnull)keypath
                  andValue:(double)value);

RCT_EXTERN_METHOD(setPoint:(NSNumber * _Nonnull)tag
                  withKeypath:(NSString * _Nonnull)keypath
                  x:(double)x
                  andY:(double)y);

RCT_EXTERN_METHOD(setSize:(NSNumber * _Nonnull)tag
                  withKeypath:(NSString * _Nonnull)keypath
                  width:(double)w
                  andHeight:(double)h);

RCT_EXTERN_METHOD(getCompositionSize:(NSNumber * _Nonnull)tag
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject);

@end

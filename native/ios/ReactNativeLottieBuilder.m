#import <React/RCTBridgeModule.h>
#import <CoreGraphics/CoreGraphics.h>

@interface RCT_EXTERN_MODULE(ReactNativeLottieBuilder, NSObject)


RCT_EXTERN_METHOD(setColor:(NSNumber * _Nonnull)tag
                  withKeypath:(NSString * _Nonnull)keypath
                  red:(CGFloat)r
                  green:(CGFloat)g
                  blue:(CGFloat)b
                  andAlpha:(CGFloat)a);

RCT_EXTERN_METHOD(setFloat:(NSNumber * _Nonnull)tag
                  withKeypath:(NSString * _Nonnull)keypath
                  andValue:(CGFloat)value);

RCT_EXTERN_METHOD(setPoint:(NSNumber * _Nonnull)tag
                  withKeypath:(NSString * _Nonnull)keypath
                  x:(CGFloat)x
                  andY:(CGFloat)y);

RCT_EXTERN_METHOD(setSize:(NSNumber * _Nonnull)tag
                  withKeypath:(NSString * _Nonnull)keypath
                  width:(CGFloat)w
                  andHeight:(CGFloat)h);

RCT_EXTERN_METHOD(getCompositionSize:(NSNumber * _Nonnull)tag
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(hitTestLayerAtPt:(NSNumber * _Nonnull)tag
                  x:(CGFloat)x
                  y:(CGFloat)y
                  radius:(NSInteger)radius
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(setLayerHighlight:(NSNumber * _Nonnull)tag
                  layerIndex:(NSInteger)layerIndex
                  enabled:(NSInteger)enabled
                  red:(CGFloat)r
                  green:(CGFloat)g
                  blue:(CGFloat)b
                  alpha:(CGFloat)a
                  weight:(CGFloat)weight);

RCT_EXTERN_METHOD(setLayerHidden:(NSNumber * _Nonnull)tag
                  layerIndex:(NSInteger)layerIndex
                  hidden:(NSInteger)hidden);

RCT_EXTERN_METHOD(setLayerText:(NSNumber * _Nonnull)tag
                  layerIndex:(NSInteger)layerIndex
                  text:(NSString * _Nonnull)text);

@end

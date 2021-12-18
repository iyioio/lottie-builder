import React
import Lottie

@objc(ReactNativeLottieBuilder)
class ReactNativeLottieBuilder: NSObject {

    var bridge: RCTBridge!

    @objc(setColor:withKeypath:red:green:blue:andAlpha:)
    func setColor(_ tag:NSNumber, keypath: String, r:CGFloat, g:CGFloat, b:CGFloat, a:CGFloat)->Void
    {

      guard let anView = findAnimationView(tag) else {
        return
      }

      let fillKeypath = AnimationKeypath(keypath: keypath)

      let provider = ColorValueProvider(Color(r:r,g:g,b:b,a:a))

      anView.setValueProvider(provider, keypath: fillKeypath)
    }

    @objc(setFloat:withKeypath:andValue:)
    func setFloat(_ tag:NSNumber, keypath: String, value:CGFloat)->Void
    {

      guard let anView = findAnimationView(tag) else {
        return
      }

      let fillKeypath = AnimationKeypath(keypath: keypath)

      let provider = FloatValueProvider(value)

      anView.setValueProvider(provider, keypath: fillKeypath)
    }

    @objc(setPoint:withKeypath:x:andY:)
    func setPoint(_ tag:NSNumber, keypath: String, x:CGFloat, y:CGFloat)->Void
    {

      guard let anView = findAnimationView(tag) else {
        return
      }

      let fillKeypath = AnimationKeypath(keypath: keypath)

      let provider = PointValueProvider(CGPoint(x:x,y:y))

      anView.setValueProvider(provider, keypath: fillKeypath)
    }

    @objc(setSize:withKeypath:width:andHeight:)
    func setSize(_ tag:NSNumber, keypath: String, w:CGFloat, h:CGFloat)->Void
    {

      guard let anView = findAnimationView(tag) else {
        return
      }

      let fillKeypath = AnimationKeypath(keypath: keypath)

      let provider = SizeValueProvider(CGSize(width:w,height:h))

      anView.setValueProvider(provider, keypath: fillKeypath)
    }

    @objc(getCompositionSize:withReslover:andRejector:)
    func getCompositionSize(_ tag:NSNumber, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock)->Void
    {

      guard let size = findAnimationView(tag)?.animation?.size else {
        reject("1","AnimationView not found",nil)
        return
      }

      resolve(["width":size.width,"height":size.height])
    }

    private func findAnimationView(_ tag:NSNumber)->AnimationView?
    {
        guard let view = self.bridge.uiManager.view(forReactTag: tag) else {
            return nil
        }

        return findAnimationViewSub(view)
    }

    private func findAnimationViewSub(_ view:UIView)->AnimationView?
    {

      guard let an = view as? AnimationView else {
        for sub in view.subviews {
          let anSub=findAnimationViewSub(sub)
          if anSub != nil {
            return anSub
          }
        }

        return nil
      }

      return an;

    }
}

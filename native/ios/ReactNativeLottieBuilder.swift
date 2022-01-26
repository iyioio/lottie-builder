import React
import Lottie
import Foundation
import SwiftUI

@available(iOS 13.0, *)
@objc(ReactNativeLottieBuilder)
class ReactNativeLottieBuilder: NSObject {

    @objc var bridge: RCTBridge!
    
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc(setColor:withKeypath:red:green:blue:andAlpha:)
    func setColor(_ tag:NSNumber, keypath: String, r:CGFloat, g:CGFloat, b:CGFloat, a:CGFloat)->Void
    {
        DispatchQueue.main.async {

            guard let anView = self.findAnimationView(tag) else {
                return
            }

            let fillKeypath = AnimationKeypath(keypath: keypath)

            let provider = ColorValueProvider(Color(r:r,g:g,b:b,a:a))

            anView.setValueProvider(provider, keypath: fillKeypath)
        }
    }

    @objc(setFloat:withKeypath:andValue:)
    func setFloat(_ tag:NSNumber, keypath: String, value:CGFloat)->Void
    {
        DispatchQueue.main.async {

            guard let anView = self.findAnimationView(tag) else {
                return
            }

            let fillKeypath = AnimationKeypath(keypath: keypath)

            let provider = FloatValueProvider(value)

            anView.setValueProvider(provider, keypath: fillKeypath)
        }
    }

    @objc(setPoint:withKeypath:x:andY:)
    func setPoint(_ tag:NSNumber, keypath: String, x:CGFloat, y:CGFloat)->Void
    {
        DispatchQueue.main.async {

            guard let anView = self.findAnimationView(tag) else {
                return
            }

            let fillKeypath = AnimationKeypath(keypath: keypath)

            let provider = PointValueProvider(CGPoint(x:x,y:y))

            anView.setValueProvider(provider, keypath: fillKeypath)
        }
    }

    @objc(setSize:withKeypath:width:andHeight:)
    func setSize(_ tag:NSNumber, keypath: String, w:CGFloat, h:CGFloat)->Void
    {
        DispatchQueue.main.async {

            guard let anView = self.findAnimationView(tag) else {
                return
            }

            let fillKeypath = AnimationKeypath(keypath: keypath)

            let provider = SizeValueProvider(CGSize(width:w,height:h))

            anView.setValueProvider(provider, keypath: fillKeypath)
        }
    }

    @objc(getCompositionSize:withResolver:withRejecter:)
    func getCompositionSize(_ tag:NSNumber, resolve:@escaping RCTPromiseResolveBlock,  reject:@escaping RCTPromiseRejectBlock)->Void
    {
        DispatchQueue.main.async {

            guard let size = self.findAnimationView(tag)?.animation?.size else {
                reject("1","AnimationView not found",nil)
                return
            }

            resolve(["width":size.width,"height":size.height])
        }
    }

    private var lastHit: CALayer?

    private func toViewCords(_ anView:AnimationView, _ _x: CGFloat, _ _y: CGFloat) -> CGPoint?
    {
        guard let size = anView.animation?.size else {
            return nil
        }

        let frame=anView.frame
        let aAr=size.width/size.height
        let vAr=frame.width/frame.height


        if vAr < aAr { // view is taller than animation
            let scale=frame.width/size.width
            let x = _x * scale
            let y = _y * scale + (frame.height - size.height*scale) / 2
            return CGPoint(x: x, y: y)
        }else{
            let scale=frame.height/size.height
            let y = _y * scale
            let x = _x * scale + (frame.width - size.width*scale) / 2
            return CGPoint(x: x, y: y)
        }
    }

    private static let maxHitTestRadius=100
    private let pixels = UnsafeMutablePointer<CUnsignedChar>.allocate(capacity:maxHitTestRadius*2*maxHitTestRadius*2*4)
    private let colorSpace = CGColorSpaceCreateDeviceRGB()
    private let bitmapInfo = CGBitmapInfo(rawValue:CGImageAlphaInfo.premultipliedLast.rawValue)
    private var _context : CGContext?
    private var contextRadius : Int = -1
    private var contextTransX:CGFloat = 0
    private var contextTransY:CGFloat = 0

    // Returns the alpha value of the of the most opace pixel at the given point and radius
    private func getAlpha(_ layer:CALayer, _ point:CGPoint, _ radius:Int) -> CGFloat?
    {
        let r:Int = radius < 0 ? 0 :
            ( radius > ReactNativeLottieBuilder.maxHitTestRadius ? ReactNativeLottieBuilder.maxHitTestRadius : radius )

        let dm=r*2

        self.pixels.initialize(repeating: 0, count: dm*dm*4)

        if _context == nil || contextRadius != r {
            contextRadius = r
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            let bitmapInfo = CGBitmapInfo(rawValue:CGImageAlphaInfo.premultipliedLast.rawValue)
            _context = CGContext(
                data: pixels,
                width: dm,
                height: dm,
                bitsPerComponent: 8,
                bytesPerRow: dm*4,
                space: colorSpace,
                bitmapInfo: bitmapInfo.rawValue)
        }

        guard let context = _context else
        {
            return nil
        }
        context.translateBy(x: contextTransX, y: contextTransY)
        contextTransX=round(point.x - CGFloat(r))
        contextTransY=round(point.y - CGFloat(r))
        context.translateBy(x: -contextTransX, y: -contextTransY)

        layer.render(in: context)

        var alpha:CGFloat = 0

        //let alpha=CGFloat(pixels[3])/255.0

        let rd=Double(r)

        for xp in 0...dm {
            let xr=Double(r-xp)
            for yp in 0...dm {
                let yr=Double(r-yp)
                if sqrt(xr*xr + yr*yr) > rd {
                    continue
                }
                let a = CGFloat(pixels[xp * yp * 4])/255.0
                if a > alpha {
                    alpha = a
                }
            }
        }

        return alpha
    }

    @objc(hitTestLayerAtPt:x:y:radius:withResolver:withRejecter:)
    func hitTestLayerAtPt(_ tag:NSNumber, x:CGFloat, y:CGFloat, radius: Int,
                      resolve:@escaping RCTPromiseResolveBlock,  reject:@escaping RCTPromiseRejectBlock)->Void
    {
        DispatchQueue.main.async {

            var i:Int = -1

            guard let anView = self.findAnimationView(tag),
                  let lc = anView.layer.sublayers?.count,
                  let layers = lc == 0 ? nil : anView.layer.sublayers?[0].sublayers,
                  let pt=self.toViewCords(anView,x,y) else
            {
                resolve(["index":i])
                return
            }

            i = layers.count
            for layer in layers.reversed() {
                i -= 1
                let converted = layer.convert(pt, from: anView.layer)
                if let alpha = self.getAlpha(layer,converted,radius) {
                    //print("color[\(i)] = \(alpha)")

                    if(alpha > 0){
                        resolve(["index":layers.count-1-i])
                        return
                    }
                }
            }

            i = -1
            resolve(["index":i])
        }
    }

    @objc(setLayerHighlight:layerIndex:enabled:red:green:blue:alpha:weight:)
    func setLayerHighlight(_ tag:NSNumber, _ layerIndex:Int, _ enabled:Int, r:CGFloat, g:CGFloat, b:CGFloat, a:CGFloat, weight:CGFloat) -> Void
    {
        DispatchQueue.main.async {

            guard let layer = self.getLayer(tag, layerIndex) else
            {
                return
            }

            if enabled == 0 {
                layer.shadowColor = nil
                layer.shadowOpacity=0
            }else{
                layer.shadowColor = CGColor(red: r, green: g, blue: b, alpha: 1)
                layer.shadowRadius=weight
                layer.shadowOpacity=Float(a)
                layer.shadowOffset=CGSize(width: 0, height: 0)
            }
        }
    }

    @objc(setLayerHidden:layerIndex:hidden:)
    func setLayerHidden(_ tag:NSNumber, _ layerIndex:Int, _ hidden:Int) -> Void
    {
        DispatchQueue.main.async {

            guard let layer = self.getLayer(tag, layerIndex) else
            {
                return
            }

            layer.isHidden = hidden != 0
        }
    }

    @objc(setLayerText:layerIndex:text:)
    func setLayerText(_ tag:NSNumber, _ layerIndex:Int, _ text:String) -> Void
    {
        // not supported
//        DispatchQueue.main.async {
//
//            guard
//                let layer = self.getLayer(tag, layerIndex),
//                let txt = self.findTextLayer(layer)
//            else
//            {
//                return
//            }
//
//            txt.text = text
//        }
    }

    func getLayer(_ tag:NSNumber, _ layerIndex:Int) -> CALayer?
    {

        guard let anView = self.findAnimationView(tag),
              let lc = anView.layer.sublayers?.count,
              let layers = lc == 0 ? nil : anView.layer.sublayers?[0].sublayers,
              layers.count>layerIndex && layerIndex>=0 else
        {
            return nil
        }

        return layers[layers.count-1-layerIndex]
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

    // TextLayer from the Lottie framework needs to be public for this to work
//    private func findTextLayer(_ layer:CALayer)->TextLayer?
//    {
//
//        if let txt = layer as? TextLayer {
//            return txt
//        }
//
//        guard let subs = layer.sublayers else {
//            return nil
//        }
//
//        for sub in subs {
//            if let txt = findTextLayer(sub) {
//                return txt
//            }
//        }
//
//        return nil
//
//    }
}

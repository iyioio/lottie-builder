import { findNodeHandle, NativeModules, Platform, View } from 'react-native';
import type { Size, Accelerator } from '@iyio/lottie-builder';

let logNativeCalls=false;

/**
 * When enabled all native class will be logged using console.debug
 */
export function setLogNativeCalls(enabled:boolean)
{
    logNativeCalls=enabled;
}

const LINKING_ERROR =
  `The package '@iyio/react-native-lottie-builder' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const ReactNativeLottieBuilder = NativeModules.ReactNativeLottieBuilder
  ? NativeModules.ReactNativeLottieBuilder
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * Sets the color value of the target object. convertToNativeColor can be used to convert hex colors
 * into their red, green, blue and alpha components.
 * @param tag React native tag of a LottieView or a view that contains a LottieView
 * @param keyPath A path to the target object
 * @param red Red value as floating point value 0 to 1
 * @param green Green value as floating point value 0 to 1
 * @param blue Blue value as floating point value 0 to 1
 * @param alpha Alpha value as floating point value 0 to 1
 */
export function setColor(
  tag: number,
  keyPath: string,
  red: number,
  green: number,
  blue: number,
  alpha: number
): void {
    if(logNativeCalls){
        console.debug('setColor',{tag, keyPath, red, green, blue, alpha})
    }
    assertNumbers(tag,red,green,blue,alpha)
    ReactNativeLottieBuilder.setColor(tag, keyPath, red, green, blue, alpha);
}

export function setFloat(tag: number, keyPath: string, value: number): void {
    if(logNativeCalls){
        console.debug('setFloat',{tag, keyPath, value})
    }
    assertNumbers(tag,value)
    ReactNativeLottieBuilder.setFloat(tag, keyPath, value);
}

/**
 * Sets the point value of the target object
 * @param tag React native tag of a LottieView or a view that contains a LottieView
 * @param keyPath A path to the target object
 * @param x X value
 * @param y Y value
 */
export function setPoint(
  tag: number,
  keyPath: string,
  x: number,
  y: number
): void {
    if(logNativeCalls){
        console.debug('setPoint',{tag, keyPath, x, y})
    }
    assertNumbers(tag,x,y)
    ReactNativeLottieBuilder.setPoint(tag, keyPath, x, y);
}

/**
 * Sets the size value of the target object
 * @param tag React native tag of a LottieView or a view that contains a LottieView
 * @param keyPath A path to the target object
 * @param width Width value
 * @param height Height value
 */
export function setSize(
  tag: number,
  keyPath: string,
  width: number,
  height: number
): void {
    if(logNativeCalls){
        console.debug('setSize',{tag, keyPath, width, height})
    }
    assertNumbers(tag,width,height)
    ReactNativeLottieBuilder.setSize(tag, keyPath, width, height);
}

/**
 * Returns the width and height of the current composition rendered by a LottieView.
 * @param tag React native tag of a LottieView or a view that contains a LottieView
 * @returns width and height of a composition
 */
export async function getCompositionSizeAsync(
  tag: number
): Promise<Size> {
    if(logNativeCalls){
        console.debug('getCompositionSize',{tag})
    }
    let attempt=1;
    while(true){
        try{
            return await ReactNativeLottieBuilder.getCompositionSize(tag);
        }catch(ex:any){
            if(attempt>10){
                throw ex;
            }
            attempt++;
            await delayAsync(100);
        }
    }
}

/**
 * Returns the layer at the given point. Hit testing is performed based on the alpha value of the
 * pixel at the given point
 * @param tag React native tag of a LottieView or a view that contains a LottieView
 * @param x X position
 * @param y Y position
 * @param radius radius of the hit test area to use
 */
export async function hitTestLayerAtPtAsync(tag:number,x:number,y:number,radius:number):Promise<number>
{
    if(logNativeCalls){
        console.debug('getLayerIndexAtPt',{tag,x,y,radius})
    }
    assertNumbers(tag,x,y,radius)
    const r=await ReactNativeLottieBuilder.hitTestLayerAtPt(tag,x,y,radius);
    return r?r.index:-1;
}

/**
 * Turn highlighting on or off for a layer
 * @param tag React native tag of a LottieView or a view that contains a LottieView
 * @param layerIndex index of the layer
 * @param enabled controls if highlighting is turned on or off. 1 = on, 0 = off
 */
export function setLayerHighlight(
    tag:number,
    layerIndex:number,
    enabled:number,
    red: number,
    green: number,
    blue: number,
    alpha: number,
    weight: number)
{
    if(logNativeCalls){
        console.debug('setLayerHighlight',{tag,layerIndex,enabled,red,green,blue,alpha,weight})
    }
    assertNumbers(tag,layerIndex)
    ReactNativeLottieBuilder.setLayerHighlight(tag,layerIndex,enabled,red,green,blue,alpha,weight);
}

/**
 * Hides or shows a layer
 * @param tag React native tag of a LottieView or a view that contains a LottieView
 * @param layerIndex index of the layer
 * @param hidden controls if the layer is to be hidden or not
 */
export function setLayerHidden(
    tag:number,
    layerIndex:number,
    hidden:boolean)
{
    if(logNativeCalls){
        console.debug('setLayerHidden',{tag,layerIndex,hidden})
    }
    assertNumbers(tag,layerIndex)
    ReactNativeLottieBuilder.setLayerHidden(tag,layerIndex,hidden?1:0);
}

/**
 * Hides or shows a layer
 * @param tag React native tag of a LottieView or a view that contains a LottieView
 * @param layerIndex index of the layer
 * @param hidden controls if the layer is to be hidden or not
 */
export function setLayerText(
    tag:number,
    layerIndex:number,
    text:string)
{
    if(logNativeCalls){
        console.debug('setLayerText',{tag,layerIndex,text})
    }
    assertNumbers(tag,layerIndex)
    ReactNativeLottieBuilder.setLayerText(tag,layerIndex,text||'');
}

/**
 * A lottie-builder accelerator for ReactNative
 */
export class ReactNativeAccelerator implements Accelerator{

    private readonly tag:number;

    public constructor(elemOrTag:View|{current:any}|number)
    {
        if(typeof elemOrTag === 'number'){
            this.tag=elemOrTag;
        }else{
            if(!elemOrTag){
                throw new Error('elemOrTag should either be a View reference')
            }
            const et:any=elemOrTag;
            const t=findNodeHandle(et.current?et.current:et);
            if(t===null){
                throw new Error('elemOrTag should either be a View reference')
            }
            this.tag=t;
        }
    }

    public setColor(keyPath: string, color: string) {
        const ary=convertToNativeColor(color);
        setColor(this.tag,keyPath, ary[0], ary[1], ary[2], ary[3]);
    }

    public setFloat( keyPath: string, value: number) {
        setFloat(this.tag,keyPath, value);
    }

    public setPoint( keyPath: string, x: number, y: number) {
        setPoint(this.tag,keyPath, x, y);
    }

    public setSize(keyPath: string,width: number,height: number) {
        setSize(this.tag,keyPath, width, height);
    }

    public getCompositionSizeAsync(): Promise<Size> {
        return getCompositionSizeAsync(this.tag);
    }

    public hitTestLayerAtPtAsync(x:number,y:number,radius:number):Promise<number>
    {
        return hitTestLayerAtPtAsync(this.tag,x,y,radius);
    }

    public setLayerHighlight(
        layerIndex:number,
        enabled:boolean,
        color: string,
        weight: number)
    {
        const ary=convertToNativeColor(color);
        return setLayerHighlight(this.tag,layerIndex,enabled?1:0,ary[0],ary[1],ary[2],ary[3],weight);
    }

    public setLayerHidden(layerIndex:number,hidden:boolean)
    {
        return setLayerHidden(this.tag,layerIndex,hidden);
    }
}

/**
 * Converts a hex string to a native floating point array
 * @param color A hex string
 * @returns
 */
export function convertToNativeColor(color:string):[number,number,number,number]
{
    if(color && color.startsWith('#')){
        color=color.substr(1);
    }
    if(!color){
        return [0,0,0,1];
    }
    switch(color.length){

        // [rgb]FF
        case 1:
            color=color+color+color+color+color+color+'FF';
            break;

        // [rgb][a]
        case 2:
            color=color[0]+color[0]+color[0]+color[0]+color[0]+color[0]+color[1]+color[1];
            break;

        // [r][g][b]FF
        case 3:
            color=color[0]+color[0]+color[1]+color[1]+color[2]+color[2]+'FF';
            break;

        // [r][g][b][a]
        case 4:
            color=color[0]+color[0]+color[1]+color[1]+color[2]+color[2]+color[3]+color[3];
            break;

        // [r][g][b][a0][a1]
        case 5:
            color=color[0]+color[0]+color[1]+color[1]+color[2]+color[2]+color[3]+color[4];
            break;

        // [r0][r1][g0][g1][b0][b1]FF
        case 6:
            color+='FF';
            break;

        // [r0][r1][g0][g1][b0][b1][a]
        case 7:
            color+=color[6];
            break;
    }

    return [
        Number('0x'+color.substr(0,2))/255,
        Number('0x'+color.substr(2,2))/255,
        Number('0x'+color.substr(4,2))/255,
        Number('0x'+color.substr(6,2))/255,
    ];
}


function delayAsync(delayMs:number):Promise<void>
{
    delayMs=Math.round(delayMs);
    return new Promise((r)=>{
        if(delayMs<=0){
            r();
        }else{
            setTimeout(()=>{
                r();
            },delayMs);
        }
    });
}

function assertNumbers(...numbers:number[])
{
    for(const n of numbers){
        if(isNaN(n)){
            throw new Error('Value is NaN');
        }
    }
}

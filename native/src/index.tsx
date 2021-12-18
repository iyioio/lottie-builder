import { NativeModules, Platform } from 'react-native';

export type Size={ width: number; height: number }

export type ResizeMode = "cover" | "contain" | "center";

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
    ReactNativeLottieBuilder.setColor(tag, keyPath, red, green, blue, alpha);
}

export function setFloat(tag: number, keyPath: string, value: number): void {
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
    ReactNativeLottieBuilder.setSize(tag, keyPath, width, height);
}

/**
 * Returns the width and height of the current composition rendered by a LottieView.
 * @param tag React native tag of a LottieView or a view that contains a LottieView
 * @returns width and height of a composition
 */
export async function getCompositionSizeAsync(
  tag: number
): Promise<{ width: number; height: number }> {
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

/**
 * Can be used as an accelerator for the lottie-builder package. Without an accelerator lottie-builder
 * regenerates the full AnimationView of a LottieView for every property change which is very bad
 * for transforming objects in real time.
 */
export class LottieBuilderAccelerator{

    public setColor(tag: number, keyPath: string, color: string) {
        const ary=convertToNativeColor(color);
        setColor(tag, keyPath, ary[0], ary[1], ary[2], ary[3]);
    }

    public setFloat(tag: number, keyPath: string, value: number) {
        setFloat(tag, keyPath, value);
    }

    public setPoint(tag: number, keyPath: string, x: number, y: number) {
        setPoint(tag, keyPath, x, y);
    }

    public setSize(tag: number,keyPath: string,width: number,height: number) {
        setSize(tag, keyPath, width, height);
    }

    public getCompositionSizeAsync(tag: number): Promise<Size> {
        return getCompositionSizeAsync(tag);
    }
}



/**
 * Converts a point from the coordinate system of a viewport or view to the coordinate
 * system of a composition. This function assumes the a resizeMode of contain is being used.
 * @param x Viewport x
 * @param y Viewport y
 * @param viewPortSize Size of the viewport/View
 * @param compSize Size of the target composition
 * @param resizeMode
 * @returns The converted point
 */
export function viewportPointToCompPoint(x:number,y:number,viewPortSize:Size,compSize:Size,resizeMode:ResizeMode):{x:number,y:number}
{
    var vAr=viewPortSize.width/viewPortSize.height;
    var cAr=compSize.width/compSize.height;

    switch(resizeMode){

        case 'contain':
            if(vAr<cAr){//viewport is taller than composition
                const scale=compSize.width/viewPortSize.width;
                x*=scale;
                y=y*scale-(viewPortSize.height*scale-compSize.height)/2;
            }else{
                const scale=compSize.height/viewPortSize.height;
                y*=scale;
                x=x*scale-(viewPortSize.width*scale-compSize.width)/2;
            }
            break;

        case 'cover':
            if(vAr<cAr){//viewport is taller than composition
                const scale=compSize.height/viewPortSize.height;
                y*=scale;
                x=x*scale-(viewPortSize.width*scale-compSize.width)/2;
            }else{
                const scale=compSize.width/viewPortSize.width;
                x*=scale;
                y=y*scale-(viewPortSize.height*scale-compSize.height)/2;
            }
            break;

        case 'center':
            x+=(compSize.width-viewPortSize.width)/2;
            y+=(compSize.height-viewPortSize.height)/2;
            break;
    }

    return {x,y};
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

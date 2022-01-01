export enum ObjectType {
    Animation = 0,
    Layer = 1,
    Asset = 2
}

export type ObjectChangeListener=(objType:ObjectType,obj:any)=>void;


export enum BlendMode {
  NORMAL = 0,
  MULTIPLY = 1,
  SCREEN = 2,
  OVERLAY = 3,
  DARKEN = 4,
  LIGHTEN = 5,
  COLOR_DODGE = 6,
  COLOR_BURN = 7,
  HARD_LIGHT = 8,
  SOFT_LIGHT = 9,
  DIFFERENCE = 10,
  EXCLUSION = 11,
  HUE = 12,
  SATURATION = 13,
  COLOR = 14,
  LUMINOSITY = 15,
}

export enum MatteMode {
  NORMAL,
  ALPHA,
  INVERTED_ALPHA,
  LUMA,
  INVERTED_LUMA,
}

export enum LayerType {
  PRECOMPOSITION = 0,
  SOLID = 1,
  IMAGE = 2,
  GROUP = 3,
  SHAPE = 4,
  TEXT = 5,
  AUDIO = 6,
  VIDEO_PLACEHOLDER = 7,
  IMAGE_SEQUENCE = 8,
  VIDEO = 9,
  IMAGE_PLACEHOLDER = 10,
  GUIDE = 11,
  ADJUSTMENT = 12,
  CAMERA = 13,
  LIGHT = 14,
}

export type Size={ width: number; height: number }

export type Size3D={ width: number; height: number, depth:number }

export type Point={x:number,y:number}

export type Point3D={x:number,y:number,z:number}

export type ResizeMode = "cover" | "contain" | "center";

export interface PropertyInfo
{
    /**
     * Name of the property
     */
    name:string;

    /**
     * If true the property will point ot a defined on its wrapper class 
     */
    wrapped?:boolean;
}

/**
 * Maps minified property names to full property names
 */
export interface PropertyMap
{
    [name:string]:PropertyInfo;
}

export interface AdditionalProperties
{
    [minName:string]:any;
}

export interface SourceObject
{
    [name:string]:any;
}


export const IsNode=Symbol();

export function createRevPropMap(propMap:PropertyMap):PropertyMap
{
    const rev:PropertyMap={};
    for(const e in propMap){
        const info=propMap[e];
        rev[info.name]={name:e,wrapped:info.wrapped};
    }
    return rev;
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
export function viewportPointToCompPoint(x:number,y:number,viewPortSize:Size,compSize:Size,resizeMode:ResizeMode):Point
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
 * Creates a new unique Id
 * @see https://github.com/firebase/firebase-js-sdk/blob/6abd6484730971e2390b2b9acbb61800852fb350/packages/firestore/src/util/misc.ts
 */
export function newId(): string {
    // Alphanumeric characters
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
        autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
}

/**
 * Converts a hex string to a lottie color array of floating point numbers
 * @param color A hex string
 */
export function convertToLottieColor(color:string):[number,number,number,number]
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
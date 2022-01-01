export interface TransformOptions
{
    /**
     * Position x
     */
    x?:number;

    /**
     * Position y
     */
    y?:number;

    /**
     * Position z
     */
    z?:number;
    
    anchorX?:number;

    anchorY?:number;

    anchorZ?:number;

    scale?:number;

    scaleX?:number;

    scaleY?:number;

    scaleZ?:number;

    rotation?:number;

    opacity?:number;
}

export interface TransformOptionsWithSize extends TransformOptions
{
    width?:number;
    height?:number;
}

export function createTransform({
    x=0,
    y=0,
    z=0,
    anchorX=0,
    anchorY=0,
    anchorZ=0,
    scale=1,
    scaleX,
    scaleY,
    scaleZ,
    rotation=0,
    opacity=1
}:TransformOptions):TransformSource
{
    return {
        o:{
            a:0,
            k:opacity*100,
            ix:11
        },
        r:{
            a:0,
            k:rotation,
            ix:10
        },
        p:{
            a:0,
            k:[
                x,
                y,
                z,
            ],
            ix:2
        },
        a:{
            a:0,
            k:[
                anchorX,
                anchorY,
                anchorZ,
            ],
            ix:1
        },
        s:{
            a:0,
            k:[
                (scaleX??scale)*100,
                (scaleY??scale)*100,
                (scaleZ??scale)*100,
            ],
            ix:6
        }
    }
}

export interface TransformSource {
    /**
     * Opacity
     */
    o: TransformValue;

    /**
     * Rotation
     */
    r: TransformValue;

    /**
     * Position
     */
    p: TransformArrayValue;

    /**
     * Anchor Point
     */
    a: TransformArrayValue;

    /**
     * Scale
     */
    s: TransformArrayValue;
}

export interface TransformArrayValue {
    a:  number;

    /**
     * Value
     */
    k:  number[];
    ix: number;
}

export interface TransformValue {


    a:  number;

    /**
     * Value
     */
    k:  number;

    ix: number;
}

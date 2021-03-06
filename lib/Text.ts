import { convertToLottieColorRGB } from "./common";

export interface TextDataSource {

    /**
     * Main data
     */
    d: TextData_D;
    p: TextData_P;
    m: TextData_M;
    a: any[];
}

export interface TextData_D {
    k: TextData_K[];
}

export interface TextData_K {
    s: TextData;
    t: number;
}

export interface TextData {

    /**
     * Font size
     */
    s:  number;
    /**
     * Font family
     */
    f:  string;
    /**
     * Text
     */
    t:  string;
    j:  number;
    tr: number;
    lh: number;
    ls: number;

    /**
     * Font color array
     */
    fc: number[];
}

export interface TextData_M {
    g: number;
    a: TextData_A;
}

export interface TextData_A {
    a:  number;
    k:  number[];
    ix: number;
}

export interface TextData_P {
}

export const defaultFontSize=36;
export const defaultFontColor='#333333';
export const defaultFontFamily='Arial';

export interface TextDataOptions
{
    fontSize?:number;
    fontFamily?:string;
    fontColor?:string;
    text?:string;
}

export function createTextDataFrom(options:TextDataOptions|string):TextDataSource
{
    return createTextData(typeof options === 'string'?{text:options}:options)
}

export function createTextData({
    fontSize=defaultFontSize,
    fontFamily=defaultFontFamily,
    fontColor=defaultFontColor,
    text='',
}:TextDataOptions):TextDataSource
{
    return {
        d:{
            k:[
                {
                    s:{
                        s:fontSize,
                        f:fontFamily,
                        t:text,
                        j:2,
                        tr:0,
                        lh:43.2,
                        ls:0,
                        fc:convertToLottieColorRGB(fontColor)
                    },
                    t:0
                }
            ]
        },
        p:{},
        m:{
            g:1,
            a:{
                a:0,
                k:[
                    0,
                    0
                ],
                ix:2
            }
        },
        a:[]
    }
}
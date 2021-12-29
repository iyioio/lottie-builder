import { Size } from "./common";

export interface Accelerator{

    setColor(keyPath: string, color: string):void;

    setFloat(keyPath: string, value: number):void;

    setPoint(keyPath: string, x: number, y: number):void;

    setSize(eyPath: string,width: number,height: number):void;

    getCompositionSizeAsync():Promise<Size>;

    getLayerIndexAtPtAsync(x:number,y:number):Promise<number>;

    setLayerHighlight(layerIndex:number, enabled:boolean, color: string, weight: number):void;
}
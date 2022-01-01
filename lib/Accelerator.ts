import type { Size } from "./common";
import { Composition } from "./Composition";

/**
 * Used to accelerate mutations to a composition. By default all composition mutations require
 * a reload of the composition's animation source.
 */
export interface Accelerator{

    setColor?(keyPath: string, color: string):void;

    setFloat?(keyPath: string, value: number):void;

    setPoint?(keyPath: string, x: number, y: number):void;

    setSize?(eyPath: string,width: number,height: number):void;

    hitTestLayerAtPtAsync?(x:number,y:number,radius:number):Promise<number>;

    setLayerHighlight?(layerIndex:number, enabled:boolean, color: string, weight: number):void;

    setLayerHidden?(layerIndex:number,hidden:boolean):void;

    setLayerText?(layerIndex:number,text:string):void;
}

/**
 * An accelerator that wraps another accelerator and falls back to source reloading
 */
export class FallbackAccelerator implements Accelerator
{

    private readonly acc:Accelerator|undefined;

    private readonly comp:Composition;

    private readonly reload:()=>void;

    public constructor(comp:Composition, reload:()=>void, acc?:Accelerator)
    {
        this.acc=acc;
        this.comp=comp;
        this.reload=reload;
    }

    public setColor(keyPath: string, color: string):void
    {
        if(this.acc?.setColor){
            this.acc.setColor(keyPath,color);
        }else{
            this.reload();
        }
    }

    public setFloat(keyPath: string, value: number):void
    {
        if(this.acc?.setFloat){
            this.acc.setFloat(keyPath,value);
        }else{
            this.reload();
        }
    }

    public setPoint(keyPath: string, x: number, y: number):void
    {
        if(this.acc?.setPoint){
            this.acc.setPoint(keyPath,x,y);
        }else{
            this.reload();
        }
    }

    public setSize(keyPath: string,width: number,height: number):void
    {
        if(this.acc?.setSize){
            this.acc.setSize(keyPath,width,height);
        }else{
            this.reload();
        }
    }

    public async hitTestLayerAtPtAsync(x:number,y:number,radius:number):Promise<number>
    {
        if(this.acc?.hitTestLayerAtPtAsync){
            return await this.acc.hitTestLayerAtPtAsync(x,y,radius);
        }else{
            return this.comp.getLayerAtPt(x,y,radius)?.index??-1;
        }
    }

    public setLayerHighlight(layerIndex:number, enabled:boolean, color: string, weight: number):void
    {
        if(this.acc?.setLayerHighlight){
            this.acc.setLayerHighlight(layerIndex,enabled,color,weight);
        }else{
            // not supported
        }
    }

    public setLayerHidden(layerIndex:number,hidden:boolean):void
    {
        if(this.acc?.setLayerHidden){
            this.acc.setLayerHidden(layerIndex,hidden);
        }else{
            this.reload();
        }
    }

    public setLayerText(layerIndex:number,text:string):void
    {   
        if(this.acc?.setLayerText){
            this.acc.setLayerText(layerIndex,text);
        }else{
            this.reload();
        }
    }
}
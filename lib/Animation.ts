import { Accelerator } from "./Accelerator";
import { Asset } from "./Asset";
import { createRevPropMap, SourceObject } from "./common";
import { createLayer, Layer } from "./Layer";
import { Marker } from "./Marker";
import { Meta } from "./Meta";
import { Node } from './Node';

export const AnimationPropMap={
    frameRate:{name:'fr'},
    height:{name:'h'},
    isPoint:{name:'ip'},
    is3D:{name:'ddd'},
    name:{name:'nm'},
    outPoint:{name:'op'},
    version:{name:'v'},
    width:{name:'w'},
    assets:{name:'assets',wrapped:true},
    layers:{name:'layers',wrapped:true},
    markers:{name:'markers',wrapped:true},
    meta:{name:'meta',wrapped:true},
}

export interface AnimationObject {
    v: string;
    fr: number;
    ip: number;
    op: number;
    w: number;
    h: number;
    nm: string;
    ddd: number;
    assets: any[];
    layers: any[];
  }
export const AnimationRevPropMap=createRevPropMap(AnimationPropMap);

export class Animation extends Node
{
    public readonly accelerator?:Accelerator;

    public get name():string|undefined{return this.getValue(AnimationPropMap.name)}
    public set name(value:string|undefined){this.setValue(AnimationPropMap.name,value)}

    public get width():number|undefined{return this.getValue(AnimationPropMap.width)}
    public set width(value:number|undefined){this.setValue(AnimationPropMap.width,value)}

    public get height():number|undefined{return this.getValue(AnimationPropMap.height)}
    public set height(value:number|undefined){this.setValue(AnimationPropMap.height,value)}

    public get frameRate():number|undefined{return this.getValue(AnimationPropMap.frameRate)}
    public set frameRate(value:number|undefined){this.setValue(AnimationPropMap.frameRate,value)}

    public get isPoint():number|undefined{return this.getValue(AnimationPropMap.isPoint)}
    public set isPoint(value:number|undefined){this.setValue(AnimationPropMap.isPoint,value)}

    public get is3D():boolean|undefined{return this.getValue(AnimationPropMap.is3D)}
    public set is3D(value:boolean|undefined){this.setValue(AnimationPropMap.is3D,value)}

    public get outPoint():number|undefined{return this.getValue(AnimationPropMap.outPoint)}
    public set outPoint(value:number|undefined){this.setValue(AnimationPropMap.outPoint,value)}

    public get version():string|undefined{return this.getValue(AnimationPropMap.version)}
    public set version(value:string|undefined){this.setValue(AnimationPropMap.version,value)}

    private layerLookup:{[name:string]:Layer}={}
    public readonly layers:Layer[]|undefined;

    public readonly markers:Marker[]|undefined;

    public readonly assets:Asset[]|undefined;

    public readonly meta:Meta|undefined;

    public constructor(source:SourceObject, accelerator?:Accelerator)
    {
        super(source,AnimationPropMap,AnimationRevPropMap);

        this.accelerator=accelerator;
        this.layers=this.mapProp(AnimationPropMap.layers,s=>createLayer(this,s));
        this.markers=this.mapProp(AnimationPropMap.markers,s=>new Marker(s));
        this.assets=this.mapProp(AnimationPropMap.assets,s=>new Asset(s));
        this.meta=this.mapProp(AnimationPropMap.meta,s=>new Meta(s))?.[0];

        this.updateLayerLookup();

    }

    private updateLayerLookup(){
        this.layerLookup={}
        if(this.layers){
            for(const l of this.layers){
                const name=l.name;
                if(name){
                    this.layerLookup[name]=l;
                }
            }
        }
    }

    public getAnimationObject():AnimationObject
    {
        return this.getSource() as AnimationObject;
    }

    public getLayer(name:string):Layer|null
    {
        return this.layerLookup[name]||null;
    }

    public async getLayerAtPtAsync(x:number,y:number):Promise<Layer|null>
    {
        if(!this.accelerator || !this.layers){
            return null;
        }
        const index=await this.accelerator.getLayerIndexAtPtAsync(x,y);
        if(index<0 || index>=this.layers.length){
            return null;
        }

        return this.layers[index];
    }
}
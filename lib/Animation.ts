import { BlendMode, LayerType } from "@lottiefiles/lottie-js";
import { Accelerator } from "./Accelerator";
import { Asset } from "./Asset";
import { createRevPropMap, newId, SourceObject } from "./common";
import { createEvent, EventSource } from './Event';
import { createLayer, Layer, LayerPropMap } from "./Layer";
import { Marker } from "./Marker";
import { Meta } from "./Meta";
import { Node } from './Node';
import { cloneObj, deepCompare, KeyComparer } from "./util";

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

    private assetLookup:{[name:string]:Asset}={}
    public readonly assets:Asset[]|undefined;

    public readonly meta:Meta|undefined;

    private readonly onSourceChangeSrc:EventSource=createEvent();
    public get onSourceChange(){return this.onSourceChangeSrc.evt}

    public constructor(
        source:SourceObject,
        accelerator?:Accelerator,
        cloneSource:boolean=true)
    {
        super(
            cloneSource?cloneObj(source):source,
            AnimationPropMap,
            AnimationRevPropMap);

        this.accelerator=accelerator;
        this.layers=this.mapProp(AnimationPropMap.layers,s=>createLayer(this,s));
        this.markers=this.mapProp(AnimationPropMap.markers,s=>new Marker(s));
        this.assets=this.mapProp(AnimationPropMap.assets,s=>new Asset(s));
        this.meta=this.mapProp(AnimationPropMap.meta,s=>new Meta(s))?.[0];

        this.updateLayerLookup();
        this.updateAssetLookup();

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

    private updateAssetLookup(){
        this.assetLookup={}
        if(this.assets){
            for(const a of this.assets){
                const id=a.id;
                if(id){
                    this.assetLookup[id]=a;
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

    public getAsset(id:string):Asset|null
    {
        return this.assetLookup[id]||null;
    }

    private getUniqueAssetId(prefix:string):string
    {
        return prefix+'_'+newId();
    }

    private getUniqueLayerName(name:string):string
    {
        if(!this.layerLookup[name]){
            return name;
        }

        return name+'_'+newId();
    }

    private remapLayerRefs(layers:SourceObject[], id:string, newId:string, sourceId:string)
    {
        for(const l of layers){
            if(l.refId===id){
                l.refId=newId;
            }
        }
    }

    private assetKeyComparer:KeyComparer=(
        key:string,
        depth:number,
        newAsset:any,
        existingAsset:any,
        state:any)=>
    {
        if(depth===0){
            return key==='id'?true:undefined;
        }

        if(key!=='refId' || !newAsset.refId || newAsset.refId===existingAsset.refId){
            return undefined;
        }

        const inComingAssets:SourceObject[]=state;
        if(!inComingAssets){
            return undefined;
        }

        let inComingRefed:SourceObject|null=null;
        for(const a of inComingAssets){
            if(a.id===newAsset.refId){
                inComingRefed=a;
                break;
            }
        }

        if(!inComingRefed){
            return undefined;
        }

        const existingRefed=this.getAsset(existingAsset.refId)?.getSource();
        if(!existingRefed){
            return undefined;
        }

        return deepCompare(inComingRefed,existingRefed,this.assetKeyComparer,state,200-depth)
        
        
    }

    private getMatchingAsset(asset:SourceObject, inComingAssets:SourceObject[], stopIndex?:number):SourceObject|null
    {
        const ary=this.source.assets;
        if(!ary){
            return null;
        }
        for(let i=0;i<ary.length;i++){
            const a=ary[i];
            if(deepCompare(asset,a,this.assetKeyComparer,inComingAssets)){
                return a;
            }
            if(i===stopIndex){
                break;
            }
        }
        return null;
    }

    /**
     * Adds the assets of the given animation to this animation and remaps
     * asset ids. Duplicate assets will be merged.
     * @param animation 
     */
    private addAssets(animation:SourceObject, sourceId:string, triggerSourceChange=true)
    {
        const assets=animation.assets;
        if(!assets?.length){
            return;
        }

        const layers=animation.layers;

        const stopIndex=(this.assets?.length||0)-1;

        for(const a of assets){
            const id=a.id;
            let add=true;
            if(this.assetLookup[id]){// remap
                const match=this.getMatchingAsset(a,animation.assets,stopIndex);
                if(match){
                    add=false;
                }
                if(!match || match.id!==id){
                    const newId=match?.id||this.getUniqueAssetId(id);
                    a.id=newId;
                    if(layers){
                        this.remapLayerRefs(layers,id,newId,sourceId);
                    }
                    for(const layerAsset of assets){
                        if(layerAsset.layers){
                            this.remapLayerRefs(layerAsset.layers,id,newId,sourceId);
                        }
                    }
                }
            }

            if(add){
                this.addAsset(a,false);
            }
        }

        if(triggerSourceChange){
            this.swapSource();
        }
    }

    public addPrecomposition(
        animation:SourceObject,
        sourceId:string,
        name:string,
        x?:number,
        y?:number,
        width?:number,
        height?:number): Layer
    {
        if(!animation.layers){
            throw new Error('source.layers expected')
        }

        animation=cloneObj(animation);

        if(x===undefined){
            x=(this.width||0)/2
        }
        if(y===undefined){
            y=(this.height||0)/2
        }
        if(width===undefined){
            width=animation[AnimationPropMap.width.name]||100;
        }
        if(height===undefined){
            height=animation[AnimationPropMap.height.name]||100;
        }

        this.addAssets(animation,sourceId,false);

        name=this.getUniqueLayerName(name);

        let comp:SourceObject={
            id:this.getUniqueAssetId('comp'),
            layers:animation.layers
        }

        const matchingComp=this.getMatchingAsset(comp,animation.assets);
        if(matchingComp){
            comp=matchingComp;
        }

        const layerSource={
            [LayerPropMap.name.name]:name,
            [LayerPropMap.is3D.name]:0,
            [LayerPropMap.type.name]:LayerType.PRECOMPOSITION,
            [LayerPropMap.index.name]:this.layers?.length||0,
            [LayerPropMap.refId.name]:comp.id,
            [LayerPropMap.startTime.name]:1,
            [LayerPropMap.autoOrient.name]:0,
            [LayerPropMap.width.name]:width,
            [LayerPropMap.height.name]:height,
            [LayerPropMap.inPoint.name]:0,// todo - lookup
            [LayerPropMap.outPoint.name]:150,// todo - lookup
            [LayerPropMap.startTime.name]:0,
            [LayerPropMap.blendMode.name]:BlendMode.NORMAL,
            [LayerPropMap.transform.name]:{
                "o":{
                    "a":0,
                    "k":100,
                    "ix":11
                },
                "r":{
                    "a":0,
                    "k":0,
                    "ix":10
                },
                "p":{
                    "a":0,
                    "k":[
                        x,
                        y,
                        0
                    ],
                    "ix":2
                },
                "a":{
                    "a":0,
                    "k":[
                        0,
                        0,
                        0
                    ],
                    "ix":1
                },
                "s":{
                    "a":0,
                    "k":[
                        100,
                        100,
                        100
                    ],
                    "ix":6
                }
            }
        }

        if(!matchingComp){
            this.addAsset(comp,false);
        }

        const layer=this.addLayer(layerSource,false);

        this.swapSource();

        return layer;
    }

    public addLayer(layerSource:SourceObject, triggerSourceChange=true):Layer
    {
        if(!this.source.layers){
            this.source.layers=[];
        }
        this.source.layers.push(layerSource);
        const layer=createLayer(this,layerSource);
        this.layers?.push(layer);
        this.updateLayerLookup();
        if(triggerSourceChange){
            this.swapSource();
        }
        return layer;
    }

    public addAsset(assetSource:SourceObject, triggerSourceChange=true)
    {
        if(!this.source.assets){
            this.source.assets=[];
        }
        this.source.assets.push(assetSource);
        const asset=new Asset(assetSource);
        this.assets?.push(asset);
        this.updateAssetLookup();
        if(triggerSourceChange){
            this.swapSource();
        }
        return asset;
    }

    override swapSource()
    {
        const current=super.swapSource();
        this.onSourceChangeSrc.trigger();
        return current;
    }
}
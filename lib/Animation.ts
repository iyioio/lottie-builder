import { BlendMode, LayerType } from "@lottiefiles/lottie-js";
import { Accelerator } from "./Accelerator";
import { Asset } from "./Asset";
import { createRevPropMap, newId, SourceObject } from "./common";
import { createEvent, EventSource } from './Event';
import { createLayer, Layer, LayerPropMap } from "./Layer";
import { Marker } from "./Marker";
import { Meta } from "./Meta";
import { Node } from './Node';
import { aryRemoveItem, cloneObj, deepCompare, KeyComparer } from "./util";

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
    public readonly layers:Layer[];

    public readonly markers:Marker[]|undefined;

    private assetLookup:{[name:string]:Asset}={}
    public readonly assets:Asset[];

    public readonly meta:Meta|undefined;

    private readonly onSourceChangeSrc:EventSource=createEvent();
    public get onSourceChange(){return this.onSourceChangeSrc.evt}

    private get sourceLayers():SourceObject[]{return this.source.layers}
    private get sourceAssets():SourceObject[]{return this.source.assets}

    public constructor(
        source:SourceObject,
        accelerator?:Accelerator,
        cloneSource:boolean=true)
    {
        super(
            cloneSource?source=cloneObj(source):source,
            AnimationPropMap,
            AnimationRevPropMap);

        if(!source.layers){
            source.layers=[];
        }

        if(!source.assets){
            source.assets=[];
        }

        this.accelerator=accelerator;
        this.layers=this.mapProp(AnimationPropMap.layers,s=>createLayer(this,s))||[];
        this.markers=this.mapProp(AnimationPropMap.markers,s=>new Marker(s));
        this.assets=this.mapProp(AnimationPropMap.assets,s=>new Asset(s))||[];
        this.meta=this.mapProp(AnimationPropMap.meta,s=>new Meta(s))?.[0];

        this.updateLayerLookup();
        this.updateAssetLookup();

    }

    public getAnimationObject():AnimationObject
    {
        return this.getSource() as AnimationObject;
    }



      //////////////
     /// Layers ///
    //////////////

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

    public addLayer(layerSource:SourceObject, index:number=0, triggerSourceChange=true):Layer
    {

        if(index>this.sourceLayers.length){
            index=this.sourceLayers.length-1;
        }

        if(index<0){
            index=0;
        }

        this.sourceLayers.splice(index,0,layerSource);
        const layer=createLayer(this,layerSource);
        this.layers.splice(index,0,layer);
        this.updateLayerLookup();
        this.updateLayerIndexes();
        if(triggerSourceChange){
            this.swapSource();
        }
        return layer;
    }

    public removeLayer(layer:Layer, triggerSourceChange=true):boolean
    {
        const layerSource=layer.getSource();
        if(!aryRemoveItem(this.sourceLayers,layerSource)){
            return false;
        }

        aryRemoveItem(this.layers,layer);

        if(layerSource.refId){
            const count=this.getAssetRefCount(layerSource.refId);
            if(!count){
                this.removeAsset(layerSource.refId,false);
            }
        }

        this.updateLayerLookup();
        this.updateLayerIndexes();

        if(triggerSourceChange){
            this.swapSource();
        }

        return true;
    }

    public addPrecomposition(
        animation:SourceObject,
        sourceId:string,
        name:string,
        index?:number,
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
            [LayerPropMap.index.name]:0,
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

        const layer=this.addLayer(layerSource,index);

        this.swapSource();

        return layer;
    }

    public setLayerIndex(layer:Layer, index:number): boolean
    {
        const current=this.layers.indexOf(layer);
        if(current===-1){
            return false
        }

        if(index>=this.layers.length){
            index=this.layers.length-1;
        }

        if(index<0){
            index=0;
        }

        if(index===current){
            return true;
        }

        this.layers.splice(current,1);
        this.sourceLayers.splice(current,1);

        this.layers.splice(index,0,layer);
        this.sourceLayers.splice(index,0,layer.getSource());

        this.updateLayerIndexes();

        this.swapSource();

        console.log('\n\n'+this.layers.map(l=>`${l.index} -  ${l.name}`).join('\n'))

        return true;
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

    private updateLayerIndexes()
    {
        for(let i=0;i<this.sourceLayers.length;i++){
            const l=this.sourceLayers[i];
            l[LayerPropMap.index.name]=i;
        }
    }

    private getUniqueLayerName(name:string):string
    {
        if(!this.layerLookup[name]){
            return name;
        }

        return name+'_'+newId();
    }




      //////////////
     /// Assets ///
    //////////////

    public getAsset(id:string):Asset|null
    {
        return this.assetLookup[id]||null;
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

    public removeAsset(id:string, triggerSourceChange=true):boolean
    {

        if(!this.assetLookup[id]){
            return false;
        }

        const src=this.sourceAssets.find(a=>a.id===id);
        const asset=this.assets.find(a=>a.id===id);

        aryRemoveItem(this.sourceAssets,src);
        aryRemoveItem(this.assets,asset);

        if(src?.layers){
            for(const l of src.layers){
                if(l.refId && this.getAssetRefCount(l.refId)===0){
                    this.removeAsset(l.refId,false);
                }
            }
        }

        this.updateAssetLookup();

        if(triggerSourceChange){
            this.swapSource();
        }

        return true;
    }

    private getUniqueAssetId(prefix:string):string
    {
        return prefix+'_'+newId();
    }

    private getAssetLayerRefCount(layers:SourceObject[], id:string):number
    {
        let count=0;

        for(const l of layers){
            if(l.refId===id){
                count++;
            }
        }

        return count;
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

    private getAssetRefCount(id:string):number
    {
        let count=this.getAssetLayerRefCount(this.sourceLayers,id);

        for(const a of this.sourceAssets){
            if(a.layers){
                count+=this.getAssetLayerRefCount(a.layers,id);
            }
        }

        return count;
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

    override swapSource()
    {
        const current=super.swapSource();
        this.onSourceChangeSrc.trigger();
        return current;
    }
}
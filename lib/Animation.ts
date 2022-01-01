import { BlendMode, LayerType } from "@lottiefiles/lottie-js";
import { Accelerator } from "./Accelerator";
import { Asset } from "./Asset";
import { createRevPropMap, defaultTextColor, defaultTextFont, defaultTextSize, newId, ObjectChangeListener, ObjectType, SourceObject } from "./common";
import { createEvent, EventSource, EventSourceT } from './Event';
import { createLayer, Layer, LayerPropMap, PrecompositionLayer, TextLayer, TextLayerPropMap } from "./Layer";
import { Marker } from "./Marker";
import { Meta } from "./Meta";
import { Node } from './Node';
import { aryRemoveItem, cloneObj, deepCompare, KeyComparer } from "./util";

/**
 * The shape of the root object of a lottie file
 */
export interface AnimationObject {
    v:string;
    fr:number;
    ip:number;
    op:number;
    w:number;
    h:number;
    nm:string;
    ddd:number;
    assets:any[];
    layers:any[];
}

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

export const AnimationRevPropMap=createRevPropMap(AnimationPropMap);

/**
 * The Animation class represents a lottie file. The Animation class wraps a lottie JSON object.
 * Lottie animations are After Effects composition exported using the bodymovin plugin.
 * 
 * Animations primary consists of layers and assets. Each layer represents a layer within an 
 * After Effects composition. Each asset represents an asset within an After Effects project. By
 * default all unused assets are removed from exported lottie files. Assets can also contain layers
 * but the layers within assets are not wrapped by lottie-builder and are there for not mutable.
 */
export class Animation extends Node
{
    /**
     * An object that is capable of interacting with a lottie file in native code. Accelerators 
     * Make it possible to mutate a lottie file in real time without having to reload it's source.
     */
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

    private readonly onObjectChangeSrc:EventSourceT<ObjectChangeListener>=createEvent();
    public get onObjectChange(){return this.onObjectChangeSrc.evt}

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

    public _triggerObjectChange(type:ObjectType, obj:any)
    {
        this.onObjectChangeSrc.trigger(type,obj);
    }

    /**
     * Creates a deep clone of the animation
     */
    public clone():Animation
    {
        return new Animation(this.getSource(),this.accelerator,true);
    }

    /**
     * Returns an optimized lottie file from the current state of the animation. All hidden
     * layers of the exported animation and all unused assets are removed.
     */
    public export():AnimationObject
    {
        const clone=this.clone();
        clone.removeHiddenLayers();
        return clone.getAnimationObject();
    }

    /**
     * Returns an animation object that can be used as the source of a LottieView
     */
    public getAnimationObject():AnimationObject
    {
        return this.getSource() as AnimationObject;
    }



      //////////////
     /// Layers ///
    //////////////

    /**
     * Returns a layer by name. If multiple layers have the same name then the first matched layer
     * is returned.
     */
    public getLayer(name:string):Layer|null
    {
        return this.layerLookup[name]||null;
    }

    /**
     * Returns the top most layer at the given point. Hit testing is performed based on pixel opacity
     * @param x X position
     * @param y Y position
     * @param radius The outwards radius from x and y to hit test
     */
    public async getLayerAtPtAsync(x:number,y:number,radius:number=8):Promise<Layer|null>
    {
        if(!this.accelerator || !this.layers){
            return null;
        }
        const index=await this.accelerator.getLayerIndexAtPtAsync(x,y,radius);
        if(index<0 || index>=this.layers.length){
            return null;
        }

        return this.layers[index];
    }

    /**
     * Adds a layer to the animation.
     * @param layerSource A layer source object. layerSource should use the same format as layers
     *                    exported by the bodymovin plugin. This object will be mutated by changes
     *                    to the returned Layer object.
     * @param index The index which to insert the layer at
     * @param triggerSourceChange If true a SourceChange event will be triggered
     * @returns A Layer object warping the given sourceLayer
     */
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

    /**
     * Removes the given layer from the animation. 
     * @param layer The layer to remove
     * @param removeUnusedAssets If true any assets that are exclusively used by the given
     *                           layer will be removed.
     * @returns Returns true if the layer was removed. If the given layer is not part of the
     *          animation false is returned.
     */
    public removeLayer(layer:Layer, removeUnusedAssets:boolean=true, triggerSourceChange=true):boolean
    {
        const layerSource=layer.getSource();
        if(!aryRemoveItem(this.sourceLayers,layerSource)){
            return false;
        }

        aryRemoveItem(this.layers,layer);

        if(layerSource.refId && removeUnusedAssets){
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

    /**
     * Removes all hidden layers
     * @returns The number of layers removed
     */
    public removeHiddenLayers():number
    {
        const layers=this.layers.filter(l=>l.isHidden);
        if(layers.length===0){
            return 0;
        }
        for(const l of layers){
            this.removeLayer(l,true,false);
        }
        this.swapSource();
        return layers.length;
    }

    /**
     * Adds a new text layer to the animation
     * @param text Text to add
     * @param name Name of the layer to be added
     * @param name The name the layer will be given
     * @param index The index which to insert the layer
     * @param x The X position where to place the layer. If undefined the layer will be centered.
     * @param y The Y position where to place the layer. If undefined the layer will be centered.
     * @param size Font size
     * @param color Font color
     * @param font Font family
     * @returns 
     */
    public addTextLayer(
        text:string,
        name:string,
        index?:number,
        x?:number,
        y?:number,
        size:number=defaultTextSize,
        color:string=defaultTextColor,
        font:string=defaultTextFont
    ):TextLayer{

        const textData=TextLayer.createTextData(text,size,color,font);

        if(x===undefined){
            x=(this.width||0)/2
        }
        if(y===undefined){
            y=(this.height||0)/2
        }

        const layerSource={
            [TextLayerPropMap.textData.name]: textData,
            [LayerPropMap.is3D.name]: 0,
            [LayerPropMap.index.name]: 0,
            [LayerPropMap.type.name]: LayerType.TEXT,
            [LayerPropMap.name.name]: name,
            [LayerPropMap.timeStretch.name]: 1,
            [LayerPropMap.autoOrient.name]: 0,
            [LayerPropMap.inPoint.name]:this.isPoint,
            [LayerPropMap.outPoint.name]:this.outPoint,
            [LayerPropMap.startTime.name]: 0,
            [LayerPropMap.blendMode.name]: BlendMode.NORMAL,
            [LayerPropMap.transform.name]: {
                "o": {
                    "a": 0,
                    "k": 100,
                    "ix": 11
                },
                "r": {
                    "a": 0,
                    "k": 0,
                    "ix": 10
                },
                "p": {
                    "a": 0,
                    "k": [
                        x,
                        y,
                        0
                    ],
                    "ix": 2
                },
                "a": {
                    "a": 0,
                    "k": [
                        0,
                        0,
                        0
                    ],
                    "ix": 1
                },
                "s": {
                    "a": 0,
                    "k": [
                        100,
                        100,
                        100
                    ],
                    "ix": 6
                }
            },
        }

        const layer=this.addLayer(layerSource,index) as TextLayer;

        this.swapSource();

        return layer;
    }

    /**
     * Imports a lottie file into this animation as a precomposition layer. The lottie file will
     * be converted to an asset and a precomposition layer will be created the references the newly
     * created asset. Assets of the lottie file will be merged with the assets of this animation
     * and any duplicate assets will be mered.
     * @param animation A lottie file. This object will be deeply cloned and not be mutated
     * @param name The name the layer will be given
     * @param index The index which to insert the layer
     * @param x The X position where to place the layer. If undefined the layer will be centered.
     * @param y The Y position where to place the layer. If undefined the layer will be centered.
     * @param width The width to set to the layer to. If undefined the width of the lottie file will
     *              be used
     * @param height The height to set to the layer to. If undefined the height of the lottie file
     *               will be used
     * @returns A PrecompositionLayer representing the imported lottie file
     */
    public importAnimation(
        animation:AnimationObject,
        name:string,
        index?:number,
        x?:number,
        y?:number,
        width?:number,
        height?:number): PrecompositionLayer
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
            width=animation.w||100;
        }
        if(height===undefined){
            height=animation.h||100;
        }

        this.addAssets(animation,false);

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
            [LayerPropMap.inPoint.name]:this.isPoint,
            [LayerPropMap.outPoint.name]:this.outPoint,
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

        const layer=this.addLayer(layerSource,index,false) as PrecompositionLayer;

        this.swapSource();

        return layer;
    }

    /**
     * Sets the index of the given layer
     */
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

    /**
     * Returns an asset by id
     */
    public getAsset(id:string):Asset|null
    {
        return this.assetLookup[id]||null;
    }

    /**
     * Adds a new asset to the animation
     */
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

    /**
     * Removes an asset by id
     * @returns 
     */
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

    private remapLayerRefs(layers:SourceObject[], id:string, newId:string)
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
    private addAssets(animation:SourceObject, triggerSourceChange=true)
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
                        this.remapLayerRefs(layers,id,newId);
                    }
                    for(const layerAsset of assets){
                        if(layerAsset.layers){
                            this.remapLayerRefs(layerAsset.layers,id,newId);
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
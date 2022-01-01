import { Composition } from "./Composition";
import { BlendMode, convertToLottieColor, createRevPropMap, LayerType, MatteMode, ObjectType, Point, Point3D, PropertyMap, Size, Size3D, SourceObject } from "./common";
import { Node } from './Node';
import { createTextData } from "./Text";
import { createTransform, TransformSource } from "./Transform";

export function createLayer(an:Composition,source:SourceObject)
{
    const type:LayerType=source[LayerPropMap.type.name];
    switch(type){
        case LayerType.PRECOMPOSITION:
            return new PrecompositionLayer(an,source);
        case LayerType.SOLID:
            return new SolidLayer(an,source);
        case LayerType.IMAGE:
            return new ImageLayer(an,source);
        case LayerType.GROUP:
            return new GroupLayer(an,source);
        case LayerType.SHAPE:
            return new ShapeLayer(an,source);
        case LayerType.TEXT:
            return new TextLayer(an,source);
        case LayerType.AUDIO:
            return new Layer(an,source);
        case LayerType.VIDEO_PLACEHOLDER:
            return new Layer(an,source);
        case LayerType.IMAGE_SEQUENCE:
            return new Layer(an,source);
        case LayerType.VIDEO:
            return new Layer(an,source);
        case LayerType.IMAGE_PLACEHOLDER:
            return new Layer(an,source);
        case LayerType.GUIDE:
            return new Layer(an,source);
        case LayerType.ADJUSTMENT:
            return new Layer(an,source);
        case LayerType.CAMERA:
            return new Layer(an,source);
        case LayerType.LIGHT:
            return new Layer(an,source);
        
        default:
            return new Layer(an,source);
    }
}

export const LayerPropMap={
    type:{name:'ty'},
    autoOrient:{name:'ao'},
    blendMode:{name:'bm'},
    classNames:{name:'cl'},
    effects:{name:'ef'},
    height:{name:'h'},
    id:{name:'ln'},
    index:{name:'ind'},
    refId:{name:'refId'},
    inPoint:{name:'ip'},
    is3D:{name:'ddd'},
    name:{name:'nm'},
    outPoint:{name:'op'},
    startTime:{name:'st'},
    timeStretch:{name:'sr'},
    width:{name:'w'},
    matteMode:{name:'tt'},
    matteTarget:{name:'td'},
    isHidden:{name:'hd'},
    matchName:{name:'mn'},
    transform:{name:'ks'},
}

export const LayerRevPropMap=createRevPropMap(LayerPropMap);

export class Layer extends Node{

    protected readonly comp:Composition;

    public get type():LayerType|undefined{return this.getValue(LayerPropMap.type)}
    public set type(value:LayerType|undefined){this.setValue(LayerPropMap.type,value)}

    public get autoOrient():number|undefined{return this.getValue(LayerPropMap.autoOrient)}
    public set autoOrient(value:number|undefined){this.setValue(LayerPropMap.autoOrient,value)}

    public get blendMode():BlendMode|undefined{return this.getValue(LayerPropMap.blendMode)}
    public set blendMode(value:BlendMode|undefined){this.setValue(LayerPropMap.blendMode,value)}

    public get classNames():string|undefined{return this.getValue(LayerPropMap.classNames)}
    public set classNames(value:string|undefined){this.setValue(LayerPropMap.classNames,value)}

    public get effects():any|undefined{return this.getValue(LayerPropMap.effects)}
    public set effects(value:any|undefined){this.setValue(LayerPropMap.effects,value)}

    public get width():number|undefined{return this.getValue(LayerPropMap.width)}
    public set width(value:number|undefined){this.setValue(LayerPropMap.width,value)}

    public get height():number|undefined{return this.getValue(LayerPropMap.height)}
    public set height(value:number|undefined){this.setValue(LayerPropMap.height,value)}

    public get id():string|undefined{return this.getValue(LayerPropMap.id)}
    public set id(value:string|undefined){this.setValue(LayerPropMap.id,value)}

    public get inPoint():number|undefined{return this.getValue(LayerPropMap.inPoint)}
    public set inPoint(value:number|undefined){this.setValue(LayerPropMap.inPoint,value)}

    public get is3D():number|undefined{return this.getValue(LayerPropMap.is3D)}
    public set is3D(value:number|undefined){this.setValue(LayerPropMap.is3D,value)}

    public get name():string|undefined{return this.getValue(LayerPropMap.name)}
    public set name(value:string|undefined){this.setValue(LayerPropMap.name,value)}

    public get outPoint():number|undefined{return this.getValue(LayerPropMap.outPoint)}
    public set outPoint(value:number|undefined){this.setValue(LayerPropMap.outPoint,value)}

    public get startTime():number|undefined{return this.getValue(LayerPropMap.startTime)}
    public set startTime(value:number|undefined){this.setValue(LayerPropMap.startTime,value)}

    public get timeStretch():number|undefined{return this.getValue(LayerPropMap.timeStretch)}
    public set timeStretch(value:number|undefined){this.setValue(LayerPropMap.timeStretch,value)}

    public get matteMode():MatteMode|undefined{return this.getValue(LayerPropMap.matteMode)}
    public set matteMode(value:MatteMode|undefined){this.setValue(LayerPropMap.matteMode,value)}

    public get matteTarget():number|undefined{return this.getValue(LayerPropMap.matteTarget)}
    public set matteTarget(value:number|undefined){this.setValue(LayerPropMap.matteTarget,value)}

    public get matchName():string|undefined{return this.getValue(LayerPropMap.matchName)}
    public set matchName(value:string|undefined){this.setValue(LayerPropMap.matchName,value)}

    public get transform():TransformSource|undefined{return this.getValue(LayerPropMap.transform)}
    public set transform(value:any|TransformSource){this.setValue(LayerPropMap.transform,value)}



    public get index():number{
        return this.getValue(LayerPropMap.index)||0;
    }
    public set index(value:number){
        this.comp.setLayerIndex(this,value);
    }



    public get isHidden():boolean{
        return this.getValue(LayerPropMap.isHidden)?true:false;
    }
    public set isHidden(value:boolean){
        this.setValue(LayerPropMap.isHidden,value?1:0);
        this.comp.acc?.setLayerHidden(this.getSourceIndex(),value);
    }

    public constructor(
        an:Composition,
        source:SourceObject,
        propMap:PropertyMap=LayerPropMap,
        revPropMap:PropertyMap=LayerRevPropMap)
    {
        super(source,propMap,revPropMap);
        this.comp=an;
    }

    protected getSourceIndex():number
    {
        return this.comp.layers?.indexOf(this)??-1;
    }

    private getTransform():any
    {
        let trans=this.transform;
        if(!trans){
            trans=createTransform({});
            this.transform=trans;
        }

        // scale
        if(!trans.s){
            trans.s=createTransform({}).s;
        }
        if(!trans.s.k){
            trans.s.k=[100,100,100]
        }

        // position
        if(!trans.p){
            trans.p=createTransform({}).p;
        }
        if(!trans.p.k){
            trans.p.k=[0,0,0]
        }

        // rotation
        if(!trans.r){
            trans.r=createTransform({}).r;
        }
        if(!trans.r.k===undefined){
            trans.r.k=0;
        }

        return trans;
    }

    /**
     * Removes the layer from it's parent composition
     */
    public remove()
    {
        this.comp.removeLayer(this);
    }

    public setScale(scale:number)
    {
        const current=this.getScaleXY();
        this.setScaleXYZ(scale,scale/(current.width/current.height),1);
    }

    public setScaleXY(scaleX:number,scaleY:number)
    {
        this.setScaleXYZ(scaleX,scaleY,1);
    }

    public setScaleXYZ(scaleX:number,scaleY:number,scaleZ:number)
    {
        const trans=this.getTransform();

        trans.s.k=[scaleX*100,scaleY*100,scaleZ*100];
        this.comp.acc?.setSize(`${this.name}.Transform.Scale`,scaleX*100,scaleY*100);
    }

    /**
     * Returns the x scale of the layer. Use getScaleXY or getScale3D if you need the x and y or
     * x, y, and z scales
     */
    public getScale():number
    {
        const trans=this.getTransform();
        return trans.s.k[0]/100;
    }

    public getScaleXY():Size
    {
        const trans=this.getTransform();
        return {width:trans.s.k[0]/100,height:trans.s.k[1]/100}
    }

    public getScale3D():Size3D
    {
        const trans=this.getTransform();
        return {width:trans.s.k[0]/100,height:trans.s.k[1]/100,depth:trans.s.k[2]/100}
    }

    public setPositionXY(x:number,y:number)
    {
        this.setPosition3D(x,y,0);
    }

    public setPosition(pt:Point)
    {
        this.setPosition3D(pt.x,pt.y,0);
    }

    public setPosition3D(x:number,y:number,z:number)
    {
        const trans=this.getTransform();
        trans.p.k=[x,y,z];
        this.comp.acc?.setPoint(`${this.name}.Transform.Position`,x,y);
    }

    public getPosition():Point{
        const trans=this.getTransform();
        return {x:trans.p.k[0],y:trans.p.k[1]}
    }
    public getPosition3D():Point3D{
        const trans=this.getTransform();
        return {x:trans.p.k[0],y:trans.p.k[1],z:trans.p.k[2]}
    }

    public setRotation(deg:number)
    {
        const trans=this.getTransform();
        trans.r.k=deg
        this.comp.acc?.setFloat(`${this.name}.Transform.Rotation`,deg);
    }

    public getRotation():number
    {
        const trans=this.getTransform();
        return trans.r.k;
    }

    public setHighlighted(enabled:boolean)
    {
        this.comp.acc?.setLayerHighlight(this.getSourceIndex(),enabled,'#00ff00',5)
    }

}

export const GroupLayerPropMap={
    ...LayerPropMap
}
export const GroupLayerRevPropMap=createRevPropMap(GroupLayerPropMap);

export class GroupLayer extends Layer{

    public constructor(an:Composition,source:SourceObject)
    {
        super(an,source,GroupLayerPropMap,GroupLayerRevPropMap);
    }

}

export const ImageLayerPropMap={
    ...LayerPropMap
}
export const ImageLayerRevPropMap=createRevPropMap(ImageLayerPropMap);

export class ImageLayer extends Layer{

    public get refId():string|undefined{return this.getValue(ImageLayerPropMap.refId)}
    public set refId(value:string|undefined){this.setValue(ImageLayerPropMap.refId,value)}

    public constructor(an:Composition,source:SourceObject)
    {
        super(an,source,ImageLayerPropMap,ImageLayerRevPropMap);
    }

}

export const PrecompositionLayerPropMap={
    timeRemap:{name:'timeRemap'},
    ...LayerPropMap
}
export const PrecompositionLayerRevPropMap=createRevPropMap(PrecompositionLayerPropMap);

export class PrecompositionLayer extends Layer{

    public get refId():string|undefined{return this.getValue(PrecompositionLayerPropMap.refId)}
    public set refId(value:string|undefined){this.setValue(PrecompositionLayerPropMap.refId,value)}

    public get timeRemap():any|undefined{return this.getValue(PrecompositionLayerPropMap.timeRemap)}
    public set timeRemap(value:any|undefined){this.setValue(PrecompositionLayerPropMap.timeRemap,value)}

    public constructor(an:Composition,source:SourceObject)
    {
        super(an,source,PrecompositionLayerPropMap,PrecompositionLayerRevPropMap);
    }

}

export const ShapeLayerPropMap={
    shapes:{name:'shapes'},
    ...LayerPropMap
}
export const ShapeLayerRevPropMap=createRevPropMap(ShapeLayerPropMap);

export class ShapeLayer extends Layer{

    public get shapes():any|undefined{return this.getValue(ShapeLayerPropMap.shapes)}
    public set shapes(value:any|undefined){this.setValue(ShapeLayerPropMap.shapes,value)}

    public constructor(an:Composition,source:SourceObject)
    {
        super(an,source,ShapeLayerPropMap,ShapeLayerRevPropMap);
    }

}

export const SolidLayerPropMap={
    solidColor:{name:'sc'},
    solidHeight:{name:'sh'},
    solidWidth:{name:'sw'},
    ...LayerPropMap
}
export const SolidLayerRevPropMap=createRevPropMap(SolidLayerPropMap);

export class SolidLayer extends Layer{

    public get solidColor():string|undefined{return this.getValue(SolidLayerPropMap.solidColor)}
    public set solidColor(value:string|undefined){this.setValue(SolidLayerPropMap.solidColor,value)}

    public get solidHeight():number|undefined{return this.getValue(SolidLayerPropMap.solidHeight)}
    public set solidHeight(value:number|undefined){this.setValue(SolidLayerPropMap.solidHeight,value)}

    public get solidWidth():number|undefined{return this.getValue(SolidLayerPropMap.solidWidth)}
    public set solidWidth(value:number|undefined){this.setValue(SolidLayerPropMap.solidWidth,value)}

    public constructor(an:Composition,source:SourceObject)
    {
        super(an,source,SolidLayerPropMap,SolidLayerRevPropMap);
    }

}

export const TextLayerPropMap={
    textData:{name:'t'},
    ...LayerPropMap
}
export const TextLayerRevPropMap=createRevPropMap(TextLayerPropMap);

export class TextLayer extends Layer{

    public get textData():any|undefined{return this.getValue(TextLayerPropMap.textData)}
    public set textData(value:any|undefined){this.setValue(TextLayerPropMap.textData,value)}

    public constructor(an:Composition,source:SourceObject)
    {
        super(an,source,TextLayerPropMap,TextLayerRevPropMap);
    }

    private getData()
    {
        if(!this.source[TextLayerPropMap.textData.name]){
            this.source[TextLayerPropMap.textData.name]=createTextData({text:'Text'})
        }
        return this.source[TextLayerPropMap.textData.name];
    }

    public get text():string
    {
        const data=this.getData();
        return data.d.k[0].s.t;
    }

    public set text(value:string)
    {
        const data=this.getData();
        data.d.k[0].s.t=value;
        this.comp.acc.setLayerText(this.getSourceIndex(),value);
    }

}

export function asTextLayer(layer:Layer|null|undefined):TextLayer|null
{
    return layer?.type===LayerType.TEXT?layer as TextLayer:null;

}
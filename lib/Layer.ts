import { Animation } from "./Animation";
import { BlendMode, createRevPropMap, LayerType, MatteMode, Point, Point3D, PropertyMap, Size, Size3D, SourceObject } from "./common";
import { Node } from './Node';

export function createLayer(an:Animation,source:SourceObject)
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

    private readonly an:Animation;

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

    public get index():number|undefined{return this.getValue(LayerPropMap.index)}
    public set index(value:number|undefined){this.setValue(LayerPropMap.index,value)}

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

    public get isHidden():number|undefined{return this.getValue(LayerPropMap.isHidden)}
    public set isHidden(value:number|undefined){this.setValue(LayerPropMap.isHidden,value)}

    public get matchName():string|undefined{return this.getValue(LayerPropMap.matchName)}
    public set matchName(value:string|undefined){this.setValue(LayerPropMap.matchName,value)}

    public get transform():any|undefined{return this.getValue(LayerPropMap.transform)}
    public set transform(value:any|undefined){this.setValue(LayerPropMap.transform,value)}

    public constructor(
        an:Animation,
        source:SourceObject,
        propMap:PropertyMap=LayerPropMap,
        revPropMap:PropertyMap=LayerRevPropMap)
    {
        super(source,propMap,revPropMap);
        this.an=an;
    }
    
    private getTransform():any
    {
        let trans=this.transform;
        if(!trans){
            trans={}
            this.transform=trans;
        }

        // scale
        if(!trans.s){
            trans.s={}
        }
        if(!trans.s.k){
            trans.s.k=[100,100,100]
        }

        // position
        if(!trans.p){
            trans.p={}
        }
        if(!trans.p.k){
            trans.p.k=[0,0,0]
        }

        // rotation
        if(!trans.r){
            trans.r={}
        }
        if(!trans.p.r===undefined){
            trans.p.r=0;
        }

        return trans;
    }

    public setScale(scale:number)
    {
        this.setScaleXYZ(scale,scale,100);
    }

    public setScaleXY(scaleX:number,scaleY:number)
    {
        this.setScaleXYZ(scaleX,scaleY,100);
    }

    public setScaleXYZ(scaleX:number,scaleY:number,scaleZ:number)
    {
        const trans=this.getTransform();

        trans.s.k=[scaleX,scaleY,scaleZ];
        this.an.accelerator?.setSize(`${this.name}.Transform.Scale`,scaleX,scaleY);
    }

    public getScale():Size
    {
        const trans=this.getTransform();
        return {width:trans.s.k[0],height:trans.s.k[1]}
    }

    public getScale3D():Size3D
    {
        const trans=this.getTransform();
        return {width:trans.s.k[0],height:trans.s.k[1],depth:trans.s.k[2]}
    }

    public setPositionXY(x:number,y:number)
    {
        this.setPositionXYZ(x,y,0);
    }

    public setPosition(pt:Point)
    {
        this.setPositionXYZ(pt.x,pt.y,0);
    }

    public setPositionXYZ(x:number,y:number,z:number)
    {
        const trans=this.getTransform();
        trans.p.k=[x,y,z];
        this.an.accelerator?.setPoint(`${this.name}.Transform.Position`,x,y);
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
        this.an.accelerator?.setFloat(`${this.name}.Transform.Rotation`,deg);
    }

    public getRotation():number
    {
        const trans=this.getTransform();
        return trans.r.k;
    }

    public setHighlighted(enabled:boolean)
    {
        this.an.accelerator?.setLayerHighlight(this.an.layers?.indexOf(this)??-1,enabled,'#00ff00',5)
    }

}

export const GroupLayerPropMap={
    ...LayerPropMap
}
export const GroupLayerRevPropMap=createRevPropMap(GroupLayerPropMap);

export class GroupLayer extends Layer{

    public constructor(an:Animation,source:SourceObject)
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

    public constructor(an:Animation,source:SourceObject)
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

    public constructor(an:Animation,source:SourceObject)
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

    public constructor(an:Animation,source:SourceObject)
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

    public constructor(an:Animation,source:SourceObject)
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

    public constructor(an:Animation,source:SourceObject)
    {
        super(an,source,TextLayerPropMap,TextLayerRevPropMap);
    }

}
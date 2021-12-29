import { createRevPropMap, SourceObject } from "./common";
import { Node } from './Node';

export const AssetPropMap={
    id:{name:'id'},
}
export const AssetRevPropMap=createRevPropMap(AssetPropMap);

export class Asset extends Node{

    public get id():string|undefined{return this.getValue(AssetPropMap.id)}
    public set id(value:string|undefined){this.setValue(AssetPropMap.id,value)}

    public constructor(source:SourceObject)
    {
        super(source,AssetPropMap,AssetRevPropMap);
    }

}
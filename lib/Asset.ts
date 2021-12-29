import { createRevPropMap, SourceObject } from "./common";
import { Node } from './Node';

export const AssetPropMap={
}
export const AssetRevPropMap=createRevPropMap(AssetPropMap);

export class Asset extends Node{

    public constructor(source:SourceObject)
    {
        super(source,AssetPropMap,AssetRevPropMap);
    }

}
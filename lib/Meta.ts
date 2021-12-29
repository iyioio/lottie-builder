import { createRevPropMap, SourceObject } from "./common";
import { Node } from './Node';

export const MetaPropMap={
}
export const MetaRevPropMap=createRevPropMap(MetaPropMap);

export class Meta extends Node{

    public constructor(source:SourceObject)
    {
        super(source,MetaPropMap,MetaRevPropMap);
    }

}
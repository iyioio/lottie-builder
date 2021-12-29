import { createRevPropMap, SourceObject } from "./common";
import { Node } from './Node';

export const MarkerPropMap={
}
export const MarkerRevPropMap=createRevPropMap(MarkerPropMap);

export class Marker extends Node{

    public constructor(value:SourceObject)
    {
        super(value,MarkerPropMap,MarkerRevPropMap);
    }

}
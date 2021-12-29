import { AdditionalProperties, PropertyInfo, PropertyMap, SourceObject, IsNode } from "./common";

export class Node
{
    private readonly propMap:PropertyMap;
    private readonly revPropMap:PropertyMap;

    private readonly source:SourceObject;

    public readonly isNode=IsNode;

    public get additionalProps():AdditionalProperties|undefined{
        let ad:AdditionalProperties|undefined=undefined;

        for(const e in this.source){
            if(!this.revPropMap[e]){
                if(!ad){
                    ad={}
                }
                ad[e]=this.source[e];
            }
        }

        return ad;
    }

    public constructor(source:SourceObject,propMap:PropertyMap,revPropMap:PropertyMap)
    {
        this.propMap=propMap;
        this.revPropMap=revPropMap;
        this.source=source;
    }

    public getSource(){
        return this.source;
    }

    public getValue(prop:PropertyInfo):any
    {
        return this.source[prop.name];
    }

    public setValue(prop:PropertyInfo,value:any):any
    {
        if(value===undefined){
            delete this.source[prop.name];
        }else{
            this.source[prop.name]=value;
        }
    }

    protected mapProp<T>(prop:PropertyInfo,mapper:(obj:SourceObject)=>T):T[]|undefined
    {
        const value=this.getValue(prop);

        if(!value){
            return undefined;
        }

        const sourceAry:SourceObject[]=Array.isArray(value)?value:(typeof value === 'object')?[value]:[];

        if(sourceAry.length===0){
            return undefined;
        }

        return sourceAry.map(mapper);
    }

    public toJSON(){
        const r:any={};

        for(const e in this.source){
            const prop=this.revPropMap[e];
            const value=this.source[e];
            
            if(prop){
                r[prop.name]=prop.wrapped?(this as any)[prop.name]:this.source[e];
            }else{
                r[e]=value;
            }
        }

        return r;
    }
}
export function cloneObj<T>(obj:T, maxDepth=200):T
{
    if(maxDepth<0){
        throw new Error('cloneObj max depth reached');
    }
    maxDepth--;
    if(!obj || typeof obj !== 'object'){
        return obj;
    }

    if(Array.isArray(obj)){
        const clone=[];
        for(let i=0;i<obj.length;i++){
            clone.push(cloneObj(obj[i],maxDepth));
        }
        return clone as any;
    }else{
        const clone:any={}
        for(const e in obj){
            clone[e]=cloneObj(obj[e],maxDepth);
        }
        return clone;
    }


}

export type KeyComparer=(key:string,depth:number,a:any,b:any,state:any)=>boolean|undefined;

export function deepCompare(a:any, b:any, keyComparer?:KeyComparer, keyComparerState?:any, maxDepth=200, depth=0):boolean
{
    if(maxDepth<0){
        throw new Error('deepCompare max depth reached');
    }
    maxDepth--;
    const type=typeof a;
    if(type !== (typeof b)){
        return false
    }

    if(type !== 'object'){
        return a===b;
    }

    if(Array.isArray(a)){
        if(a.length!==b.length){
            return false;
        }
        for(let i=0;i<a.length;i++){
            if(!deepCompare(a[i],b[i],keyComparer,keyComparerState,maxDepth,depth+1))
            {
                return false;
            }
        }
    }else{
        let ac=0;
        for(const e in a){
            ac++;
            if(keyComparer){
                const r=keyComparer(e,depth,a,b,keyComparerState);
                if(r===false){
                    return false;
                }else if(r===true){
                    continue;
                }
            }
            if(!deepCompare(a[e],b[e],keyComparer,keyComparerState,maxDepth,depth+1))
            {
                return false;
            }
        }
        let dc=0;
        for(const e in b){
            dc++;
        }
        if(ac!==dc){// ;)
            return false;
        }
    }

    return true;


}

export function aryRemoveItem<T>(ary:T[],item:T):boolean
{
    if(!ary){
        return false;
    }
    for(let i=0;i<ary.length;i++){
        if(ary[i]===item){
            ary.splice(i,1);
            return true;
        }
    }
    return false;
}
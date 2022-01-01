import { aryRemoveItem } from "./util";


// TArg,TObj

export interface ListenersRef<TListener>
{
    listeners?:TListener[];
}

export default class Event<TListener>
{
    private readonly listeners:TListener[]=[];

    public constructor(listenersRef:ListenersRef<TListener>)
    {
        listenersRef.listeners=this.listeners;
    }

    public readonly addListener=(listener:TListener)=>
    {
        this.listeners.push(listener);
        return ()=>{
            this.removeListener(listener);
        }
    }

    public readonly removeListener=(listener:TListener)=>
    {
        aryRemoveItem(this.listeners,listener);
    }
}

export interface EventSourceT<TListener>
{
    evt:Event<TListener>;
    trigger:TListener;
}

export interface EventSource extends EventSourceT<()=>void>
{
    
}


export function createEvent<TListener>():EventSourceT<TListener>
{
    const listeners:ListenersRef<TListener>={}
    const evt=new Event<TListener>(listeners);
    return {
        evt,
        trigger:(
            (...args:any[])=>{
                if(listeners.listeners){
                    for(const l of listeners.listeners){
                        (l as any).apply(null,args);//eslint-disable-line
                    }
                }
            }
        ) as any
    };
}

export function joinRemoveListeners(...listeners:(()=>void)[])
{
    return ()=>{
        if(listeners){
            for(const l of listeners){
                l();
            }
        }
    }
}

export type Size={ width: number; height: number }

/**
 * Converts a point from the coordinate system of a viewport or view to the coordinate
 * system of a composition. This function assumes the a resizeMode of contain is being used.
 * @param x Viewport x
 * @param y Viewport y
 * @param viewPortSize Size of the viewport/View
 * @param compSize Size of the target composition
 * @returns The converted point
 */
export function viewportPointToCompPoint(x:number,y:number,viewPortSize:Size,compSize:Size):{x:number,y:number}
{
    var vAr=viewPortSize.width/viewPortSize.height;
    var cAr=compSize.width/compSize.height;

    if(vAr<cAr){//viewport is taller than composition
        const scale=compSize.width/viewPortSize.width;
        x*=scale;
        y=y*scale-(viewPortSize.height*scale-compSize.height)/2;
    }else{

    }

    return {x,y};
}

export function convertColor(color:string):[number,number,number,number]
{
    if(color && color.startsWith('#')){
        color=color.substr(1);
    }
    if(!color){
        return [0,0,0,1];
    }
    switch(color.length){

        // [rgb]FF
        case 1:
            color=color+color+color+color+color+color+'FF';
            break;

        // [rgb][a]
        case 2:
            color=color[0]+color[0]+color[0]+color[0]+color[0]+color[0]+color[1]+color[1];
            break;

        // [r][g][b]FF
        case 3:
            color=color[0]+color[0]+color[1]+color[1]+color[2]+color[2]+'FF';
            break;

        // [r][g][b][a]
        case 4:
            color=color[0]+color[0]+color[1]+color[1]+color[2]+color[2]+color[3]+color[3];
            break;

        // [r][g][b][a0][a1]
        case 5:
            color=color[0]+color[0]+color[1]+color[1]+color[2]+color[2]+color[3]+color[4];
            break;

        // [r0][r1][g0][g1][b0][b1]FF
        case 6:
            color+='FF';
            break;

        // [r0][r1][g0][g1][b0][b1][a]
        case 7:
            color+=color[6];
            break;
    }

    return [
        Number('0x'+color.substr(0,2))/255,
        Number('0x'+color.substr(2,2))/255,
        Number('0x'+color.substr(4,2))/255,
        Number('0x'+color.substr(6,2))/255,
    ];
}

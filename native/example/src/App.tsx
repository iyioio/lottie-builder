import React, { useCallback, useEffect, useState } from "react";
import { Animated, Button, GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import { LottieBuilderAccelerator } from "@iyio/react-native-lottie-builder";
import { Animation, AnimationObject, Layer, Point, ResizeMode, Size, viewportPointToCompPoint } from '@iyio/lottie-builder';
import LottieView from "lottie-react-native";
import KeepAwake from 'react-native-keep-awake';
import * as fs from 'react-native-fs';
import { useRef } from "react";

// test-af-lottie.aep exported using the Bodymovin extension
const testLottie = () => require("./test-af-lottie.json");
const compositions={
    hat:require("./hat.json"),
    square:require("./sq.json"),
    multi:require("./multi.json"),
    bella:require("./bella.json"),
}


export default function App() {

    const anValue=useRef(new Animated.Value(0));
    useEffect(()=>{
        Animated.loop(Animated.timing(anValue.current,{
            toValue:1,
            duration:5000,
            useNativeDriver:true
        })).start()

    },[])

    const [view, setView] = useState<View | null>(null);

    const [an,setAn]=useState<Animation|null>(null);
    const [src,setSrc]=useState<AnimationObject|null>(null);

    // Loads the test-af-lottie.json file
    const loadTestLottie=useCallback(()=>{
        if(!view){
            return;
        }
        setAn(new Animation(testLottie(),new LottieBuilderAccelerator(view)));
    },[view])

    useEffect(() =>{
        loadTestLottie()
    },[loadTestLottie]);

    useEffect(()=>{
        if(!an){
            return;
        }
        setSrc(an.getAnimationObject());
        return an.onSourceChange.addListener(()=>{
            setSrc(an.getAnimationObject());
        })
    },[an])

    const [selectOffset,setSelectOffset]=useState<Point|null>(null);
    const [selectedLayer,setSelectedLayer]=useState<Layer|null>(null);

    const [viewportSize, setViewportSize] = useState<Size>({ width: 0, height: 0});

    const [compSize, setCompSize] = useState<Size>({ width: 0, height: 0});

    const [resizeMode,setResizeMode] = useState<ResizeMode>('contain');

    const [aspectRatio,setAspectRatio] = useState<'fill'|'2:1'|'1:2'>('fill');

    // Get the size of the loaded composition
    useEffect(()=>{
        const ac=an?.accelerator;
        if(!ac){
            return;
        }
        let m=true;
        (async ()=>{
            const size=await ac?.getCompositionSizeAsync();
            if(m){
                setCompSize(size);
            }
        })();
        return ()=>{m=false;};
    },[an]);

    // Shrink and grow MyStar using an interval
    useEffect(()=>{
        if(!an){
            return;
        }
        let m=true;
        const min=0.1;
        const max=1;
        let dir=0.01;
        let scale=100;
        const iv=setInterval(()=>{
            if(!m){
                return;
            }

            scale+=dir;
            if(scale<min){
                scale=min;
                dir*=-1;
            }else if(scale>max){
                scale=max;
                dir*=-1;
            }

            an.getLayer('MyStar')?.setScale(scale);

        },1000/30);

        return ()=>{
            m=false;
            clearInterval(iv);
        };
    },[an]);

    // Selects the layer that is tapped on
    const selectLayer=useCallback(async (e:GestureResponderEvent)=>{
        if(!an){
            return;
        }

        const pt=viewportPointToCompPoint(
            e.nativeEvent.locationX,
            e.nativeEvent.locationY,
            viewportSize,
            compSize,
            resizeMode);

        const layer=await an.getLayerAtPtAsync(pt.x,pt.y);
        setSelectedLayer(current=>{
            if(current){
                current.setHighlighted(false);
            }
            return layer;
        });
        if(layer){
            const pos=layer.getPosition();
            setSelectOffset({
                x:pt.x-pos.x,
                y:pt.y-pos.y
            });
            layer.setHighlighted(true);
        }else{
            setSelectOffset(null);
        }


    },[an,viewportSize,compSize,resizeMode])

    // Moves the selected layer
    const moveLayer=useCallback((e:GestureResponderEvent)=>{
        if (!selectedLayer || !selectOffset) {
            return;
        }
        const pt=viewportPointToCompPoint(
            e.nativeEvent.locationX,
            e.nativeEvent.locationY,
            viewportSize,
            compSize,
            resizeMode);

        selectedLayer.setPositionXY(pt.x-selectOffset.x,pt.y-selectOffset.y);

    },[an,viewportSize,compSize,resizeMode,selectedLayer,selectOffset]);

    // Set the color of selected layer
    const setSelectedColor=useCallback((color:string)=>{
        if(!an || !selectedLayer){
            return;
        }
        an.accelerator?.setColor(selectedLayer.name+".**.Fill 1.Color",color);
    },[an,selectedLayer]);


    // Rotate selected layer by 5 deg
    const rotateSelected=useCallback(()=>{
        if(!selectedLayer){
            return;
        }
        selectedLayer.setRotation(selectedLayer.getRotation()+5);
    },[selectedLayer]);

    // Changes the selected layer's scale by the given amount
    const updateScale=useCallback((value:number)=>{
        if(!selectedLayer){
            return;
        }
        selectedLayer.setScale(selectedLayer.getScale()+value);
    },[selectedLayer])

    // Removes the selected layer from the animation
    const removeSelected=useCallback(()=>{
        if(!selectedLayer){
            return;
        }
        selectedLayer.remove();
    },[selectedLayer]);


    // Prints the lottie animation to the console with readable property names
    const printAnimation=useCallback(()=>{
        console.info(JSON.stringify(an,null,4).substr(0,10000))
    },[an]);

    // Saves the current state of the lottie animation to file
    const saveAnimation=useCallback(()=>{
        const json=JSON.stringify(an?.getSource());
        fs.writeFile(`${fs.DocumentDirectoryPath}/animation.json`,json);
    },[an]);

    // Loads the previous state of the lottie animation from file
    const loadAnimation=useCallback(async ()=>{
        if(!view){
            return;
        }
        const json=await fs.readFile(`${fs.DocumentDirectoryPath}/animation.json`);
        setAn(new Animation(JSON.parse(json),new LottieBuilderAccelerator(view)));
    },[view]);

    // Adds a composition to the animation
    const addComp=useCallback((name:keyof typeof compositions)=>{
        an?.addPrecomposition(compositions[name],name,name);
    },[an]);



    return (
        <View style={styles.flex1}>
            <KeepAwake/>
            <View style={[
                styles.flex1,
                aspectRatio!=='fill'&&styles.center,
            ]}>
                <View
                    ref={setView}
                    style={[
                        styles.composition,
                        aspectRatio==='fill'?styles.flex1:aspectRatio==='2:1'?styles.ar21:styles.ar12,
                    ]}
                    onLayout={(e)=>setViewportSize({...e.nativeEvent.layout})}
                    onTouchMove={moveLayer}
                    onTouchStart={selectLayer}
                >
                    {src&&<LottieView
                        source={src}
                        progress={anValue.current}
                        resizeMode={resizeMode}
                        imageAssetsFolder="images"/>}
                </View>
            </View>

            <View style={styles.infoCol}>
                <Text>Composition:{compSize.width}x{compSize.height}</Text>
                <Text>Viewport:{viewportSize.width}x{viewportSize.height}</Text>
                <Text>Assets:{an?.assets.length}, Layers:{an?.layers.length}</Text>
                <Text>Selected:{selectedLayer?.name||'(none)'}</Text>
            </View>

            <View style={styles.row}>
                <Button title="Red" onPress={()=>setSelectedColor('#f00')}/>
                <Button title="Green" onPress={()=>setSelectedColor('#0f0')}/>
                <Button title="Blue" onPress={()=>setSelectedColor('#0000ff88')}/>
                <Button title="Rotate" onPress={rotateSelected}/>
                <Button title="Scale +" onPress={()=>updateScale(0.1)}/>
                <Button title="Scale -" onPress={()=>updateScale(-0.1)}/>
                <Button title="Remove" onPress={removeSelected}/>
            </View>

            <View style={styles.row}>
                <Text>{resizeMode}</Text>
                <Button title="Contain" onPress={()=>setResizeMode('contain')}/>
                <Button title="Cover" onPress={()=>setResizeMode('cover')}/>
                <Button title="Center" onPress={()=>setResizeMode('center')}/>
            </View>

            <View style={styles.row}>
                <Text>{aspectRatio}</Text>
                <Button title="fill" onPress={()=>setAspectRatio('fill')}/>
                <Button title="2:1" onPress={()=>setAspectRatio('2:1')}/>
                <Button title="1:2" onPress={()=>setAspectRatio('1:2')}/>
            </View>

            <View style={styles.row}>
                <Text>Add</Text>
                <Button title="hat" onPress={()=>addComp('hat')}/>
                <Button title="square" onPress={()=>addComp('square')}/>
                <Button title="multi" onPress={()=>addComp('multi')}/>
                <Button title="Bella" onPress={()=>addComp('bella')}/>
            </View>

            <View style={styles.row}>
                <Button title="print" onPress={printAnimation}/>
                <Button title="save" onPress={saveAnimation}/>
                <Button title="load" onPress={loadAnimation}/>
                <Button title="reset" onPress={loadTestLottie}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    center:{
        justifyContent:'center',
        alignItems:'center',
    },
    row:{
        flexDirection:'row',
        marginBottom:15,
        justifyContent:'space-around',
        alignItems:'center',
        paddingHorizontal:20,
        flexWrap:'wrap',
    },
    infoCol:{
        margin:10,
    },
    composition:{
        backgroundColor:'#d5ffd5',
    },
    ar21:{
        width:200,
        height:100,
    },
    ar12:{
        width:100,
        height:200,
    },
});

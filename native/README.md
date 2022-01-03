# @iyio/lottie-builder-react-native

Methods for manipulating lottie animations from React-Native

## Installation

```sh
npm install @iyio/react-native-lottie-builder

# IOS
cd ios && pod install
```

## Usage
The example below loads a Lottie animation and allows you to do the following:
- Drag a shape across the screen by using your finger
- Animate a shape from an interval
- Change the color of a shape
- Rotate a shape
- Test different resize and viewport modes
- Get composition size

``` tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, findNodeHandle, GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import { setColor,setPoint, setSize, getCompositionSizeAsync, setFloat, convertToNativeColor, Size, viewportPointToCompPoint, ResizeMode } from "@iyio/lottie-builder-react-native";
import LottieView from "lottie-react-native";

// test-af-lottie.aep exported using the Bodymovin extension
const testLottie = () => require("./test-af-lottie.json");


export default function App() {

    const src = useMemo(() => testLottie(), []);

    const [view, setView] = useState<View | null>(null);

    const tag = useMemo(() => (view ? findNodeHandle(view) : null), [view]);

    const [layout, setLayout] = useState<Size>({ width: 0, height: 0});

    const [compSize, setCompSize] = useState<Size>({ width: 0, height: 0});

    const [resizeMode,setResizeMode] = useState<ResizeMode>('contain');

    const [aspectRatio,setAspectRatio] = useState<'fill'|'2:1'|'1:2'>('fill');

    // Get the size of the loaded composition
    useEffect(()=>{
        if(tag===null){
            return;
        }
        let m=true;
        (async ()=>{
            const size=await getCompositionSizeAsync(tag);
            if(m){
                setCompSize(size);
            }
        })();
        return ()=>{m=false;};
    },[tag]);

    // Shrink and grow MyStar using an interval
    useEffect(()=>{
        if(!tag==null){
            return;
        }
        let m=true;
        const min=10;
        const max=100;
        const speed=2;
        let dir=1;
        let scale=100;
        const iv=setInterval(()=>{
            if(!m || tag===null){
                return;
            }

            scale+=dir*speed;
            if(scale<min){
                scale=min;
                dir=1;
            }else if(scale>max){
                scale=max;
                dir=-1;
            }

            setSize(
                tag,
                "**.MyStar.Transform.Scale",
                scale,
                scale);

        },1000/30);

        return ()=>{
            m=false;
            clearInterval(iv);
        };
    },[tag]);

    // Move MyStar under finger
    const moveStar=(e:GestureResponderEvent)=>{
        if (tag === null) {
            return;
        }
        const pt=viewportPointToCompPoint(
            e.nativeEvent.locationX,
            e.nativeEvent.locationY,
            layout,
            compSize,
            resizeMode);
        setPoint(
            tag,
            "**.MyStar.Transform.Position",
            pt.x,
            pt.y
        );
    };

    // Set the color of MyCircle
    const setCircleColor=(color:string)=>{
        if(tag===null){
            return;
        }
        const ary=convertToNativeColor(color);
        setColor(tag,"**.MyCircle.**.Fill 1.Color",ary[0],ary[1],ary[2],ary[3]);
    };

    const rectR=useRef(0);
    // Rotate MyRect by 5 deg
    const rotateRect=()=>{
        if(tag===null){
            return;
        }
        rectR.current+=5;
        setFloat(tag,"**.MyRect.Transform.Rotation",rectR.current);
    };

    return (
        <View style={styles.flex1}>
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
                    onLayout={(e)=>setLayout({...e.nativeEvent.layout})}
                    onTouchMove={moveStar}
                >
                    <LottieView source={src} autoPlay loop resizeMode={resizeMode} />
                </View>
            </View>

            <View style={styles.row}>
                <Text>Composition:{compSize.width}x{compSize.height}</Text>
                <Text>Viewport:{layout.width}x{layout.height}</Text>
            </View>

            <View style={styles.row}>
                <Button title="Red" onPress={()=>setCircleColor('#f00')}/>
                <Button title="Green" onPress={()=>setCircleColor('#0f0')}/>
                <Button title="Trans Blue" onPress={()=>setCircleColor('#0000ff88')}/>
                <Button title="Rotate" onPress={rotateRect}/>
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

```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, findNodeHandle, GestureResponderEvent, StyleSheet, View } from "react-native";
import { setColor,setPoint, setSize, getCompositionSizeAsync, setFloat } from "@iyio/react-native-lottie-builder";
import LottieView from "lottie-react-native";
import { convertColor, Size, viewportPointToCompPoint } from "./helpers";

// test-af-lottie.aep exported using the Bodymovin extension
const testLottie = () => require("./test-af-lottie.json");


export default function App() {

    const src = useMemo(() => testLottie(), []);

    const [view, setView] = useState<View | null>(null);

    const tag = useMemo(() => (view ? findNodeHandle(view) : null), [view]);

    const [layout, setLayout] = useState<Size>({ width: 0, height: 0});

    const [compSize, setCompSize] = useState<Size>({ width: 0, height: 0});

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
            compSize);
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
        const ary=convertColor(color);
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
            <View
                ref={setView}
                style={styles.flex1}
                onLayout={(e)=>setLayout({...e.nativeEvent.layout})}
                onTouchMove={moveStar}
            >
                {/* <LottieView ref={setLot} source={src} progress={an.current}/> */}
                <LottieView source={src} autoPlay loop resizeMode="contain" />
            </View>

            <View style={styles.controls}>
                <Button title="Red" onPress={()=>setCircleColor('#f00')}/>
                <Button title="Green" onPress={()=>setCircleColor('#0f0')}/>
                <Button title="Trans Blue" onPress={()=>setCircleColor('#0000ff88')}/>
                <Button title="Rotate" onPress={rotateRect}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    controls:{
        flexDirection:'row',
        marginBottom:50,
        justifyContent:'space-around',
        paddingHorizontal:20,
        flexWrap:'wrap',
    },
});

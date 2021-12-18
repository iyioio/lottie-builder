import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '@iyio/react-native-lottie-builder' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const ReactNativeLottieBuilder = NativeModules.ReactNativeLottieBuilder
  ? NativeModules.ReactNativeLottieBuilder
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function setColor(
  tag: number,
  keyPath: string,
  red: number,
  green: number,
  blue: number,
  alpha: number
): void {
  ReactNativeLottieBuilder.setColor(tag, keyPath, red, green, blue, alpha);
}

export function setFloat(tag: number, keyPath: string, value: number): void {
  ReactNativeLottieBuilder.setFloat(tag, keyPath, value);
}

export function setPoint(
  tag: number,
  keyPath: string,
  x: number,
  y: number
): void {
  ReactNativeLottieBuilder.setPoint(tag, keyPath, x, y);
}

export function setSize(
  tag: number,
  keyPath: string,
  width: number,
  height: number
): void {
  ReactNativeLottieBuilder.setSize(tag, keyPath, width, height);
}

export function getCompositionSizeAsync(
  tag: number
): Promise<{ width: number; height: number }> {
  return ReactNativeLottieBuilder.getCompositionSize(tag);
}

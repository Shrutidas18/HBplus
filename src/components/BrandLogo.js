import React from 'react';
import { Image, View } from 'react-native';

// Logo.jpeg lives in the project root (hbplus/Logo.jpeg)
const LOGO = require('../../Logo.jpeg');

// The JPEG has lots of empty white space, so we zoom in and crop it.
// These match the values used on the login screen (box 90x48).
const ZOOM = 3;
const SHIFT_X = -9;
const BASE_W = 90;
const BASE_H = 48;

// height: rendered height of the logo box in px (width follows the same proportions)
export default function BrandLogo({ height = 48 }) {
  const k = height / BASE_H;
  const width = BASE_W * k;
  return (
    <View
      style={{
        width,
        height,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={LOGO}
        resizeMode="contain"
        accessibilityLabel="HB+"
        style={{
          width,
          height,
          transform: [{ translateX: SHIFT_X * k }, { scale: ZOOM }],
        }}
      />
    </View>
  );
}
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';

// landing.mp4 lives in the project root (hbplus/landing.mp4)
const VIDEO = require('../../landing.mp4');

// Turns the bundler's asset reference into a plain URL the <video> tag can use
function resolveVideoUri(asset) {
  if (typeof asset === 'string') return asset;
  if (asset && typeof asset === 'object' && asset.uri) return asset.uri;
  try {
    const resolved = Image.resolveAssetSource && Image.resolveAssetSource(asset);
    if (resolved && resolved.uri) return resolved.uri;
  } catch (e) {
    // fall through
  }
  return null;
}

// Fills its parent with the looping video (web only). Renders nothing if the video
// can't play, so whatever is behind it (a photo or color) shows instead.
// focus: which part of the video stays in view when it is cropped, e.g. 'center top'.
export default function BackgroundVideo({ paused = false, focus = 'center top' }) {
  const [failed, setFailed] = useState(false);
  const uri = resolveVideoUri(VIDEO);
  if (Platform.OS !== 'web' || !uri || failed || paused) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {React.createElement('video', {
        src: uri,
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        preload: 'auto',
        disablePictureInPicture: true,
        'aria-hidden': true,
        onError: () => setFailed(true),
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: focus,
        },
      })}
    </View>
  );
}
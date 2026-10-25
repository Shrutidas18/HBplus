import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

function initials(name, email) {
  const source = (name || email || '?').trim();
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0] || '?')[0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

export default function Avatar({ name, email, photoURL, size = 48 }) {
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (photoURL) {
    return <Image source={{ uri: photoURL }} style={[styles.image, box]} accessibilityLabel={name || email} />;
  }
  return (
    <View style={[styles.fallback, box]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials(name, email)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.border },
  fallback: { backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.accentDark, fontWeight: '700' },
});

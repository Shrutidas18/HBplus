import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../theme';

export default function Loader({ label, fullScreen = false }) {
  return (
    <View
      style={[styles.wrap, fullScreen && styles.full]}
      accessibilityRole="progressbar"
      accessibilityLabel={label || 'Loading'}
    >
      <ActivityIndicator size="large" color={colors.accent} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  full: { flex: 1, backgroundColor: colors.bg },
  label: { ...font.small, marginTop: spacing.md },
});

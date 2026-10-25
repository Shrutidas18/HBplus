import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function GoogleButton({ onPress, loading = false, disabled = false }) {
  const inactive = loading || disabled;
  return (
    <Pressable
      onPress={inactive ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel="Login with Google"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        pressed && !inactive && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.ink} />
      ) : (
        <View style={styles.logo}>
          <Text style={styles.logoText}>G</Text>
        </View>
      )}
      <Text style={styles.label}>{loading ? 'Signing in…' : 'Login with Google'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: '#F8FAFC' },
  inactive: { opacity: 0.7 },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#4285F4', fontWeight: '800', fontSize: 14 },
  label: { marginLeft: spacing.md - 4, fontSize: 16, fontWeight: '600', color: colors.ink },
});

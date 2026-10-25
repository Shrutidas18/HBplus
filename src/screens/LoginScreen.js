import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_DOMAINS } from '../config/env';
import ErrorBanner from '../components/ErrorBanner';
import GoogleButton from '../components/GoogleButton';
import { colors, font, radius, spacing } from '../theme';

export default function LoginScreen() {
  const { signIn, busy, error, ready } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const domainLabel = ALLOWED_DOMAINS.map((d) => `@${d}`).join(', ');

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, wide && styles.scrollWide]}
        keyboardShouldPersistTaps="handled"
      >
        {wide ? (
          <View style={styles.brandPanel}>
            <View style={styles.brandInner}>
              <View style={styles.logoMarkLarge}>
                <Text style={styles.logoPlusLarge}>+</Text>
              </View>
              <Text style={styles.brandTitle}>HB+ Team Portal</Text>
              <Text style={styles.brandText}>
                One secure place for the HB+ team. Sign in with your official company
                account to continue.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.formPanel}>
          <View style={styles.card}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Text style={styles.logoPlus}>+</Text>
              </View>
              <Text style={styles.logoText}>HB+</Text>
            </View>

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in with your official Google account to access the dashboard.
            </Text>

            <ErrorBanner message={error} />

            <GoogleButton onPress={signIn} loading={busy} disabled={!ready} />

            <Text style={styles.hint}>
              Access is restricted to <Text style={styles.hintStrong}>{domainLabel}</Text>{' '}
              accounts.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1 },
  scrollWide: { flexDirection: 'row' },

  brandPanel: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  brandInner: { maxWidth: 420 },
  logoMarkLarge: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoPlusLarge: { color: colors.white, fontSize: 40, fontWeight: '700', lineHeight: 44 },
  brandTitle: { color: colors.white, fontSize: 32, fontWeight: '700', marginBottom: spacing.md },
  brandText: { color: '#CBD5E1', fontSize: 16, lineHeight: 24 },

  formPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },

  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlus: { color: colors.white, fontSize: 24, fontWeight: '700', lineHeight: 26 },
  logoText: { marginLeft: spacing.sm + 2, fontSize: 20, fontWeight: '800', color: colors.ink },

  title: { ...font.title, marginBottom: spacing.sm },
  subtitle: { ...font.small, fontSize: 15, lineHeight: 22, marginBottom: spacing.lg },
  hint: { ...font.small, textAlign: 'center', marginTop: spacing.lg, lineHeight: 19 },
  hintStrong: { color: colors.ink, fontWeight: '700' },
});

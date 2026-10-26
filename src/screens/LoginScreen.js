import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  ImageBackground,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_DOMAINS } from '../config/env';
import ErrorBanner from '../components/ErrorBanner';
import GoogleButton from '../components/GoogleButton';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '../theme';

// Calm teal palette, scoped to the login screen only (theme.js is untouched).
// Change these to retheme this screen.
const PALETTE = {
  accent: '#0F766E', // links, hover borders
  ink: '#0B2A2A', // headings, dark panel base
  bg: '#F3F8F7', // page background
  border: '#D3E3E0', // card, divider, circle outlines
  overlay: 'rgba(11, 42, 42, 0.62)', // tint over the video/photo
};

// Logo.jpeg lives in the project root (hbplus/Logo.jpeg)
const LOGO = require('../../Logo.jpeg');

// Increase if the mark still looks small, decrease if it gets cut off
const LOGO_ZOOM = 3;
// Pulls the mark to the left edge of its box (the mark sits right of center in the JPEG).
// More negative = further left, less negative = further right.
const LOGO_SHIFT_X = -9;

// Left-panel photo. Swap the line below to try another one from hbplus.fit.
// Options (all from the HB+ site):
//   Hop Studio (their Bhubaneswar space): pTiELaaP0YdPvL9qlsJjqSvEdtc.jpg?lossless=1&width=874&height=593
//   Deep Healing (mind):                  KS81r838a7AIaCgevakOdpl0Loo.jpg?width=736&height=1104
//   Lifestyle Management:                 R403VZOAltYfOCdkeehkuWQxNW4.jpg?width=736&height=920
// Or use a local file: require('../../login-hero.jpg')
const HERO_IMAGE = {
  uri: 'https://framerusercontent.com/images/pTiELaaP0YdPvL9qlsJjqSvEdtc.jpg?lossless=1&width=874&height=593',
};

// Background video for the left panel (web only; the photo above shows while it loads
// and is the fallback if the video can't play). File sits next to Logo.jpeg in the project root.
const VIDEO = require('../../landing.mp4');

// Which part of the video stays in view when the panel crops it.
// 'center top' keeps the top (her face); try 'center 20%' to show a bit more below.
const VIDEO_FOCUS = 'center top';

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

function BackgroundVideo({ paused }) {
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
          objectPosition: VIDEO_FOCUS,
        },
      })}
    </View>
  );
}

const SUPPORT_EMAIL = 'info@hbplus.fit';

const SOCIAL_LINKS = [
  { label: 'Website', icon: 'globe-outline', color: PALETTE.ink, url: 'https://hbplus.fit/' },
  {
    label: 'Instagram',
    icon: 'logo-instagram',
    color: '#E1306C',
    url: 'https://www.instagram.com/hopwith_hb/',
  },
  {
    label: 'LinkedIn',
    icon: 'logo-linkedin',
    color: '#0A66C2',
    url: 'https://www.linkedin.com/company/hbplus/',
  },
  {
    label: 'Studio',
    icon: 'location-outline',
    color: PALETTE.ink,
    url: 'https://maps.app.goo.gl/3kyqyEad7zMhuswGA',
  },
];

function openLink(url) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url);
  }
}

// Crops the empty white space around the logo by scaling it up inside a clipped box
function ZoomedLogo({ width = 90, height = 48 }) {
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
          transform: [{ translateX: LOGO_SHIFT_X }, { scale: LOGO_ZOOM }],
        }}
      />
    </View>
  );
}

function SocialItem({ label, icon, color, url }) {
  return (
    <Pressable
      onPress={() => openLink(url)}
      accessibilityRole="link"
      accessibilityLabel={`${label} (opens in a new tab)`}
      style={({ pressed }) => [styles.socialItem, pressed && styles.socialPressed]}
    >
      {({ hovered }) => (
        <>
          <View style={[styles.socialCircle, hovered && styles.socialCircleHover]}>
            <Ionicons name={icon} size={22} color={color} />
          </View>
          <Text style={styles.socialLabel}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export default function LoginScreen() {
  const { signIn, busy, error, ready } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const domainLabel = ALLOWED_DOMAINS.map((d) => `@${d}`).join(', ');

  // One entrance: the card settles in once on load (skipped if reduce-motion is on)
  const reveal = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      setReduceMotion(!!reduce);
      if (reduce) {
        reveal.setValue(1);
        return;
      }
      Animated.timing(reveal, {
        toValue: 1,
        duration: 450,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [reveal]);

  const cardMotion = {
    opacity: reveal,
    transform: [
      { translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
    ],
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, wide && styles.scrollWide]}
        keyboardShouldPersistTaps="handled"
      >
        {wide ? (
          <ImageBackground source={HERO_IMAGE} resizeMode="cover" style={styles.brandPanel}>
            <BackgroundVideo paused={reduceMotion} />
            <View style={styles.brandOverlay}>
              <View style={styles.logoBadge}>
                <ZoomedLogo />
              </View>

              <View style={styles.brandBottom}>
                <Text style={styles.brandTitle}>HB+ Team Portal</Text>
                <Text style={styles.brandText}>
                  Wellness that understands your lifestyle, and one secure place for the
                  team behind it. Sign in with your company account to continue.
                </Text>
              </View>
            </View>
          </ImageBackground>
        ) : null}

        <View style={styles.formPanel}>
          <Animated.View style={[styles.card, cardMotion]}>
            <View style={styles.logoOnCard}>
              <ZoomedLogo />
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

            <View style={styles.divider} />

            <Text style={styles.followTitle}>Follow us and see what we do</Text>
            <View style={styles.pillRow}>
              {SOCIAL_LINKS.map((link) => (
                <SocialItem key={link.label} {...link} />
              ))}
            </View>

            <Pressable
              onPress={() => openLink(`mailto:${SUPPORT_EMAIL}`)}
              accessibilityRole="link"
              style={styles.helpRow}
            >
              <Text style={styles.helpText}>
                Trouble signing in? <Text style={styles.helpLink}>{SUPPORT_EMAIL}</Text>
              </Text>
            </Pressable>
          </Animated.View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  scroll: { flexGrow: 1 },
  scrollWide: { flexDirection: 'row' },

  // Left panel: photo + navy overlay so text stays readable on any image
  brandPanel: { flex: 1, backgroundColor: PALETTE.ink },
  brandOverlay: {
    flex: 1,
    backgroundColor: PALETTE.overlay,
    justifyContent: 'space-between',
    padding: spacing.xxl,
  },
  // JPEG has no transparency, so it sits in a white badge on the dark panel
  logoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brandBottom: { maxWidth: 440 },
  brandTitle: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
    marginBottom: spacing.md,
  },
  brandText: { color: '#DCEBE8', fontSize: 16, lineHeight: 25 },

  formPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    paddingVertical: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: spacing.xl + 8,
    shadowColor: PALETTE.ink,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },

  logoOnCard: { marginBottom: spacing.lg, alignSelf: 'flex-start' },

  title: { ...font.title, color: PALETTE.ink, marginBottom: spacing.sm },
  subtitle: { ...font.small, fontSize: 15, lineHeight: 22, marginBottom: spacing.lg },
  hint: { ...font.small, textAlign: 'center', marginTop: spacing.lg, lineHeight: 19 },
  hintStrong: { color: PALETTE.ink, fontWeight: '700' },

  divider: {
    height: 1,
    backgroundColor: PALETTE.border,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },

  followTitle: {
    ...font.small,
    color: PALETTE.ink,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  socialItem: { alignItems: 'center', width: 76 },
  socialPressed: { opacity: 0.7 },
  socialCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  socialCircleHover: { borderColor: PALETTE.accent },
  socialLabel: { ...font.small, fontSize: 12, color: PALETTE.ink, fontWeight: '600' },

  helpRow: { alignItems: 'center' },
  helpText: { ...font.small, textAlign: 'center' },
  helpLink: { color: PALETTE.accent, fontWeight: '600' },
});
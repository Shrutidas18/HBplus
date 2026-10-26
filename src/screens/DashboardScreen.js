import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AdminUsersPanel from '../components/AdminUsersPanel';
import BackgroundVideo from '../components/BackgroundVideo';
import BrandLogo from '../components/Brand';
import { colors, font, radius, spacing } from '../theme';

const SUPPORT_EMAIL = 'info@hbplus.fit';

// Shown while the video loads, and if it can't play
const HERO_IMAGE = {
  uri: 'https://framerusercontent.com/images/pTiELaaP0YdPvL9qlsJjqSvEdtc.jpg?lossless=1&width=874&height=593',
};
// Solid color on the left of the hero; the video fades into it.
const HERO_BG = '#0B3F3A';
const HERO_BG_CLEAR = 'rgba(11, 63, 58, 0)';
// Which part of the video stays visible (vertical position).
// Her face is near the top: 'center 0%' = very top, 'center 8%' = default,
// 'center 15%' = a little lower. Adjust until the face sits where you like.
const VIDEO_FOCUS = 'center 8%';

const EXPLORE_LINKS = [
  { title: 'Website', subtitle: 'hbplus.fit', icon: 'globe-outline', url: 'https://hbplus.fit/' },
  {
    title: 'Hop Studio',
    subtitle: 'Bhubaneswar, Odisha',
    icon: 'location-outline',
    url: 'https://maps.app.goo.gl/3kyqyEad7zMhuswGA',
  },
  {
    title: 'Instagram',
    subtitle: '@hopwith_hb',
    icon: 'logo-instagram',
    url: 'https://www.instagram.com/hopwith_hb/',
  },
  {
    title: 'LinkedIn',
    subtitle: 'HB+ company page',
    icon: 'logo-linkedin',
    url: 'https://www.linkedin.com/company/hbplus/',
  },
];

function openLink(url) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && !url.startsWith('mailto:')) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url);
  }
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Profile photo if there is one, otherwise the first letter of the name
function HeroAvatar({ name, email, photoURL, size = 76 }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const letter = ((name || email || '?').trim()[0] || '?').toUpperCase();
  return (
    <View style={[styles.avatarRing, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
      {photoURL && !photoFailed ? (
        <Image
          source={{ uri: photoURL }}
          onError={() => setPhotoFailed(true)}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={[
            styles.avatarFallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.avatarLetter, { fontSize: size * 0.42 }]}>{letter}</Text>
        </View>
      )}
    </View>
  );
}

function Stat({ icon, label, value, tone }) {
  const good = tone === 'good';
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, good && styles.statIconGood]}>
        <Ionicons name={icon} size={20} color={good ? colors.success : colors.accent} />
      </View>
      <View style={styles.statBody}>
        <Text style={font.small}>{label}</Text>
        <Text style={[styles.statValue, good && { color: colors.success }]}>{value}</Text>
      </View>
    </View>
  );
}

function ExploreTile({ title, subtitle, icon, url }) {
  return (
    <Pressable
      onPress={() => openLink(url)}
      accessibilityRole="link"
      accessibilityLabel={`${title} (opens in a new tab)`}
      style={({ pressed, hovered }) => [
        styles.tile,
        hovered && styles.tileHover,
        pressed && styles.tilePressed,
      ]}
    >
      {({ hovered }) => (
        <>
          <View style={styles.tileTop}>
            <View style={[styles.tileIcon, hovered && styles.tileIconHover]}>
              <Ionicons name={icon} size={22} color={hovered ? colors.white : colors.accent} />
            </View>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={hovered ? colors.accent : colors.muted}
            />
          </View>
          <Text style={styles.tileTitle}>{title}</Text>
          <Text style={font.small}>{subtitle}</Text>
        </>
      )}
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const compact = width < 640;
  const isAdmin = user.role === 'admin';
  const firstName = (user.name || user.email).split(/[\s@]/)[0];

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => {
      if (!cancelled) setReduceMotion(!!r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero: video, teal tint, top bar and greeting */}
        <View style={styles.hero}>
          {/* Media: video on the right (full width on small screens) */}
          <ImageBackground
            source={HERO_IMAGE}
            resizeMode="cover"
            style={compact ? styles.mediaFull : styles.mediaRight}
          >
            <BackgroundVideo paused={reduceMotion} focus={VIDEO_FOCUS} />
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: compact ? 'rgba(11,42,42,0.62)' : 'rgba(11,42,42,0.15)' },
              ]}
            />
            {!compact && Platform.OS === 'web'
              ? React.createElement('div', {
                  style: {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    pointerEvents: 'none',
                    background: `linear-gradient(to right, ${HERO_BG} 0%, ${HERO_BG_CLEAR} 55%)`,
                  },
                })
              : null}
          </ImageBackground>

          <View style={styles.heroOverlay}>
            <View style={styles.heroInner}>
              <View style={styles.topBar}>
                <View style={styles.logoBadge}>
                  <BrandLogo height={32} />
                </View>

                <Pressable
                  onPress={signOut}
                  accessibilityRole="button"
                  accessibilityLabel="Logout"
                  style={({ pressed, hovered }) => [
                    styles.logout,
                    hovered && styles.logoutHover,
                    pressed && styles.logoutHover,
                  ]}
                >
                  <Ionicons name="log-out-outline" size={16} color={colors.white} />
                  <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
              </View>

              <View style={[styles.greetRow, compact && styles.greetRowCompact]}>
                <HeroAvatar name={user.name} email={user.email} photoURL={user.photoURL} />
                <View style={[styles.greetText, compact && styles.greetTextCompact]}>
                  <Text style={[styles.greetTitle, compact && styles.greetTitleCompact]}>
                    {greeting()}, {firstName}
                  </Text>
                  <View style={styles.emailRow}>
                    <Ionicons name="mail-outline" size={15} color="#CFE5E1" />
                    <Text style={styles.greetEmail}>{user.email}</Text>
                  </View>
                  <Text style={styles.greetSub}>Welcome to the HB+ Team Portal.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Content overlapping the hero */}
        <View style={styles.container}>
          <View style={styles.stats}>
            <Stat icon="shield-checkmark-outline" label="Access" value="Domain verified" tone="good" />
            <Stat
              icon="person-outline"
              label="Role"
              value={isAdmin ? 'Administrator' : 'Standard user'}
            />
            <Stat icon="logo-google" label="Signed in with" value="Google" />
          </View>

          {isAdmin ? (
            <AdminUsersPanel />
          ) : (
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.cardBody}>
                <Text style={font.heading}>Member area</Text>
                <Text style={[font.small, styles.cardText]}>
                  You are signed in as a standard user. Administrator tools are only shown to
                  accounts with the admin role.
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Explore HB+</Text>
          <Text style={[font.small, styles.sectionSub]}>Follow us and see what we do.</Text>
          <View style={styles.tiles}>
            {EXPLORE_LINKS.map((link) => (
              <ExploreTile key={link.title} {...link} />
            ))}
          </View>

          <View style={styles.footer}>
            <Pressable onPress={() => openLink(`mailto:${SUPPORT_EMAIL}`)} accessibilityRole="link">
              <Text style={styles.footerText}>
                Need help? <Text style={styles.footerLink}>{SUPPORT_EMAIL}</Text>
              </Text>
            </Pressable>
            <Text style={styles.footerCopy}>
              © {new Date().getFullYear()} HB+. All rights reserved.
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

  // Hero
  hero: { backgroundColor: HERO_BG, overflow: 'hidden' },
  mediaRight: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '58%' },
  mediaFull: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  heroOverlay: {
    paddingHorizontal: spacing.md + 4,
    paddingTop: spacing.md,
    paddingBottom: 96, // room for the tiles that overlap the hero
  },
  heroInner: { width: '100%', maxWidth: 960, alignSelf: 'center' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.sm - 2,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  logoutHover: { backgroundColor: 'rgba(255,255,255,0.24)' },
  logoutText: { fontSize: 14, fontWeight: '600', color: colors.white, marginLeft: 6 },

  greetRow: { flexDirection: 'row', alignItems: 'center' },
  greetRowCompact: { flexDirection: 'column', alignItems: 'flex-start' },
  greetText: { flex: 1, marginLeft: spacing.lg },
  greetTextCompact: { marginLeft: 0, marginTop: spacing.md },
  greetTitle: { fontSize: 40, fontWeight: '700', color: colors.white, lineHeight: 46 },
  greetTitleCompact: { fontSize: 30, lineHeight: 36 },
  emailRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  greetEmail: { fontSize: 14, color: '#CFE5E1', marginLeft: 6 },
  greetSub: { fontSize: 15, color: '#E3F1EE', marginTop: spacing.sm },

  avatarRing: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: colors.white, fontWeight: '700' },

  // Content
  container: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: spacing.md + 4,
    marginTop: -56,
    paddingBottom: spacing.lg,
  },

  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
    marginBottom: spacing.sm,
  },
  stat: {
    flexGrow: 1,
    flexBasis: 200,
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md - 2,
  },
  statIconGood: { backgroundColor: colors.successSoft },
  statBody: { flex: 1 },
  statValue: { fontSize: 17, fontWeight: '700', color: colors.ink, marginTop: 2 },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: { flex: 1 },
  cardText: { marginTop: spacing.xs, fontSize: 15, lineHeight: 22 },

  // Explore
  sectionTitle: { ...font.heading, fontSize: 22, marginTop: spacing.xl },
  sectionSub: { marginTop: 2, marginBottom: spacing.sm },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm },
  tile: {
    flexGrow: 1,
    flexBasis: 200,
    margin: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md + 2,
  },
  tileHover: { borderColor: colors.accent },
  tilePressed: { opacity: 0.8 },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconHover: { backgroundColor: colors.accent },
  tileTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 2 },

  // Footer
  footer: { alignItems: 'center', marginTop: spacing.xl, paddingBottom: spacing.md },
  footerText: { ...font.small, textAlign: 'center' },
  footerLink: { color: colors.accent, fontWeight: '600' },
  footerCopy: { ...font.small, fontSize: 12, marginTop: spacing.xs },
});
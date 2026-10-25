import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import AdminUsersPanel from '../components/AdminUsersPanel';
import Avatar from '../components/Avatar';
import RoleBadge from '../components/RoleBadge';
import { colors, font, radius, spacing } from '../theme';

function Stat({ label, value, tone }) {
  return (
    <View style={styles.stat}>
      <Text style={font.small}>{label}</Text>
      <Text style={[styles.statValue, tone === 'good' && { color: colors.success }]}>{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const isAdmin = user.role === 'admin';
  const firstName = (user.name || user.email).split(/[\s@]/)[0];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoPlus}>+</Text>
            </View>
            <Text style={styles.logoText}>HB+</Text>
          </View>

          <Pressable
            onPress={signOut}
            accessibilityRole="button"
            accessibilityLabel="Logout"
            style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          <View style={styles.welcome}>
            <Avatar name={user.name} email={user.email} photoURL={user.photoURL} size={64} />
            <View style={styles.welcomeText}>
              <Text style={font.title}>Welcome, {firstName}</Text>
              <Text style={[font.small, styles.email]}>{user.email}</Text>
              <RoleBadge role={user.role} />
            </View>
          </View>

          <View style={styles.stats}>
            <Stat label="Access" value="Domain verified" tone="good" />
            <Stat label="Role" value={isAdmin ? 'Administrator' : 'Standard user'} />
            <Stat label="Signed in with" value="Google" />
          </View>

          {isAdmin ? (
            <AdminUsersPanel />
          ) : (
            <View style={styles.card}>
              <Text style={font.heading}>Member area</Text>
              <Text style={[font.small, styles.cardText]}>
                You are signed in as a standard user. Administrator tools are only shown to
                accounts with the admin role.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerInner: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.md - 4,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlus: { color: colors.white, fontSize: 22, fontWeight: '700', lineHeight: 24 },
  logoText: { marginLeft: spacing.sm, fontSize: 18, fontWeight: '800', color: colors.ink },

  logout: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  logoutPressed: { backgroundColor: '#F8FAFC' },
  logoutText: { fontSize: 14, fontWeight: '600', color: colors.ink },

  content: { flexGrow: 1, padding: spacing.md + 4 },
  container: { width: '100%', maxWidth: 960, alignSelf: 'center' },

  welcome: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  welcomeText: { flex: 1, marginLeft: spacing.md },
  email: { marginTop: 2, marginBottom: spacing.sm },

  stats: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm, marginBottom: spacing.sm },
  stat: {
    flexGrow: 1,
    flexBasis: 200,
    margin: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  statValue: { fontSize: 17, fontWeight: '700', color: colors.ink, marginTop: spacing.xs },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardText: { marginTop: spacing.sm, fontSize: 15, lineHeight: 22 },
});

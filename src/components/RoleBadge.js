import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <View style={[styles.badge, isAdmin ? styles.admin : styles.user]}>
      <Text style={[styles.text, isAdmin ? styles.adminText : styles.userText]}>
        {isAdmin ? 'Admin' : 'User'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  admin: { backgroundColor: colors.accentSoft },
  user: { backgroundColor: colors.infoSoft },
  text: { fontSize: 12, fontWeight: '700' },
  adminText: { color: colors.accentDark },
  userText: { color: colors.info },
});

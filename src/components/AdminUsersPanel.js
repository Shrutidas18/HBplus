import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchUsers } from '../services/api';
import { colors, font, radius, spacing } from '../theme';
import Avatar from './Avatar';
import ErrorBanner from './ErrorBanner';
import Loader from './Loader';
import RoleBadge from './RoleBadge';

/**
 * Only rendered for admins. The /api/users endpoint independently rejects
 * non-admins with 403, so this is not the access control, just the UI.
 */
export default function AdminUsersPanel() {
  const { getIdToken } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, users: [] });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = await getIdToken();
        const users = await fetchUsers(token);
        if (alive) setState({ loading: false, error: null, users });
      } catch (e) {
        const message =
          e && e.status === 403
            ? 'You do not have permission to view this.'
            : 'Could not load the user list.';
        if (alive) setState({ loading: false, error: message, users: [] });
      }
    })();
    return () => {
      alive = false;
    };
  }, [getIdToken]);

  return (
    <View style={styles.card}>
      <Text style={font.heading}>Team members</Text>
      <Text style={[font.small, styles.sub]}>Visible to admins only</Text>

      {state.loading ? <Loader label="Loading users…" /> : null}
      {state.error ? <ErrorBanner message={state.error} /> : null}

      {state.users.map((u, index) => (
        <View key={u.uid} style={[styles.row, index === 0 && styles.firstRow]}>
          <Avatar name={u.name} email={u.email} photoURL={u.photoURL} size={40} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {u.name || u.email}
            </Text>
            <Text style={font.small} numberOfLines={1}>
              {u.email}
            </Text>
          </View>
          <View style={styles.meta}>
            <RoleBadge role={u.role} />
            {u.lastLoginAt ? (
              <Text style={[font.small, styles.date]}>
                {new Date(u.lastLoginAt).toLocaleDateString()}
              </Text>
            ) : null}
          </View>
        </View>
      ))}

      {!state.loading && !state.error && state.users.length === 0 ? (
        <Text style={font.small}>No users yet.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  sub: { marginTop: 2, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md - 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  firstRow: { borderTopWidth: 0 },
  info: { flex: 1, marginHorizontal: spacing.md - 4 },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink },
  meta: { alignItems: 'flex-end' },
  date: { marginTop: 4 },
});

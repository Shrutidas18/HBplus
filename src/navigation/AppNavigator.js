import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();

// URL <-> screen mapping for the web build (/login, /dashboard).
const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: 'login',
      Dashboard: 'dashboard',
    },
  },
};

/**
 * Route protection.
 *
 * Screens are registered conditionally on the auth state. While logged out the
 * Dashboard screen does not exist in the navigator at all, so opening
 * /dashboard directly cannot render it: the user lands on Login instead. After
 * a verified sign-in, the navigator switches to Dashboard; after logout it
 * switches back. There is no way to navigate to a screen that is not
 * registered.
 */
export default function AppNavigator() {
  const { user, initializing } = useAuth();

  // Wait for the saved session to be restored so we don't flash the login page.
  if (initializing) return <Loader fullScreen label="Checking your session…" />;

  return (
    <NavigationContainer linking={linking} documentTitle={{ formatter: () => 'HB+ Portal' }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

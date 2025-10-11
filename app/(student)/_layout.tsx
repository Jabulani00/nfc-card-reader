import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, usePathname, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

export default function StudentLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const tabs = [
    { name: 'my-card', label: 'My Card', icon: '💳', path: '/(student)/my-card' },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Professional Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.card,
        borderBottomColor: colors.border,
      }]}>
        <View style={styles.headerTop}>
          {/* Logo/Title Section */}
          <View style={styles.headerLeft}>
            <View style={[styles.logoBadge, { backgroundColor: colors.info }]}>
              <ThemedText style={styles.logoText}>ST</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.headerTitle}>Student Portal</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Tech University</ThemedText>
            </View>
          </View>

          {/* Logout Icon */}
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              { 
                backgroundColor: colors.danger,
                opacity: pressed ? 0.8 : 1,
              }
            ]}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutIcon}>⎋</ThemedText>
          </Pressable>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Pressable
                key={tab.name}
                style={({ pressed }) => [
                  styles.tab,
                  isActive && [styles.tabActive, { 
                    borderBottomColor: colors.info,
                    backgroundColor: `${colors.info}10`,
                  }],
                  pressed && styles.tabPressed,
                ]}
                onPress={() => router.push(tab.path as any)}
              >
                <ThemedText style={styles.tabIcon}>{tab.icon}</ThemedText>
                <ThemedText style={[
                  styles.tabLabel,
                  isActive && [styles.tabLabelActive, { color: colors.info }]
                ]}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Content Area */}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="my-card" />
      </Stack>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    gap: 6,
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});


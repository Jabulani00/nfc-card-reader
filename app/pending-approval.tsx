import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function PendingApprovalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout, loading } = useAuth();

  // Redirect if user is approved and active
  useEffect(() => {
    if (user && user.isApproved && user.isActive) {
      if (user.role === 'admin') {
        router.replace('/(admin)/students');
      } else if (user.role === 'staff') {
        router.replace('/(staff)/my-card');
      } else {
        router.replace('/(student)/my-card');
      }
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleContactSupport = () => {
    // You can customize this email address
    Linking.openURL('mailto:admin@university.edu?subject=Account Approval Request');
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        {/* Background Gradient Overlay */}
        <View style={styles.gradientOverlay}>
          <View style={[styles.circle, styles.circle1, { backgroundColor: '#00C8FC', opacity: isDark ? 0.08 : 0.12 }]} />
          <View style={[styles.circle, styles.circle2, { backgroundColor: '#00C8FC', opacity: isDark ? 0.08 : 0.12 }]} />
        </View>

        <View style={styles.loadingContainer}>
          {/* Logo */}
          <View style={styles.logoWrapper}>
            {isDark && (
              <View style={styles.logoBackground} />
            )}
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
            />
          </View>

          <ActivityIndicator size="large" color="#00C8FC" style={styles.loadingSpinner} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <ThemedText style={[styles.icon, { color: colors.primary }]}>⏳</ThemedText>
          </View>

          {/* Title */}
          <ThemedText style={styles.title}>Account Pending Approval</ThemedText>

          {/* User Info */}
          {user && (
            <View style={[styles.userInfoCard, { backgroundColor: colors.card }]}>
              <ThemedText style={styles.userInfoLabel}>Name:</ThemedText>
              <ThemedText style={styles.userInfoValue}>
                {user.FirstName} {user.LastName}
              </ThemedText>

              <ThemedText style={[styles.userInfoLabel, styles.mt]}>Email:</ThemedText>
              <ThemedText style={styles.userInfoValue}>{user.email}</ThemedText>

              <ThemedText style={[styles.userInfoLabel, styles.mt]}>Card Number:</ThemedText>
              <ThemedText style={styles.userInfoValue}>{user.cardNumber}</ThemedText>

              <ThemedText style={[styles.userInfoLabel, styles.mt]}>Department:</ThemedText>
              <ThemedText style={styles.userInfoValue}>{user.department}</ThemedText>

              <ThemedText style={[styles.userInfoLabel, styles.mt]}>Role:</ThemedText>
              <ThemedText style={[styles.userInfoValue, styles.roleText]}>
                {user.role.toUpperCase()}
              </ThemedText>

              <ThemedText style={[styles.userInfoLabel, styles.mt]}>Status:</ThemedText>
              <View style={styles.statusContainer}>
                {!user.isApproved && (
                  <View style={[styles.statusBadge, { backgroundColor: '#F59E0B' }]}>
                    <ThemedText style={styles.statusText}>⏳ Pending Approval</ThemedText>
                  </View>
                )}
                {!user.isActive && user.isApproved && (
                  <View style={[styles.statusBadge, { backgroundColor: '#EF4444' }]}>
                    <ThemedText style={styles.statusText}>🔒 Inactive</ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Message */}
          <View style={styles.messageContainer}>
            <ThemedText style={styles.message}>
              Thank you for registering! Your account is currently under review.
            </ThemedText>

            <ThemedText style={[styles.message, styles.mt]}>
              {!user?.isApproved
                ? 'An administrator needs to approve your registration before you can access the system.'
                : 'Your account has been approved but is not yet activated. Please contact your administrator.'}
            </ThemedText>

            <ThemedText style={[styles.message, styles.mt]}>
              You will receive access once the approval process is complete. This typically takes 1-2 business days.
            </ThemedText>
          </View>

          {/* What to do section */}
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.infoTitle}>What to do while you wait:</ThemedText>
            
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoBullet}>1.</ThemedText>
              <ThemedText style={styles.infoText}>
                Check your email regularly for approval notifications
              </ThemedText>
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoBullet}>2.</ThemedText>
              <ThemedText style={styles.infoText}>
                Contact your department administrator if you need urgent access
              </ThemedText>
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoBullet}>3.</ThemedText>
              <ThemedText style={styles.infoText}>
                Ensure all your registration information is correct
              </ThemedText>
            </View>
          </View>

          {/* Contact Information */}
          <View style={[styles.contactCard, { backgroundColor: colors.primary + '10' }]}>
            <ThemedText style={styles.contactTitle}>Need Help?</ThemedText>
            <ThemedText style={styles.contactText}>
              Department: {user?.department}
            </ThemedText>
            <ThemedText style={styles.contactText}>
              Email: admin@university.edu
            </ThemedText>
          </View>

          {/* Action Buttons */}
          <Pressable
            style={({ pressed }) => [
              styles.contactButton,
              { 
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1
              }
            ]}
            onPress={handleContactSupport}
          >
            <ThemedText style={styles.contactButtonText}>📧 Contact Support</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              { 
                borderColor: colors.text,
                opacity: pressed ? 0.6 : 1
              }
            ]}
            onPress={handleLogout}
          >
            <ThemedText style={[styles.logoutButtonText, { color: colors.text }]}>
              Logout
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circle1: {
    width: 400,
    height: 400,
    top: -150,
    right: -150,
  },
  circle2: {
    width: 350,
    height: 350,
    bottom: -120,
    left: -120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    shadowColor: '#00C8FC',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    zIndex: 1,
  },
  loadingSpinner: {
    marginTop: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    opacity: 0.6,
    letterSpacing: 0.3,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  userInfoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  userInfoLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  mt: {
    marginTop: 12,
  },
  roleText: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageContainer: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    width: 24,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  contactCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    marginBottom: 8,
  },
  contactButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


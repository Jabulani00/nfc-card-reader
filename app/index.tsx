import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

export default function LandingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const { user, loading } = useAuth();

  // Redirect already logged-in users based on their status
  useEffect(() => {
    if (!loading && user) {
      // Check if user is approved and active
      if (!user.isApproved || !user.isActive) {
        router.replace('/pending-approval');
        return;
      }

      // Redirect to appropriate dashboard
      if (user.role === 'admin') {
        router.replace('/(admin)/students');
      } else if (user.role === 'staff') {
        router.replace('/(staff)/my-card');
      } else if (user.role === 'student') {
        router.replace('/(student)/my-card');
      }
    }
  }, [user, loading]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        {/* Background Gradient Overlay */}
        <View style={styles.gradientOverlay}>
          <View style={[styles.circle, styles.circle1, { backgroundColor: '#00C8FC', opacity: isDark ? 0.08 : 0.12 }]} />
          <View style={[styles.circle, styles.circle2, { backgroundColor: '#00C8FC', opacity: isDark ? 0.08 : 0.12 }]} />
        </View>

        <View style={[styles.content, styles.centerContent]}>
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

          {/* Loading Indicator */}
          <ActivityIndicator size="large" color="#00C8FC" style={styles.loadingSpinner} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Background Gradient Overlay */}
      <View style={styles.gradientOverlay}>
        <View style={[styles.circle, styles.circle1, { backgroundColor: '#00C8FC', opacity: isDark ? 0.08 : 0.12 }]} />
        <View style={[styles.circle, styles.circle2, { backgroundColor: '#00C8FC', opacity: isDark ? 0.08 : 0.12 }]} />
      </View>

      <View style={styles.content}>
        {/* Logo - with background for dark mode visibility */}
        <View style={styles.logoWrapper}>
          {isDark && (
            <View style={styles.logoBackground} />
          )}
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
          />
        </View>

        {/* Secure Access Badge */}
        <View style={[styles.securityBadge, { borderColor: `${isDark ? '#00C8FC' : '#00C8FC'}40` }]}>
          <View style={styles.securityDot} />
          <ThemedText style={[styles.securityText, { color: colors.textSecondary }]}>
            Secure Authentication
          </ThemedText>
        </View>

        {/* Action Buttons Container */}
        <View style={styles.buttonsContainer}>
          {/* Sign In Button */}
          <Pressable
            style={({ pressed }) => [
              styles.signInButton,
              { 
                backgroundColor: '#00C8FC',
                shadowColor: '#00C8FC',
              },
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/login')}
          >
            <ThemedText style={styles.buttonText}>Sign In</ThemedText>
            <View style={styles.buttonIcon}>
              <ThemedText style={styles.buttonIconText}>→</ThemedText>
            </View>
          </Pressable>

          {/* Sign Up Link Button */}
          <Pressable
            style={({ pressed }) => [
              styles.signUpButton,
              { borderColor: '#00C8FC' },
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/signup')}
          >
            <ThemedText style={[styles.signUpText, { color: '#00C8FC' }]}>Create Account</ThemedText>
          </Pressable>
        </View>

        {/* Footer Text */}
        <ThemedText style={styles.footerText}>
          NFC-enabled access for students & staff
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginTop: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    opacity: 0.6,
    letterSpacing: 0.3,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  logoWrapper: {
    marginBottom: 48,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#FFFFFF',
    shadowColor: '#00C8FC',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    zIndex: 1,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 48,
    gap: 8,
  },
  securityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C8FC',
  },
  securityText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  signInButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footerText: {
    fontSize: 11,
    opacity: 0.45,
    marginTop: 32,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});


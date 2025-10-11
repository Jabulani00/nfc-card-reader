import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

export default function LandingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      {/* Background Gradient Overlay */}
      <View style={styles.gradientOverlay}>
        <View style={[styles.circle, styles.circle1, { backgroundColor: colors.primary, opacity: isDark ? 0.1 : 0.15 }]} />
        <View style={[styles.circle, styles.circle2, { backgroundColor: colors.primary, opacity: isDark ? 0.1 : 0.15 }]} />
      </View>

      <View style={styles.content}>
        {/* Logo Container with Shadow */}
        <View style={styles.logoWrapper}>
          <View style={[styles.logoShadow, { backgroundColor: `${colors.primary}30` }]} />
          <View style={[styles.logoContainer, { backgroundColor: colors.card }]}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
            />
          </View>
        </View>

        {/* University Name */}
        <ThemedText style={styles.universityName}>
          Tech University
        </ThemedText>

        {/* Slogan */}
        <View style={styles.sloganContainer}>
          <View style={[styles.sloganLine, { backgroundColor: colors.primary }]} />
          <ThemedText style={styles.slogan}>
            Excellence in Education & Innovation
          </ThemedText>
          <View style={[styles.sloganLine, { backgroundColor: colors.primary }]} />
        </View>

        {/* NFC Badge */}
        <View style={[styles.nfcBadge, { backgroundColor: `${colors.primary}15` }]}>
          <ThemedText style={styles.nfcIcon}>📱</ThemedText>
          <ThemedText style={[styles.nfcText, { color: colors.primary }]}>NFC Card Reader System</ThemedText>
        </View>

        {/* Sign In Button */}
        <Pressable
          style={({ pressed }) => [
            styles.signInButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            pressed && styles.signInButtonPressed,
          ]}
          onPress={() => router.push('/login')}
        >
          <ThemedText style={styles.signInButtonText}>Sign In</ThemedText>
          <ThemedText style={styles.signInButtonIcon}>→</ThemedText>
        </Pressable>

        {/* Footer Text */}
        <ThemedText style={styles.footerText}>
          Secure Access for Students & Staff
        </ThemedText>
      </View>
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
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    bottom: -80,
    left: -80,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  logoShadow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    top: 10,
    left: -10,
  },
  logoContainer: {
    borderRadius: 85,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  universityName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  sloganContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  sloganLine: {
    width: 30,
    height: 2,
    opacity: 0.5,
  },
  slogan: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nfcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 48,
    gap: 8,
  },
  nfcIcon: {
    fontSize: 24,
  },
  nfcText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 30,
    minWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signInButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signInButtonIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 24,
    textAlign: 'center',
  },
});


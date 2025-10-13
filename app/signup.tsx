import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserRole } from '@/models/User';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const { user, register, loading } = useAuth();
  const toast = useToast();
  
  const [isStudent, setIsStudent] = useState(true);
  const [FirstName, setFirstName] = useState('');
  const [LastName, setLastName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageBase64, setImageBase64] = useState<string>();
  const [imageUri, setImageUri] = useState<string>();

  // Navigate based on user role after registration
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/(admin)/students');
      } else if (user.role === 'staff') {
        // If not approved, show message
        if (!user.isApproved) {
          Alert.alert(
            'Registration Successful',
            'Your account is pending approval. You will be notified once approved.',
            [{ text: 'OK', onPress: () => router.replace('/login') }]
          );
        } else {
          router.replace('/(staff)/my-card');
        }
      } else {
        // Student
        if (!user.isApproved) {
          Alert.alert(
            'Registration Successful',
            'Your account is pending approval. You will be notified once approved.',
            [{ text: 'OK', onPress: () => router.replace('/login') }]
          );
        } else {
          router.replace('/(student)/my-card');
        }
      }
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        toast.warning('We need camera roll permissions to select a profile picture');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        if (asset.base64) {
          setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
        }
        toast.success('Profile picture selected');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error('Failed to select image');
    }
  };

  const handleSignUp = async () => {
    // Validation
    if (!FirstName || !LastName || !cardNumber || !email || !department || !password || !confirmPassword) {
      toast.warning('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      toast.info('Creating account...');
      const role: UserRole = isStudent ? 'student' : 'staff';
      
      await register({
        email,
        password,
        FirstName,
        LastName,
        cardNumber,
        imageBase64,
        role,
        department,
      });
      
      toast.success('Registration successful! Pending approval.');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create account';
      
      // Handle specific errors
      if (errorMessage.includes('Card number already exists')) {
        toast.error('This card number is already registered');
      } else if (errorMessage.includes('email-already-in-use')) {
        toast.error('This email is already registered');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Background Gradient Overlay */}
      <View style={styles.gradientOverlay}>
        <View style={[styles.circle, styles.circle1, { backgroundColor: '#00C8FC', opacity: isDark ? 0.08 : 0.12 }]} />
        <View style={[styles.circle, styles.circle2, { backgroundColor: '#00C8FC', opacity: isDark ? 0.08 : 0.12 }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
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

            <ThemedText style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>Please fill in the details below</ThemedText>

            {/* Profile Image Picker */}
            <View style={styles.imageContainer}>
              <Pressable 
                onPress={pickImage}
                style={[styles.imagePicker, { borderColor: '#00C8FC' }]}
                disabled={loading}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.profileImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <ThemedText style={[styles.imageText, { color: '#00C8FC' }]}>
                      + Add Photo
                    </ThemedText>
                    <ThemedText style={styles.imageSubtext}>(Optional)</ThemedText>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Student/Staff Toggle */}
            <View style={[styles.toggleContainer, { backgroundColor: '#00C8FC15' }]}>
              <ThemedText style={styles.toggleLabel}>I am a:</ThemedText>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleText, !isStudent && styles.toggleTextActive]}>
                  Staff
                </ThemedText>
                <Switch
                  value={isStudent}
                  onValueChange={setIsStudent}
                  trackColor={{ false: colors.warning, true: '#00C8FC' }}
                  thumbColor="#FFFFFF"
                />
                <ThemedText style={[styles.toggleText, isStudent && styles.toggleTextActive]}>
                  Student
                </ThemedText>
              </View>
            </View>

            {/* First Name Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>First Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your first name"
                placeholderTextColor={colors.textTertiary}
                value={FirstName}
                onChangeText={setFirstName}
                editable={!loading}
              />
            </View>

            {/* Last Name Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Last Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your last name"
                placeholderTextColor={colors.textTertiary}
                value={LastName}
                onChangeText={setLastName}
                editable={!loading}
              />
            </View>

            {/* Card Number Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {isStudent ? 'Student Card Number' : 'Staff Card Number'}
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }
                ]}
                placeholder={`Enter your ${isStudent ? 'student' : 'staff'} card number`}
                placeholderTextColor={colors.textTertiary}
                value={cardNumber}
                onChangeText={setCardNumber}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Department Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Department</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your department"
                placeholderTextColor={colors.textTertiary}
                value={department}
                onChangeText={setDepartment}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirm Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  }
                ]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Sign Up Button */}
            <Pressable
              style={({ pressed }) => [
                styles.signUpButton,
                { 
                  backgroundColor: '#00C8FC',
                  shadowColor: '#00C8FC',
                },
                (pressed || loading) && styles.signUpButtonPressed,
              ]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.signUpButtonText}>Create Account</ThemedText>
              )}
            </Pressable>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
              <Pressable onPress={() => router.push('/login')}>
                <ThemedText style={[styles.loginLink, { color: '#00C8FC' }]}>Sign In</ThemedText>
              </Pressable>
            </View>

            {/* Back to Home Link */}
            <Pressable onPress={() => router.push('/')} style={styles.backToHomeContainer}>
              <ThemedText style={[styles.backToHomeText, { color: colors.textTertiary }]}>← Back to Home</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 32,
  },
  logoWrapper: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    shadowColor: '#00C8FC',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  toggleContainer: {
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  toggleText: {
    fontSize: 14,
    opacity: 0.5,
  },
  toggleTextActive: {
    fontWeight: '600',
    opacity: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  signUpButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 13,
    opacity: 0.7,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  backToHomeContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  backToHomeText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  imageSubtext: {
    fontSize: 11,
    opacity: 0.6,
  },
});


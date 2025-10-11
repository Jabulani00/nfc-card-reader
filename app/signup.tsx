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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <ThemedText style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>Please fill in the details below</ThemedText>

            {/* Profile Image Picker */}
            <View style={styles.imageContainer}>
              <Pressable 
                onPress={pickImage}
                style={[styles.imagePicker, { borderColor: colors.primary }]}
                disabled={loading}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.profileImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <ThemedText style={[styles.imageText, { color: colors.primary }]}>
                      + Add Photo
                    </ThemedText>
                    <ThemedText style={styles.imageSubtext}>(Optional)</ThemedText>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Student/Staff Toggle */}
            <View style={[styles.toggleContainer, { backgroundColor: `${colors.primary}15` }]}>
              <ThemedText style={styles.toggleLabel}>I am a:</ThemedText>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleText, !isStudent && styles.toggleTextActive]}>
                  Staff
                </ThemedText>
                <Switch
                  value={isStudent}
                  onValueChange={setIsStudent}
                  trackColor={{ false: colors.warning, true: colors.success }}
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
                { backgroundColor: colors.primary },
                (pressed || loading) && styles.signUpButtonPressed,
              ]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.signUpButtonText}>Sign Up</ThemedText>
              )}
            </Pressable>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
              <Pressable onPress={() => router.push('/login')}>
                <ThemedText style={[styles.loginLink, { color: colors.primary }]}>Login</ThemedText>
              </Pressable>
            </View>

            {/* Back to Home Link */}
            <Pressable onPress={() => router.push('/')} style={styles.backToHomeContainer}>
              <ThemedText style={styles.backToHomeText}>← Back to Home</ThemedText>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  toggleContainer: {
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  toggleText: {
    fontSize: 16,
    opacity: 0.5,
  },
  toggleTextActive: {
    fontWeight: '600',
    opacity: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  signUpButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  signUpButtonPressed: {
    opacity: 0.8,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  backToHomeContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  backToHomeText: {
    fontSize: 14,
    opacity: 0.6,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  imageSubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
});


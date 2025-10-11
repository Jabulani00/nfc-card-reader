import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface UserCardLoadingProps {
  color?: string;
  message?: string;
}

export function UserCardLoading({ color, message = 'Loading your card...' }: UserCardLoadingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const indicatorColor = color || colors.primary;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={indicatorColor} />
        <ThemedText style={styles.loadingText}>{message}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
});


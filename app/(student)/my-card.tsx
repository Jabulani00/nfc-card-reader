import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

export default function StudentMyCardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.info }]}>
            <ThemedText style={styles.avatarText}>JS</ThemedText>
          </View>
          <ThemedText style={styles.profileName}>John Student</ThemedText>
          <ThemedText style={styles.profileEmail}>john@university.edu</ThemedText>
        </View>

        {/* NFC Card */}
        <View style={[styles.cardContainer, { 
          backgroundColor: isDark ? colors.backgroundTertiary : colors.card,
        }]}>
          <View style={[styles.card, { 
            backgroundColor: colors.info,
            shadowColor: colors.shadow,
          }]}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.cardLogo}
              />
              <ThemedText style={styles.cardTitle}>Tech University</ThemedText>
            </View>

            {/* Card Body */}
            <View style={styles.cardBody}>
              <ThemedText style={styles.cardLabel}>Student</ThemedText>
              <ThemedText style={styles.cardName}>John Student</ThemedText>
              <ThemedText style={styles.cardNumber}>ID: ST001</ThemedText>
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.nfcChip}>
                <ThemedText style={styles.nfcIcon}>📱</ThemedText>
              </View>
              <ThemedText style={styles.cardValid}>Valid Until: 2026</ThemedText>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }]}>
            <ThemedText style={styles.infoIcon}>👨‍🎓</ThemedText>
            <ThemedText style={styles.infoLabel}>Role</ThemedText>
            <ThemedText style={styles.infoValue}>Student</ThemedText>
          </View>

          <View style={[styles.infoCard, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }]}>
            <ThemedText style={styles.infoIcon}>🏢</ThemedText>
            <ThemedText style={styles.infoLabel}>Department</ThemedText>
            <ThemedText style={styles.infoValue}>Computer Science</ThemedText>
          </View>
        </View>

        {/* Access Status */}
        <View style={[styles.accessCard, { 
          backgroundColor: colors.card,
          borderColor: colors.success,
        }]}>
          <View style={styles.accessHeader}>
            <ThemedText style={styles.accessIcon}>✓</ThemedText>
            <View style={styles.accessInfo}>
              <ThemedText style={styles.accessTitle}>Access Status</ThemedText>
              <ThemedText style={styles.accessSubtitle}>Your card is active</ThemedText>
            </View>
          </View>
          <View style={[styles.accessBadge, { backgroundColor: colors.success }]}>
            <ThemedText style={styles.accessBadgeText}>ACTIVE</ThemedText>
          </View>
        </View>

        {/* Account Details */}
        <View style={[styles.detailsCard, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          <ThemedText style={styles.detailsTitle}>Card Information</ThemedText>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Student Number:</ThemedText>
            <ThemedText style={styles.detailValue}>ST001</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Year:</ThemedText>
            <ThemedText style={styles.detailValue}>3rd Year</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Card Registered:</ThemedText>
            <ThemedText style={styles.detailValue}>Sep 15, 2024</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Card Status:</ThemedText>
            <ThemedText style={[styles.detailValue, { color: colors.success }]}>Active & Valid</ThemedText>
          </View>
        </View>

        {/* Usage Info */}
        <View style={[styles.infoBox, { 
          backgroundColor: `${colors.info}15`,
          borderColor: colors.info,
        }]}>
          <ThemedText style={styles.infoBoxIcon}>ℹ️</ThemedText>
          <View style={styles.infoBoxContent}>
            <ThemedText style={styles.infoBoxTitle}>How to Use Your Card</ThemedText>
            <ThemedText style={styles.infoBoxText}>
              Present this card at NFC readers around campus for building access, library services, and meal plans.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  cardContainer: {
    padding: 16,
    borderRadius: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  cardLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nfcChip: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcIcon: {
    fontSize: 20,
  },
  cardValid: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoSection: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  accessCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  accessIcon: {
    fontSize: 32,
    color: '#34C759',
  },
  accessInfo: {
    flex: 1,
  },
  accessTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  accessSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  accessBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  accessBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  detailsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoBoxIcon: {
    fontSize: 24,
  },
  infoBoxContent: {
    flex: 1,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoBoxText: {
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
  },
});


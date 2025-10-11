import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserCardLoading } from '@/components/user-card-loading';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserCard } from '@/hooks/use-user-card';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

export default function StaffMyCardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const card = useUserCard();

  if (!card.isReady) {
    return <UserCardLoading color={colors.secondary} />;
  }

  const { user } = card;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {card.hasProfileImage() ? (
            <Image source={{ uri: user!.imageUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarContainer, { backgroundColor: colors.secondary }]}>
              <ThemedText style={styles.avatarText}>{card.getInitials('SF')}</ThemedText>
            </View>
          )}
          <ThemedText style={styles.profileName}>{card.getFullName()}</ThemedText>
          <ThemedText style={styles.profileEmail}>{user!.email}</ThemedText>
        </View>

        {/* NFC Card */}
        <View style={[styles.cardContainer, { 
          backgroundColor: isDark ? colors.backgroundTertiary : colors.card,
        }]}>
          <View style={[styles.card, { 
            backgroundColor: '#FFFFFF',
            shadowColor: colors.shadow,
            borderColor: colors.border,
          }]}>
            {/* Card Header - Role Title */}
            <View style={styles.cardHeader}>
              <ThemedText style={[styles.roleTitle, { color: colors.secondary }]}>STAFF</ThemedText>
              <View style={[styles.headerLine, { backgroundColor: colors.secondary }]} />
            </View>

            {/* Card Body - Landscape Access Card Layout */}
            <View style={styles.cardBody}>
              {/* Left Side - Decorative Elements */}
              <View style={styles.leftSide}>
                <View style={styles.decorativeElements}>
                  <View style={[styles.diamond, styles.diamond1, { backgroundColor: colors.secondary }]} />
                  <View style={[styles.diamond, styles.diamond2, { backgroundColor: colors.info }]} />
                  <View style={[styles.diamond, styles.diamond3, { backgroundColor: colors.warning }]} />
                  <View style={[styles.diamond, styles.diamond4, { backgroundColor: colors.error }]} />
                  <View style={[styles.zigzagLine, { backgroundColor: colors.text }]} />
                  <View style={[styles.curvedLine, { backgroundColor: colors.error }]} />
                </View>
              </View>

              {/* Center - User Info */}
              <View style={styles.centerSection}>
                <View style={styles.userInfoSection}>
                  <ThemedText style={[styles.userName, { color: colors.secondary }]}>
                    {user!.firstName} {user!.lastName}
                  </ThemedText>
                  <ThemedText style={[styles.cardNumberText, { color: colors.text }]}>
                    {user!.cardNumber}
                  </ThemedText>
                  <ThemedText style={[styles.accessDate, { color: colors.text }]}>
                    Access: {card.formatDate(user!.createdAt)}
                  </ThemedText>
                  <ThemedText style={[styles.department, { color: colors.error }]}>
                    {user!.department}
                  </ThemedText>
                </View>
              </View>

              {/* Right Side - Profile Photo */}
              <View style={styles.rightSide}>
                {card.hasProfileImage() ? (
                  <Image source={{ uri: user!.imageUrl }} style={styles.profilePhoto} />
                ) : (
                  <View style={[styles.profilePlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
                    <ThemedText style={[styles.profileInitials, { color: colors.secondary }]}>
                      {card.getInitials('SF')}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Hidden NFC ID for reading */}
              <View style={styles.hiddenNfc}>
                <ThemedText style={styles.nfcId}>{user!.nfcId || user!.uid}</ThemedText>
              </View>
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.footerLeft}>
                <ThemedText style={[styles.universityShort, { color: colors.text }]}>TU</ThemedText>
                <View style={styles.barcode}>
                  <View style={[styles.bar, { backgroundColor: colors.text }]} />
                  <View style={[styles.bar, styles.bar2, { backgroundColor: colors.text }]} />
                  <View style={[styles.bar, styles.bar3, { backgroundColor: colors.text }]} />
                  <View style={[styles.bar, { backgroundColor: colors.text }]} />
                  <View style={[styles.bar, styles.bar5, { backgroundColor: colors.text }]} />
                  <View style={[styles.bar, { backgroundColor: colors.text }]} />
                  <View style={[styles.bar, styles.bar7, { backgroundColor: colors.text }]} />
                  <View style={[styles.bar, { backgroundColor: colors.text }]} />
                </View>
              </View>
              <View style={styles.footerRight}>
                <ThemedText style={[styles.universityName, { color: colors.text }]}>Tech University</ThemedText>
                <ThemedText style={[styles.universityFull, { color: colors.text }]}>University of Technology</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }]}>
            <ThemedText style={styles.infoIcon}>👨‍💼</ThemedText>
            <ThemedText style={styles.infoLabel}>Role</ThemedText>
            <ThemedText style={styles.infoValue}>{card.getRoleDisplayName('staff')}</ThemedText>
          </View>

          <View style={[styles.infoCard, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }]}>
            <ThemedText style={styles.infoIcon}>🏢</ThemedText>
            <ThemedText style={styles.infoLabel}>Department</ThemedText>
            <ThemedText style={styles.infoValue}>{user!.department}</ThemedText>
          </View>
        </View>

        {/* Access Status */}
        <View style={[styles.accessCard, { 
          backgroundColor: colors.card,
          borderColor: card.shouldShowSuccess() ? colors.success : colors.error,
        }]}>
          <View style={styles.accessHeader}>
            <ThemedText style={styles.accessIcon}>{user!.isActive ? '✓' : '✕'}</ThemedText>
            <View style={styles.accessInfo}>
              <ThemedText style={styles.accessTitle}>Access Status</ThemedText>
              <ThemedText style={styles.accessSubtitle}>
                {card.getAccessStatusText('staff')}
              </ThemedText>
            </View>
          </View>
          <View style={[styles.accessBadge, { backgroundColor: user!.isActive ? colors.success : colors.error }]}>
            <ThemedText style={styles.accessBadgeText}>{user!.isActive ? 'ACTIVE' : 'INACTIVE'}</ThemedText>
          </View>
        </View>

        {/* Account Details */}
        <View style={[styles.detailsCard, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          <ThemedText style={styles.detailsTitle}>Account Details</ThemedText>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Card Number:</ThemedText>
            <ThemedText style={styles.detailValue}>{user!.cardNumber}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Email:</ThemedText>
            <ThemedText style={styles.detailValue}>{user!.email}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Department:</ThemedText>
            <ThemedText style={styles.detailValue}>{user!.department}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Access Level:</ThemedText>
            <ThemedText style={styles.detailValue}>{card.getAccessLevel('staff')}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Member Since:</ThemedText>
            <ThemedText style={styles.detailValue}>{card.formatDate(user!.createdAt)}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Card Status:</ThemedText>
            <ThemedText style={[styles.detailValue, { 
              color: card.shouldShowSuccess() ? colors.success : card.shouldShowWarning() ? colors.warning : colors.error 
            }]}>
              {card.getCardStatus()}
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
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1.6, // Landscape ratio - requires phone rotation
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerLine: {
    height: 2,
    width: '100%',
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSide: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSection: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rightSide: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoSection: {
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 18,
  },
  cardNumberText: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 4,
    fontWeight: '500',
  },
  accessDate: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  department: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profilePhoto: {
    width: 70,
    height: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000000',
  },
  profilePlaceholder: {
    width: 70,
    height: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  decorativeElements: {
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diamond: {
    width: 8,
    height: 8,
    transform: [{ rotate: '45deg' }],
  },
  diamond1: {
    marginBottom: 4,
  },
  diamond2: {
    marginBottom: 4,
  },
  diamond3: {
    marginBottom: 4,
  },
  diamond4: {
    marginBottom: 8,
  },
  zigzagLine: {
    width: 2,
    height: 20,
    marginBottom: 8,
  },
  curvedLine: {
    width: 15,
    height: 15,
    borderRadius: 15,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  hiddenNfc: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
  nfcId: {
    fontSize: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  universityShort: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  barcode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bar: {
    width: 2,
    height: 20,
  },
  bar2: {
    height: 25,
  },
  bar3: {
    height: 15,
  },
  bar5: {
    height: 30,
  },
  bar7: {
    height: 18,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  universityName: {
    fontSize: 10,
    fontWeight: '500',
  },
  universityFull: {
    fontSize: 8,
    marginTop: 2,
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
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
});


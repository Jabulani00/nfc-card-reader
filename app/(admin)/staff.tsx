import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { User } from '@/models/User';
import { UserService } from '@/services/userService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function StaffScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [staff, setStaff] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch staff
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const users = await UserService.getUsersByRole('staff');
      setStaff(users);
    } catch (error) {
      console.error('Error fetching staff:', error);
      Alert.alert('Error', 'Failed to load staff');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredStaff.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStaff.map(s => s.uid)));
    }
  };

  const activateBulk = async () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      'Activate Staff',
      `Activate ${selectedIds.size} staff member(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            try {
              setRefreshing(true);
              const selectedCount = selectedIds.size;
              
              // Activate all selected staff
              const promises = Array.from(selectedIds).map(uid => 
                UserService.updateUser(uid, { isActive: true })
              );
              
              await Promise.all(promises);
              
              // Refresh list
              await fetchStaff();
              setSelectedIds(new Set());
              
              Alert.alert('Success', `Activated ${selectedCount} staff member(s)`);
            } catch (error) {
              console.error('Error activating staff:', error);
              Alert.alert('Error', 'Failed to activate some staff members');
            }
          }
        }
      ]
    );
  };

  const revokeBulk = async () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      'Deactivate Staff',
      `Deactivate ${selectedIds.size} staff member(s)? They will lose access to the system.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              setRefreshing(true);
              const selectedCount = selectedIds.size;
              
              // Deactivate all selected staff
              const promises = Array.from(selectedIds).map(uid => 
                UserService.deactivateUser(uid)
              );
              
              await Promise.all(promises);
              
              // Refresh list
              await fetchStaff();
              setSelectedIds(new Set());
              
              Alert.alert('Success', `Deactivated ${selectedCount} staff member(s)`);
            } catch (error) {
              console.error('Error deactivating staff:', error);
              Alert.alert('Error', 'Failed to deactivate some staff members');
            }
          }
        }
      ]
    );
  };

  const toggleApprovalPermission = async (uid: string, canApprove: boolean) => {
    Alert.alert(
      'Update Permissions',
      canApprove 
        ? 'Grant this staff member permission to approve students?' 
        : 'Remove student approval permissions from this staff member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await UserService.updateStaffApprovalPermission(uid, canApprove);
              await fetchStaff();
              Alert.alert('Success', `Permissions updated successfully`);
            } catch (error) {
              console.error('Error updating permissions:', error);
              Alert.alert('Error', 'Failed to update permissions');
            }
          }
        }
      ]
    );
  };

  const filteredStaff = staff.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) ||
           s.email.toLowerCase().includes(search) ||
           s.cardNumber.toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: 16 }}>Loading staff...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header Actions */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: colors.border,
          }]}
          placeholder="Search staff..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/add-user?type=staff')}
          >
            <ThemedText style={styles.buttonText}>+ Add Staff</ThemedText>
          </Pressable>
          
          <Pressable
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={activateBulk}
            disabled={selectedIds.size === 0 || refreshing}
          >
            <ThemedText style={[styles.buttonText, (selectedIds.size === 0 || refreshing) && styles.buttonTextDisabled]}>
              {refreshing ? '...' : `Activate (${selectedIds.size})`}
            </ThemedText>
          </Pressable>
          
          <Pressable
            style={[styles.button, { backgroundColor: colors.danger }]}
            onPress={revokeBulk}
            disabled={selectedIds.size === 0 || refreshing}
          >
            <ThemedText style={[styles.buttonText, (selectedIds.size === 0 || refreshing) && styles.buttonTextDisabled]}>
              {refreshing ? '...' : `Revoke (${selectedIds.size})`}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={fetchStaff}
            disabled={refreshing}
          >
            <ThemedText style={[styles.buttonText, refreshing && styles.buttonTextDisabled]}>
              🔄 Refresh
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {staff.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>👨‍💼</ThemedText>
            <ThemedText style={styles.emptyTitle}>No Staff</ThemedText>
            <ThemedText style={styles.emptyText}>
              No staff members registered yet
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Select All */}
            <Pressable
              style={[styles.selectAllRow, { backgroundColor: colors.backgroundSecondary }]}
              onPress={selectAll}
            >
              <View style={[styles.checkbox, selectedIds.size === filteredStaff.length && selectedIds.size > 0 && { backgroundColor: colors.primary }]}>
                {selectedIds.size === filteredStaff.length && selectedIds.size > 0 && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </View>
              <ThemedText style={styles.selectAllText}>Select All ({filteredStaff.length})</ThemedText>
            </Pressable>

            {/* Staff List */}
            {filteredStaff.map((member) => (
              <Pressable
                key={member.uid}
                style={[styles.card, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }]}
                onPress={() => toggleSelection(member.uid)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.checkbox, selectedIds.has(member.uid) && { backgroundColor: colors.primary }]}>
                    {selectedIds.has(member.uid) && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <ThemedText style={styles.cardTitle}>
                      {member.firstName} {member.lastName}
                    </ThemedText>
                    <ThemedText style={styles.cardSubtitle}>{member.cardNumber}</ThemedText>
                  </View>
                  <View style={[styles.badge, { 
                    backgroundColor: member.isActive ? colors.success : colors.danger 
                  }]}>
                    <ThemedText style={styles.badgeText}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <ThemedText style={styles.detailText}>📧 {member.email}</ThemedText>
                  <ThemedText style={styles.detailText}>🏢 {member.department}</ThemedText>
                  <ThemedText style={styles.detailText}>
                    {member.isApproved ? '✓ Approved' : '⏳ Pending'}
                  </ThemedText>
                  <ThemedText style={styles.detailText}>
                    {member.canApproveStudents ? '✓ Can Approve Students' : '✕ Cannot Approve'}
                  </ThemedText>
                  {member.nfcId && (
                    <ThemedText style={styles.detailText}>🔑 NFC: {member.nfcId}</ThemedText>
                  )}
                </View>
                
                {/* Toggle Approval Permission */}
                <Pressable
                  style={[styles.permissionButton, { 
                    backgroundColor: member.canApproveStudents ? colors.warning : colors.success 
                  }]}
                  onPress={() => toggleApprovalPermission(member.uid, !member.canApproveStudents)}
                >
                  <ThemedText style={styles.permissionButtonText}>
                    {member.canApproveStudents ? 'Remove Approval Rights' : 'Grant Approval Rights'}
                  </ThemedText>
                </Pressable>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    gap: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.8,
  },
  permissionButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});


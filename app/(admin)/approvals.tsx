import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { User } from '@/models/User';
import { AdminService } from '@/services/adminService';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function ApprovalsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const toast = useToast();
  
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch pending approvals
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const users = await AdminService.getPendingApprovals();
      setPendingUsers(users);
      if (!loading) {
        toast.success('Pending approvals refreshed');
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
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
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.uid)));
    }
  };

  const approveSelected = async () => {
    console.log('Approve button clicked, selected:', selectedIds.size);
    if (selectedIds.size === 0) {
      toast.warning('No users selected');
      return;
    }
    
    try {
      setRefreshing(true);
      toast.info(`Approving ${selectedIds.size} user(s)...`);
      const selectedCount = selectedIds.size;
      
      // Approve all selected users using AdminService
      const result = await AdminService.approveBulk(Array.from(selectedIds));
      
      // Refresh list
      await fetchPendingUsers();
      setSelectedIds(new Set());
      
      if (result.failed > 0) {
        toast.warning(`Approved ${result.success} user(s). ${result.failed} failed.`);
      } else {
        toast.success(`Approved ${selectedCount} user(s) successfully!`);
      }
    } catch (error) {
      console.error('Error approving users:', error);
      toast.error('Failed to approve users');
    } finally {
      setRefreshing(false);
    }
  };

  const rejectSelected = async () => {
    console.log('Reject button clicked, selected:', selectedIds.size);
    if (selectedIds.size === 0) {
      toast.warning('No users selected');
      return;
    }
    
    try {
      setRefreshing(true);
      toast.info(`Rejecting ${selectedIds.size} user(s)...`);
      const selectedCount = selectedIds.size;
      
      // Reject all selected users using AdminService
      const result = await AdminService.rejectBulk(Array.from(selectedIds));
      
      // Refresh list
      await fetchPendingUsers();
      setSelectedIds(new Set());
      
      if (result.failed > 0) {
        toast.warning(`Rejected ${result.success} user(s). ${result.failed} failed.`);
      } else {
        toast.success(`Rejected ${selectedCount} user(s) successfully!`);
      }
    } catch (error) {
      console.error('Error rejecting users:', error);
      toast.error('Failed to reject users');
    } finally {
      setRefreshing(false);
    }
  };

  const revokeAll = async () => {
    console.log('Revoke All button clicked, pending users:', pendingUsers.length);
    if (pendingUsers.length === 0) {
      toast.warning('No pending users to reject');
      return;
    }

    Alert.alert(
      'Reject All Users',
      'Are you sure you want to reject all pending registrations?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject All',
          style: 'destructive',
          onPress: async () => {
            try {
              setRefreshing(true);
              toast.info(`Rejecting ${pendingUsers.length} user(s)...`);
              const count = pendingUsers.length;
              
              // Reject all pending users using AdminService
              const result = await AdminService.rejectBulk(
                pendingUsers.map(user => user.uid)
              );
              
              // Refresh list
              await fetchPendingUsers();
              setSelectedIds(new Set());
              
              if (result.failed > 0) {
                toast.warning(`Rejected ${result.success} user(s). ${result.failed} failed.`);
              } else {
                toast.success(`Rejected ${count} pending user(s) successfully!`);
              }
            } catch (error) {
              console.error('Error rejecting all users:', error);
              toast.error('Failed to reject all users');
            } finally {
              setRefreshing(false);
            }
          }
        }
      ]
    );
  };

  const filteredUsers = pendingUsers.filter(u => {
    const fullName = `${u.FirstName} ${u.LastName}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) ||
           u.email.toLowerCase().includes(search) ||
           u.cardNumber.toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: 16 }}>Loading pending approvals...</ThemedText>
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
          placeholder="Search pending users..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.secondary },
              pressed && styles.buttonPressed,
              (selectedIds.size === 0 || refreshing) && styles.buttonDisabled
            ]}
            onPress={approveSelected}
            disabled={selectedIds.size === 0 || refreshing}
          >
            <ThemedText style={[styles.buttonText, (selectedIds.size === 0 || refreshing) && styles.buttonTextDisabled]}>
              {refreshing ? '...' : `✓ Approve (${selectedIds.size})`}
            </ThemedText>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.warning },
              pressed && styles.buttonPressed,
              (selectedIds.size === 0 || refreshing) && styles.buttonDisabled
            ]}
            onPress={rejectSelected}
            disabled={selectedIds.size === 0 || refreshing}
          >
            <ThemedText style={[styles.buttonText, (selectedIds.size === 0 || refreshing) && styles.buttonTextDisabled]}>
              {refreshing ? '...' : `✕ Reject (${selectedIds.size})`}
            </ThemedText>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.danger },
              pressed && styles.buttonPressed,
              (pendingUsers.length === 0 || refreshing) && styles.buttonDisabled
            ]}
            onPress={revokeAll}
            disabled={pendingUsers.length === 0 || refreshing}
          >
            <ThemedText style={[styles.buttonText, (pendingUsers.length === 0 || refreshing) && styles.buttonTextDisabled]}>
              Reject All
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
              refreshing && styles.buttonDisabled
            ]}
            onPress={fetchPendingUsers}
            disabled={refreshing}
          >
            <ThemedText style={[styles.buttonText, refreshing && styles.buttonTextDisabled]}>
              🔄 Refresh
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {pendingUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>✓</ThemedText>
            <ThemedText style={styles.emptyTitle}>No Pending Approvals</ThemedText>
            <ThemedText style={styles.emptyText}>
              All user registrations have been processed
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Select All */}
            <Pressable
              style={[styles.selectAllRow, { backgroundColor: colors.backgroundSecondary }]}
              onPress={selectAll}
            >
              <View style={[styles.checkbox, selectedIds.size === filteredUsers.length && selectedIds.size > 0 && { backgroundColor: colors.primary }]}>
                {selectedIds.size === filteredUsers.length && selectedIds.size > 0 && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </View>
              <ThemedText style={styles.selectAllText}>Select All ({filteredUsers.length})</ThemedText>
            </Pressable>

            {/* Pending Users List */}
            {filteredUsers.map((user) => (
              <Pressable
                key={user.uid}
                style={[styles.card, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }]}
                onPress={() => toggleSelection(user.uid)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.checkbox, selectedIds.has(user.uid) && { backgroundColor: colors.primary }]}>
                    {selectedIds.has(user.uid) && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <ThemedText style={styles.cardTitle}>
                      {user.FirstName} {user.LastName}
                    </ThemedText>
                    <ThemedText style={styles.cardSubtitle}>{user.cardNumber}</ThemedText>
                  </View>
                  <View style={[styles.badge, { 
                    backgroundColor: user.role === 'student' ? colors.info : colors.warning 
                  }]}>
                    <ThemedText style={styles.badgeText}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <ThemedText style={styles.detailText}>📧 {user.email}</ThemedText>
                  <ThemedText style={styles.detailText}>🏢 {user.department}</ThemedText>
                  <ThemedText style={styles.detailText}>
                    📅 Registered: {user.createdAt.toLocaleDateString()}
                  </ThemedText>
                </View>
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
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
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
});


import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { colors } from '../theme/colors';
import { OfflineStore } from '../database/offlineStore';

interface Props {
  onSyncTriggered?: () => void;
}

export const OfflineBar: React.FC<Props> = ({ onSyncTriggered }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const refreshCount = async () => {
    const count = await OfflineStore.getPendingSyncCount();
    setPendingCount(count);
  };

  useEffect(() => {
    refreshCount();
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        // Automatically sync queued reports when network comes back online
        OfflineStore.syncAllPending().then(() => {
          refreshCount();
          if (onSyncTriggered) onSyncTriggered();
        });
      }
    });

    const interval = setInterval(refreshCount, 3000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [onSyncTriggered]);

  const handleManualSync = async () => {
    if (isOnline) {
      await OfflineStore.syncAllPending();
      await refreshCount();
      if (onSyncTriggered) onSyncTriggered();
    }
  };

  return (
    <View style={[styles.container, isOnline ? styles.onlineContainer : styles.offlineContainer]}>
      <View style={styles.statusRow}>
        <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
        <Text style={styles.statusText}>
          {isOnline ? 'ONLINE // GRID CONNECTED' : 'OFFLINE MODE // LOCAL STORAGE ACTIVE'}
        </Text>
      </View>

      {pendingCount > 0 && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleManualSync}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>
            {pendingCount} QUEUED {isOnline ? '· TAP TO SYNC' : ''}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  onlineContainer: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(69, 70, 77, 0.4)',
  },
  offlineContainer: {
    backgroundColor: '#93000a',
    borderBottomWidth: 1,
    borderBottomColor: '#ffb4ab',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotOnline: {
    backgroundColor: colors.riskLow,
  },
  dotOffline: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#e4e2e4',
    letterSpacing: 0.8,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});

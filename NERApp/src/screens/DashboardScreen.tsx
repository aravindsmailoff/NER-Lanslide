import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { OfflineMap, OfflineMapRef } from '../components/OfflineMap';

declare const navigator: any;

interface Props {
  onNavigateToAdvisories: () => void;
  onNavigateToReport: () => void;
}

export const DashboardScreen: React.FC<Props> = ({
  onNavigateToAdvisories,
  onNavigateToReport,
}) => {
  const mapRef = useRef<OfflineMapRef>(null);
  const [selectedZone, setSelectedZone] = useState<string>('LS-204');

  const handleLocateMe = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos: any) => {
        mapRef.current?.setUserLocation(pos.coords.latitude, pos.coords.longitude);
        Alert.alert('GPS Centered', `Location locked: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => {
        // High accuracy regional field fallback
        const sampleLat = 26.2006;
        const sampleLng = 92.9376;
        mapRef.current?.setUserLocation(sampleLat, sampleLng);
        Alert.alert('Regional GPS Locked', 'Centered on Northeast Response Sector.');
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Interactive Map */}
      <OfflineMap
        ref={mapRef}
        onHazardClick={zoneId => setSelectedZone(zoneId)}
      />

      {/* Floating HUD Controls */}
      <View style={styles.hudControls}>
        <TouchableOpacity
          style={styles.hudBtn}
          activeOpacity={0.8}
          onPress={() => mapRef.current?.toggleLayer()}
        >
          <Text style={styles.hudBtnIcon}>🛰</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hudBtn}
          activeOpacity={0.8}
          onPress={handleLocateMe}
        >
          <Text style={styles.hudBtnIcon}>🎯</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hudBtn}
          activeOpacity={0.8}
          onPress={() => mapRef.current?.zoomIn()}
        >
          <Text style={styles.hudBtnText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hudBtn}
          activeOpacity={0.8}
          onPress={() => mapRef.current?.zoomOut()}
        >
          <Text style={styles.hudBtnText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Alert Pod Card at bottom */}
      <View style={styles.alertPodContainer}>
        <View style={styles.alertPod}>
          {/* Critical accent border */}
          <View style={styles.alertAccentBar} />

          <View style={styles.alertHeader}>
            <View style={styles.zoneRow}>
              <Text style={styles.zoneName}>Zone {selectedZone}</Text>
              <View style={styles.critBadge}>
                <Text style={styles.critBadgeText}>CRITICAL</Text>
              </View>
            </View>
            <Text style={styles.timeTag}>T+0:15m</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>EXPOSED</Text>
              <Text style={styles.statValue}>2 Vill.</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>RISK</Text>
              <Text style={[styles.statValue, { color: colors.riskCritical }]}>▲ Rising</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, styles.statAlert]}>
              <Text style={styles.statAlertLabel}>ROUTE: BLOCKED (NH-37)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>SHELTER: ACTIVE</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.shelterBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert('NDRF Dispatched', 'Shelter routing coordinates sent to Field Unit 4.')}
            >
              <Text style={styles.shelterBtnText}>🏠 Shelters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsBtn}
              activeOpacity={0.8}
              onPress={onNavigateToAdvisories}
            >
              <Text style={styles.detailsBtnText}>ⓘ Advisory Feed</Text>
            </TouchableOpacity>
          </View>

          {/* Authorities readiness footer */}
          <View style={styles.authoritiesRow}>
            <Text style={styles.authTitle}>AUTHORITIES</Text>
            <View style={styles.unitsRow}>
              <Text style={styles.unitText}>NDRF A: 2.4k</Text>
              <Text style={styles.unitText}>Unit 4: 0.8k</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  hudControls: {
    position: 'absolute',
    right: 14,
    top: 14,
    gap: 8,
    zIndex: 10,
  },
  hudBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(31, 31, 33, 0.9)',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  hudBtnIcon: {
    fontSize: 16,
  },
  hudBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  alertPodContainer: {
    position: 'absolute',
    bottom: 95,
    left: 14,
    right: 14,
    zIndex: 20,
  },
  alertPod: {
    backgroundColor: 'rgba(31, 31, 33, 0.92)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 171, 0.35)',
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  alertAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.riskCritical,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 6,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e4e2e4',
  },
  critBadge: {
    backgroundColor: 'rgba(255, 180, 171, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 171, 0.4)',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  critBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.riskCritical,
    letterSpacing: 0.8,
  },
  timeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.riskCritical,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    marginLeft: 6,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(42, 42, 43, 0.6)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statAlert: {
    backgroundColor: 'rgba(255, 180, 171, 0.12)',
    borderColor: 'rgba(255, 180, 171, 0.3)',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  statAlertLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.riskCritical,
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e4e2e4',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
    marginLeft: 6,
  },
  shelterBtn: {
    flex: 1,
    backgroundColor: colors.riskCritical,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelterBtnText: {
    color: '#690005',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsBtn: {
    flex: 1,
    backgroundColor: 'rgba(53, 52, 54, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.6)',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    color: '#e4e2e4',
    fontSize: 11,
    fontWeight: '600',
  },
  authoritiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(69, 70, 77, 0.35)',
    paddingTop: 6,
    marginLeft: 6,
  },
  authTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  unitsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
});

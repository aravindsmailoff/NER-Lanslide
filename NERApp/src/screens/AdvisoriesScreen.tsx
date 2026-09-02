import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { OfflineStore, RiskAdvisory } from '../database/offlineStore';

interface Props {
  onViewOnMap: (sector: string) => void;
}

export const AdvisoriesScreen: React.FC<Props> = ({ onViewOnMap }) => {
  const [advisories, setAdvisories] = useState<RiskAdvisory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    OfflineStore.getAdvisories().then(data => setAdvisories(data));
  }, []);

  const filtered = advisories.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getBorderColor = (level: string) => {
    switch (level) {
      case 'critical':
        return colors.riskCritical;
      case 'high':
        return colors.riskHigh;
      case 'medium':
        return colors.riskMedium;
      default:
        return colors.riskLow;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Panel */}
      <View style={styles.headerPanel}>
        <Text style={styles.headerTitle}>Citizen Risk Advisories</Text>
        <View style={styles.modelStatusRow}>
          <View style={styles.greenPulse} />
          <Text style={styles.modelStatusText}>PREDICTION MODEL: ACTIVE // OFFLINE CACHED</Text>
        </View>

        {/* Search & Tabs */}
        <View style={styles.filterRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search alerts or sectors..."
            placeholderTextColor="#909097"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.tabToggle}>
            <TouchableOpacity
              style={[styles.tabBtn, filterTab === 'active' && styles.tabBtnActive]}
              onPress={() => setFilterTab('active')}
            >
              <Text style={[styles.tabBtnText, filterTab === 'active' && styles.tabBtnTextActive]}>
                ACTIVE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, filterTab === 'history' && styles.tabBtnActive]}
              onPress={() => setFilterTab('history')}
            >
              <Text style={[styles.tabBtnText, filterTab === 'history' && styles.tabBtnTextActive]}>
                HISTORY
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Advisory Cards List */}
      <Text style={styles.sectionHeader}>PRIORITY ALERT FEEDS</Text>

      {filtered.map(adv => (
        <View
          key={adv.id}
          style={[styles.card, { borderLeftColor: getBorderColor(adv.level) }]}
        >
          {/* Card Top */}
          <View style={styles.cardTop}>
            <View style={[styles.typeBadge, { backgroundColor: getBorderColor(adv.level) + '25' }]}>
              <Text style={[styles.typeBadgeText, { color: getBorderColor(adv.level) }]}>
                {adv.type.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.cardTime}>{adv.time}</Text>
            <Text style={[styles.sectorBadge, { borderColor: getBorderColor(adv.level) }]}>
              {adv.sector}
            </Text>
          </View>

          {/* Card Body */}
          <Text style={styles.cardTitle}>{adv.title}</Text>
          <Text style={styles.cardDesc}>{adv.description}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {adv.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Bottom Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.viewMapBtn}
              activeOpacity={0.8}
              onPress={() => onViewOnMap(adv.sector)}
            >
              <Text style={styles.viewMapText}>🗺 View on Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  headerPanel: {
    backgroundColor: 'rgba(31, 31, 33, 0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.45)',
    padding: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  modelStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  greenPulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.riskLow,
  },
  modelStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(53, 52, 54, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.55)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#e4e2e4',
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(53, 52, 54, 0.5)',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.35)',
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(62, 73, 93, 0.65)',
  },
  tabBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  tabBtnTextActive: {
    color: colors.primary,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: 'rgba(31, 31, 33, 0.85)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.35)',
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTime: {
    fontSize: 10,
    color: 'rgba(198, 198, 205, 0.7)',
    flex: 1,
  },
  sectorBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#e4e2e4',
    borderWidth: 1,
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 999,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e4e2e4',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: 'rgba(198, 198, 205, 0.85)',
    lineHeight: 18,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagPill: {
    backgroundColor: '#1f1f21',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.35)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  tagText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewMapBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  viewMapText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onPrimary,
  },
});

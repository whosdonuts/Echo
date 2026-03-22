import { ComponentProps, ReactNode, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  activeFriends,
  discoverFriends,
  friendActivities,
  inboxItems,
  leaderboardPodium,
  leaderboardRows,
  tradeOffers,
  type TradeOffer,
} from '../data/socialMock';
import { colors } from '../theme/colors';
import { shellMetrics } from '../theme/layout';
import { SocialAvatar } from '../components/social/SocialAvatar';
import { SocialFriendCard } from '../components/social/SocialFriendCard';
import { SocialInboxSheet } from '../components/social/SocialInboxSheet';
import {
  SegmentOption,
  SocialCard,
  SocialIconButton,
  SocialLogoBadge,
  SocialSegmentedControl,
} from '../components/social/SocialPrimitives';
import { SocialTradeRow } from '../components/social/SocialTradeRow';

type PrimaryTab = 'leaderboard' | 'friends' | 'trading';
type FriendsView = 'home' | 'list';
type LeaderboardScope = 'friends' | 'communities';

type TradeDetailSheetProps = {
  trade: TradeOffer | null;
  visible: boolean;
  onClose: () => void;
};

const displayFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

const uiFont = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif-medium',
  default: 'System',
});

const primaryOptions: SegmentOption[] = [
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'friends', label: 'Friends' },
  { key: 'trading', label: 'Trading' },
];

const friendsViewOptions: SegmentOption[] = [
  { key: 'home', label: 'Activity' },
  { key: 'list', label: 'Friends list' },
];

const leaderboardScopeOptions: SegmentOption[] = [
  { key: 'friends', label: 'Friends' },
  { key: 'communities', label: 'Communities' },
];

export function SocialScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('friends');
  const [friendsView, setFriendsView] = useState<FriendsView>('home');
  const [leaderboardScope, setLeaderboardScope] =
    useState<LeaderboardScope>('communities');
  const [inboxVisible, setInboxVisible] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);

  const contentBottomPadding = Math.max(
    shellMetrics.contentBottomPadding,
    insets.bottom + 116,
  );
  const gridGap = 12;
  const gridTileWidth = Math.floor(
    (width - shellMetrics.horizontalPadding * 2 - gridGap * 2) / 3,
  );

  const podiumEntries = useMemo(() => {
    const first = leaderboardPodium.find((entry) => entry.rank === 1);
    const second = leaderboardPodium.find((entry) => entry.rank === 2);
    const third = leaderboardPodium.find((entry) => entry.rank === 3);

    return [third, first, second].filter(Boolean) as typeof leaderboardPodium;
  }, []);

  const selectedTrade = useMemo(
    () => tradeOffers.find((offer) => offer.id === selectedTradeId) ?? null,
    [selectedTradeId],
  );

  function handlePrimaryTabChange(nextTab: string) {
    setPrimaryTab(nextTab as PrimaryTab);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.sharedHeader}>
          <View style={styles.sharedHeaderInner}>
            <SocialSegmentedControl
              activeKey={primaryTab}
              fullWidth
              onChange={handlePrimaryTabChange}
              options={primaryOptions}
              style={styles.sharedHeaderSegments}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: contentBottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {primaryTab === 'friends' ? renderFriends() : null}
          {primaryTab === 'leaderboard' ? renderLeaderboard(podiumEntries) : null}
          {primaryTab === 'trading' ? renderTrading() : null}
        </ScrollView>
      </View>

      <SocialInboxSheet
        items={inboxItems}
        onClose={() => setInboxVisible(false)}
        visible={inboxVisible}
      />

      <TradeDetailSheet
        onClose={() => setSelectedTradeId(null)}
        trade={selectedTrade}
        visible={selectedTrade !== null}
      />
    </SafeAreaView>
  );

  function renderFriends() {
    return (
      <View style={styles.section}>
        <SectionHeader
          icon="people-outline"
          subtitle="Keep close activity, discovery, and trading circles in one place."
          title="Friends"
          rightContent={
            <View style={styles.actionsRow}>
              <SocialIconButton
                icon="mail-outline"
                onPress={() => setInboxVisible(true)}
              />
              <SocialIconButton
                accent={friendsView === 'list'}
                icon="person-add-outline"
                onPress={() =>
                  setFriendsView((current) => (current === 'home' ? 'list' : 'home'))
                }
              />
            </View>
          }
        />

        <SocialSegmentedControl
          activeKey={friendsView}
          compact
          onChange={(next) => setFriendsView(next as FriendsView)}
          options={friendsViewOptions}
          style={styles.secondarySegments}
        />

        {friendsView === 'home' ? (
          <>
            <View style={styles.pillRow}>
              <View style={styles.metricPill}>
                <View style={styles.activeDot} />
                <Text style={styles.metricPillText}>5 active now</Text>
              </View>
            </View>

            <SocialCard style={styles.activeFriendsCard}>
              <View style={styles.cardHeadingBlock}>
                <Text style={styles.cardEyebrow}>Live circle</Text>
                <Text style={styles.cardTitle}>Friends currently active</Text>
              </View>

              <ScrollView
                contentContainerStyle={styles.avatarRail}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {activeFriends.map((friend) => (
                  <View key={friend.id} style={styles.activeFriendItem}>
                    <SocialAvatar
                      active={friend.active}
                      name={friend.name}
                      tone={friend.tone}
                    />
                    <Text numberOfLines={1} style={styles.activeFriendLabel}>
                      {friend.name.split(' ')[0]}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </SocialCard>

            <View style={styles.listColumn}>
              {friendActivities.map((activity) => (
                <SocialFriendCard
                  active={activity.active}
                  badgeLabel={activity.badgeLabel}
                  badgeTone={activity.badgeTone}
                  key={activity.id}
                  name={activity.name}
                  summary={activity.summary}
                  time={activity.time}
                  tone={activity.tone}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={styles.gridIntroBlock}>
              <Text style={styles.cardEyebrow}>Friends list</Text>
              <Text style={styles.gridIntroTitle}>Your Social circle</Text>
              <Text style={styles.subtitle}>
                A clean overview of everyone you collect, trade, and stay active with.
              </Text>
            </View>

            <View style={styles.friendGrid}>
              {discoverFriends.map((friend) => (
                <SocialCard
                  key={friend.id}
                  style={[styles.friendGridTile, { width: gridTileWidth }]}
                >
                  <SocialAvatar
                    name={friend.name}
                    size={Math.min(64, gridTileWidth - 28)}
                    tone={friend.tone}
                  />
                  <Text numberOfLines={2} style={styles.friendGridName}>
                    {friend.name}
                  </Text>
                </SocialCard>
              ))}
            </View>
          </>
        )}
      </View>
    );
  }

  function renderLeaderboard(podium: typeof leaderboardPodium) {
    return (
      <View style={styles.section}>
        <SectionHeader
          icon="trophy-outline"
          subtitle="Community points reflect traded fragments, shared echoes, and active replies."
          title="Leaderboard"
        />

        <SocialSegmentedControl
          activeKey={leaderboardScope}
          compact
          onChange={(next) => setLeaderboardScope(next as LeaderboardScope)}
          options={leaderboardScopeOptions}
          style={styles.secondarySegments}
        />

        <SocialCard style={styles.podiumCard}>
          <View style={styles.cardHeadingBlock}>
            <Text style={styles.cardEyebrow}>Weekly spotlight</Text>
            <Text style={styles.cardTitle}>Top circles this week</Text>
          </View>

          <View style={styles.podiumRow}>
            {podium.map((entry) => {
              const isFirst = entry.rank === 1;

              return (
                <View
                  key={entry.id}
                  style={[styles.podiumColumn, isFirst && styles.podiumColumnCenter]}
                >
                  <View style={[styles.rankBadge, isFirst && styles.rankBadgeActive]}>
                    <Text
                      style={[styles.rankBadgeText, isFirst && styles.rankBadgeTextActive]}
                    >
                      {entry.rank}
                    </Text>
                  </View>
                  <SocialAvatar
                    name={entry.name}
                    size={isFirst ? 76 : 66}
                    tone={entry.tone}
                  />
                  <Text style={[styles.podiumName, isFirst && styles.podiumNameCenter]}>
                    {entry.name}
                  </Text>
                  <Text style={[styles.podiumPoints, isFirst && styles.podiumPointsFirst]}>
                    {entry.points}
                  </Text>
                  <View
                    style={[
                      styles.podiumBase,
                      isFirst ? styles.podiumBaseFirst : styles.podiumBaseSoft,
                      { height: entry.pedestalHeight },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </SocialCard>

        <SocialCard style={styles.tableCard}>
          <View style={styles.tableTopRow}>
            <Text style={styles.cardEyebrow}>Rankings</Text>
            <Text style={styles.tableMeta}>Updated this week</Text>
          </View>

          <View style={styles.tableHead}>
            <Text style={styles.tableHeadLabel}>Rank</Text>
            <Text style={[styles.tableHeadLabel, styles.tableNameColumn]}>Name</Text>
            <Text style={styles.tableHeadLabel}>Points</Text>
          </View>

          {leaderboardRows.map((row) => (
            <View key={row.rank} style={styles.tableRow}>
              <View style={styles.tableRankPill}>
                <Text style={styles.tableRankText}>{row.rank}</Text>
              </View>
              <Text style={[styles.tableCell, styles.tableNameColumn]}>{row.name}</Text>
              <Text style={[styles.tableCell, row.highlight && styles.tableCellHighlight]}>
                {row.points}
              </Text>
            </View>
          ))}
        </SocialCard>
      </View>
    );
  }

  function renderTrading() {
    return (
      <View style={styles.section}>
        <SectionHeader
          icon="swap-horizontal"
          subtitle="Open a trade opportunity from the list below and review the full proposal without leaving this screen."
          title="Trading"
          rightContent={
            <View style={styles.actionsRow}>
              <SocialIconButton
                icon="mail-outline"
                onPress={() => setInboxVisible(true)}
              />
            </View>
          }
        />

        <View style={styles.pillRow}>
          <View style={styles.metricPillWarm}>
            <Text style={styles.metricPillWarmText}>
              {tradeOffers.length} tradeable fragments available
            </Text>
          </View>
        </View>

        <View style={styles.listColumn}>
          {tradeOffers.map((offer) => (
            <SocialTradeRow
              emphasized={offer.emphasized}
              info={offer.info}
              key={offer.id}
              name={offer.name}
              onPress={() => setSelectedTradeId(offer.id)}
              tone={offer.tone}
            />
          ))}
        </View>
      </View>
    );
  }
}

function SectionHeader({
  icon,
  title,
  subtitle,
  rightContent,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  rightContent?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionLead}>
        <SocialLogoBadge accent={icon !== 'people-outline'} icon={icon} />
        <View style={styles.sectionLeadCopy}>
          <Text style={styles.sectionEyebrow}>Social</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {rightContent}
    </View>
  );
}

function TradeDetailSheet({ trade, visible, onClose }: TradeDetailSheetProps) {
  if (!trade) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.tradeBackdrop}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.tradeSheet}>
          <View style={styles.tradeSheetHandle}>
            <View style={styles.tradeSheetHandleBar} />
          </View>

          <View style={styles.tradeSheetHeader}>
            <View style={styles.tradeSheetHeaderLeft}>
              <SocialAvatar name={trade.name} size={52} tone={trade.tone} />
              <View style={styles.tradeSheetTitleWrap}>
                <Text style={styles.cardEyebrow}>Trade proposal</Text>
                <Text style={styles.sheetTitle}>{trade.name}</Text>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons color={colors.echoDarkCocoa} name="close" size={20} />
            </Pressable>
          </View>

          <Text style={styles.sheetSubtitle}>
            Review the swap in place, then dismiss the sheet to return to the trade
            list.
          </Text>

          <ScrollView
            contentContainerStyle={styles.tradeSheetContent}
            showsVerticalScrollIndicator={false}
          >
            <SocialCard style={styles.tradeCompareCard}>
              <View style={styles.tradeCompareHeader}>
                <Text style={styles.tradeTitle}>{trade.setTitle}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{trade.statusLabel}</Text>
                </View>
              </View>

              <View style={styles.tradeCompareRow}>
                <View style={styles.tradeSide}>
                  <Text style={styles.tradeSideLabel}>You</Text>
                  <View style={[styles.fragmentCard, styles.fragmentCardWarm]}>
                    <Text style={styles.fragmentName}>{trade.yourItem}</Text>
                    <Text style={styles.fragmentMeta}>{trade.yourMeta}</Text>
                  </View>
                </View>

                <View style={styles.tradeArrowWrap}>
                  <Ionicons
                    color={colors.echoDeepTerracotta}
                    name="swap-horizontal"
                    size={18}
                  />
                </View>

                <View style={styles.tradeSide}>
                  <Text style={styles.tradeSideLabel}>{trade.name}</Text>
                  <View style={[styles.fragmentCard, styles.fragmentCardSoft]}>
                    <Text style={styles.fragmentName}>{trade.friendItem}</Text>
                    <Text style={styles.fragmentMeta}>{trade.friendMeta}</Text>
                  </View>
                </View>
              </View>

              <Pressable style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>Propose Trade</Text>
              </Pressable>
            </SocialCard>

            <SocialCard style={styles.statusCard}>
              <Text style={styles.cardEyebrow}>Trade status</Text>
              <Text style={styles.statusTitle}>{trade.statusText}</Text>
              <Text style={styles.statusText}>
                The proposal stays inside Social so you can review details without
                leaving the current list.
              </Text>
            </SocialCard>

            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>Cancel Trade</Text>
              </Pressable>
              <Pressable style={styles.tertiaryAction}>
                <Text style={styles.tertiaryActionText}>View Profile</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.echoOffWhiteBackground,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.echoOffWhiteBackground,
  },
  sharedHeader: {
    paddingTop: shellMetrics.topPadding,
    paddingHorizontal: shellMetrics.horizontalPadding,
    paddingBottom: 14,
    backgroundColor: colors.echoOffWhiteBackground,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 215, 205, 0.88)',
  },
  sharedHeaderInner: {
    alignItems: 'center',
  },
  sharedHeaderSegments: {
    width: '100%',
    maxWidth: 368,
  },
  content: {
    paddingTop: 22,
    paddingHorizontal: shellMetrics.horizontalPadding,
    gap: 24,
  },
  section: {
    gap: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  sectionLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionLeadCopy: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  sectionEyebrow: {
    color: colors.echoOliveBronze,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondarySegments: {
    alignSelf: 'flex-start',
  },
  title: {
    color: colors.text,
    fontSize: 31,
    fontFamily: displayFont,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: uiFont,
    fontWeight: '500',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 215, 205, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  metricPillText: {
    color: colors.echoDarkCocoa,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  metricPillWarm: {
    borderRadius: 999,
    backgroundColor: '#F8E3DA',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  metricPillWarmText: {
    color: colors.echoDeepTerracotta,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sage,
  },
  activeFriendsCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  cardHeadingBlock: {
    gap: 3,
  },
  cardEyebrow: {
    color: colors.echoOliveBronze,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 22,
    fontFamily: displayFont,
    fontWeight: '700',
    letterSpacing: -0.35,
  },
  avatarRail: {
    gap: 14,
    paddingRight: 8,
  },
  activeFriendItem: {
    width: 76,
    alignItems: 'center',
    gap: 8,
  },
  activeFriendLabel: {
    width: '100%',
    color: colors.textSoft,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '600',
    textAlign: 'center',
  },
  listColumn: {
    gap: 12,
  },
  gridIntroBlock: {
    gap: 4,
  },
  gridIntroTitle: {
    color: colors.text,
    fontSize: 24,
    fontFamily: displayFont,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  friendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  friendGridTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 138,
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  friendGridName: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: uiFont,
    fontWeight: '700',
    textAlign: 'center',
  },
  podiumCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 18,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 8,
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  podiumColumnCenter: {
    flex: 1.15,
  },
  rankBadge: {
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#F7F2EB',
  },
  rankBadgeActive: {
    backgroundColor: '#F8E3DA',
  },
  rankBadgeText: {
    color: colors.echoOliveBronze,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
  },
  rankBadgeTextActive: {
    color: colors.echoDeepTerracotta,
  },
  podiumName: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontFamily: uiFont,
    fontWeight: '700',
    textAlign: 'center',
  },
  podiumNameCenter: {
    fontSize: 14,
  },
  podiumPoints: {
    color: colors.echoOliveBronze,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    textAlign: 'center',
  },
  podiumPointsFirst: {
    color: colors.echoDeepTerracotta,
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  podiumBaseFirst: {
    backgroundColor: '#F2D5C8',
  },
  podiumBaseSoft: {
    backgroundColor: '#F6EAE0',
  },
  tableCard: {
    padding: 14,
  },
  tableTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 12,
  },
  tableMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#FBF6F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tableHeadLabel: {
    flex: 0.6,
    color: colors.echoOliveBronze,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tableNameColumn: {
    flex: 1.6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 230, 220, 0.88)',
  },
  tableRankPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F2EB',
    marginRight: 10,
  },
  tableRankText: {
    color: colors.echoOliveBronze,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '700',
  },
  tableCell: {
    flex: 0.6,
    color: colors.text,
    fontSize: 14,
    fontFamily: uiFont,
    fontWeight: '600',
  },
  tableCellHighlight: {
    color: colors.echoDeepTerracotta,
    fontWeight: '700',
  },
  tradeBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(32, 24, 20, 0.20)',
  },
  tradeSheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.echoMainWhite,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 26,
    shadowColor: colors.echoDarkCocoa,
    shadowOpacity: 0.16,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  tradeSheetHandle: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  tradeSheetHandleBar: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#DDD2C6',
  },
  tradeSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tradeSheetHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tradeSheetTitleWrap: {
    flex: 1,
    gap: 3,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 24,
    fontFamily: displayFont,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  sheetSubtitle: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: uiFont,
    fontWeight: '500',
    paddingTop: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.echoOffWhiteBackground,
    borderWidth: 1,
    borderColor: 'rgba(226, 215, 205, 0.88)',
  },
  tradeSheetContent: {
    gap: 14,
    paddingTop: 16,
  },
  tradeCompareCard: {
    gap: 16,
    padding: 16,
  },
  tradeCompareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tradeTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 24,
    fontFamily: displayFont,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tradeCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tradeSide: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  tradeSideLabel: {
    color: colors.echoOliveBronze,
    fontSize: 12,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tradeArrowWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F3',
    borderWidth: 1,
    borderColor: 'rgba(226, 215, 205, 0.88)',
  },
  fragmentCard: {
    width: '100%',
    minHeight: 142,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 18,
    gap: 6,
  },
  fragmentCardWarm: {
    backgroundColor: '#F7E4A6',
  },
  fragmentCardSoft: {
    backgroundColor: '#F4DFD7',
  },
  fragmentName: {
    color: colors.echoDarkCocoa,
    fontSize: 15,
    lineHeight: 19,
    fontFamily: uiFont,
    fontWeight: '700',
    textAlign: 'center',
  },
  fragmentMeta: {
    color: colors.echoOliveBronze,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryAction: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.echoPrimaryTerracotta,
    paddingVertical: 14,
  },
  primaryActionText: {
    color: colors.echoMainWhite,
    fontSize: 14,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusCard: {
    gap: 8,
    padding: 16,
  },
  statusTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: uiFont,
    fontWeight: '700',
  },
  statusText: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: uiFont,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#F8E3DA',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusBadgeText: {
    color: colors.echoDeepTerracotta,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.echoMainWhite,
    borderWidth: 1,
    borderColor: 'rgba(226, 215, 205, 0.88)',
    paddingVertical: 14,
  },
  secondaryActionText: {
    color: colors.echoDarkCocoa,
    fontSize: 13,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tertiaryAction: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F0E8',
    paddingVertical: 14,
  },
  tertiaryActionText: {
    color: colors.echoOliveBronze,
    fontSize: 13,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

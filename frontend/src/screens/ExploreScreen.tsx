import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type ExploreFeedMode = 'friends' | 'explore';
type ExploreViewMode = 'feed' | 'inbox';

type ExplorePost = {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  image: string;
  city: string;
  location: string;
  music: string;
  accent: string;
};

const friendsFeed: ExplorePost[] = [
  {
    id: 'friend-harbor',
    author: 'Lina',
    handle: '@linaside',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
    city: 'Toronto',
    location: 'Old Port ferry wall',
    music: 'Soft ferry cables',
    accent: '#F3D68B',
  },
  {
    id: 'friend-cafe',
    author: 'Mara',
    handle: '@maraleone',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=320&q=80',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    city: 'Toronto',
    location: 'Prince Street Cafe',
    music: 'Espresso hiss loop',
    accent: '#E9A78E',
  },
  {
    id: 'friend-station',
    author: 'Noah',
    handle: '@noahnorth',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    city: 'Toronto',
    location: 'Union platform 5',
    music: 'Rain over brakes',
    accent: '#F0C67D',
  },
];

const exploreFeed: ExplorePost[] = [
  {
    id: 'explore-quay',
    author: 'Collected nearby',
    handle: '@echo.explore',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    city: 'Toronto',
    location: 'Queens Quay',
    music: 'Blue hour ferry horn',
    accent: '#DE805E',
  },
  {
    id: 'explore-arcade',
    author: 'City trace',
    handle: '@echo.explore',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    image:
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80',
    city: 'Toronto',
    location: 'St. Lawrence Arcade',
    music: 'Market after-rain',
    accent: '#F3D68B',
  },
  {
    id: 'explore-bridge',
    author: 'City trace',
    handle: '@echo.explore',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=320&q=80',
    image:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    city: 'Toronto',
    location: 'Bathurst footbridge',
    music: 'Night wind loop',
    accent: '#E9A78E',
  },
  {
    id: 'explore-underpass',
    author: 'Collected nearby',
    handle: '@echo.explore',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    image:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    city: 'Toronto',
    location: 'Lower Simcoe underpass',
    music: 'Wet tire reverb',
    accent: '#DE805E',
  },
];

const inboxItems = [
  {
    id: 'inbox-1',
    username: '@linaside',
    name: 'Lina',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    preview: 'Echo sent',
    time: 'Now',
  },
  {
    id: 'inbox-2',
    username: '@maraleone',
    name: 'Mara',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=320&q=80',
    preview: 'Echo sent',
    time: '18m',
  },
  {
    id: 'inbox-3',
    username: '@noahnorth',
    name: 'Noah',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    preview: 'Shared Echo with you',
    time: '1h',
  },
  {
    id: 'inbox-4',
    username: '@julesafter6',
    name: 'Jules',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80',
    preview: 'if this trace makes me cry on the streetcar, I am billing you',
    time: '3h',
  },
];

function TabToggle({
  activeFeed,
  onChange,
}: {
  activeFeed: ExploreFeedMode;
  onChange: (next: ExploreFeedMode) => void;
}) {
  return (
    <View style={styles.toggleShell}>
      {(['friends', 'explore'] as const).map((item) => {
        const active = item === activeFeed;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={[styles.toggleButton, active && styles.toggleButtonActive]}
          >
            <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>
              {item === 'friends' ? 'Friends' : 'Explore'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FeedActions({
  accent,
  liked,
  onToggleLike,
}: {
  accent: string;
  liked: boolean;
  onToggleLike: () => void;
}) {
  return (
    <View style={styles.actionsRail}>
      <Pressable onPress={onToggleLike} style={[styles.actionButton, liked && styles.actionButtonLiked]}>
        <Ionicons
          color={liked ? colors.echoMainWhite : colors.echoMainWhite}
          name={liked ? 'heart' : 'heart-outline'}
          size={24}
        />
      </Pressable>
      <Pressable style={styles.actionButton}>
        <Ionicons color={colors.echoMainWhite} name="chatbubble-ellipses-outline" size={23} />
      </Pressable>
      <Pressable style={styles.actionButton}>
        <Ionicons color={colors.echoMainWhite} name="paper-plane-outline" size={23} />
      </Pressable>
      <View style={[styles.musicBadge, { borderColor: accent }]}>
        <View style={[styles.musicBadgeInner, { backgroundColor: accent }]}>
          <Ionicons color={colors.echoMainWhite} name="musical-notes" size={16} />
        </View>
      </View>
    </View>
  );
}

function ExploreFeedCard({
  post,
  height,
  liked,
  onToggleLike,
}: {
  post: ExplorePost;
  height: number;
  liked: boolean;
  onToggleLike: () => void;
}) {
  return (
    <View style={[styles.postCard, { height }]}>
      <View style={styles.mediaLayer}>
        <Image source={{ uri: post.image }} style={styles.postImage} />
        <LinearGradient
          colors={[
            'rgba(19, 13, 10, 0.20)',
            'rgba(19, 13, 10, 0.02)',
            'rgba(19, 13, 10, 0.34)',
          ]}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View pointerEvents="box-none" style={styles.overlayLayer}>
        <FeedActions accent={post.accent} liked={liked} onToggleLike={onToggleLike} />

        <LinearGradient
          colors={['rgba(8, 6, 5, 0)', 'rgba(8, 6, 5, 0.14)', 'rgba(8, 6, 5, 0.36)']}
          style={styles.footerFade}
        />
        <View style={styles.footerTextBlock}>
          <Text style={styles.cityText}>{post.city}</Text>
          <Text style={styles.handleText}>{post.handle}</Text>
        </View>
      </View>
    </View>
  );
}

function InboxPlaceholder({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={styles.inboxSafeArea}>
      <View style={[styles.inboxHeader, { paddingTop: 8 + insets.top * 0.08 }]}>
        <Pressable onPress={onBack} style={styles.inboxBackButton}>
          <Ionicons color={colors.echoInk} name="chevron-back" size={20} />
        </Pressable>
        <View style={styles.inboxTitleWrap}>
          <Text style={styles.inboxTitle}>Inbox</Text>
          <Text style={styles.inboxSubtitle}>Only friends can message you on Echo.</Text>
        </View>
      </View>

      <View style={styles.inboxList}>
        {inboxItems.map((item) => (
          <Pressable key={item.id} style={styles.inboxRow}>
            <Image source={{ uri: item.avatar }} style={styles.inboxAvatar} />
            <View style={styles.inboxRowText}>
              <View style={styles.inboxRowHeader}>
                <Text style={styles.inboxName}>{item.name}</Text>
                <Text style={styles.inboxTime}>{item.time}</Text>
              </View>
              <Text style={styles.inboxUsername}>{item.username}</Text>
              <Text numberOfLines={1} style={styles.inboxPreview}>
                {item.preview}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

export function ExploreScreen() {
  const [activeFeed, setActiveFeed] = useState<ExploreFeedMode>('explore');
  const [viewMode, setViewMode] = useState<ExploreViewMode>('feed');
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  const { height } = useWindowDimensions();
  const listRef = useRef<FlatList<ExplorePost> | null>(null);

  const feedData = useMemo(
    () => (activeFeed === 'friends' ? friendsFeed : exploreFeed),
    [activeFeed],
  );

  const postHeight = Math.max(height, 640);

  useEffect(() => {
    listRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, [activeFeed]);

  function toggleLike(postId: string) {
    setLikedPostIds((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  }

  if (viewMode === 'inbox') {
    return <InboxPlaceholder onBack={() => setViewMode('feed')} />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        ref={listRef}
        data={feedData}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          index,
          length: postHeight,
          offset: postHeight * index,
        })}
        key={activeFeed}
        keyExtractor={(item) => item.id}
        pagingEnabled
        renderItem={({ item }) => (
          <ExploreFeedCard
            height={postHeight}
            liked={Boolean(likedPostIds[item.id])}
            onToggleLike={() => toggleLike(item.id)}
            post={item}
          />
        )}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={postHeight}
        style={styles.list}
      />

      <View pointerEvents="box-none" style={styles.topOverlay}>
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <TabToggle activeFeed={activeFeed} onChange={setActiveFeed} />
          <Pressable onPress={() => setViewMode('inbox')} style={styles.inboxButton}>
            <Ionicons color={colors.echoMainWhite} name="mail-outline" size={20} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#120D0A',
  },
  list: {
    flex: 1,
    backgroundColor: '#120D0A',
  },
  topOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  topBarSpacer: {
    width: 44,
  },
  toggleShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 999,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  toggleButton: {
    minWidth: 90,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  toggleLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  toggleLabelActive: {
    color: colors.echoDarkCocoa,
  },
  inboxButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  postCard: {
    width: '100%',
    backgroundColor: '#120D0A',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mediaLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  postImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  actionsRail: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 13, 10, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionButtonLiked: {
    backgroundColor: 'rgba(222, 128, 94, 0.92)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    transform: [{ scale: 1.04 }],
  },
  musicBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 13, 10, 0.20)',
  },
  musicBadgeInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
  },
  footerTextBlock: {
    position: 'absolute',
    left: 18,
    right: 96,
    bottom: 100,
    gap: 2,
  },
  cityText: {
    color: colors.echoMainWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  handleText: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 13,
    fontWeight: '600',
  },
  inboxSafeArea: {
    flex: 1,
    backgroundColor: colors.echoOffWhiteBackground,
  },
  inboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarBorderSoft,
    backgroundColor: colors.echoMainWhite,
  },
  inboxBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.echoOffWhiteBackground,
    borderWidth: 1,
    borderColor: colors.tabBarBorder,
  },
  inboxTitleWrap: {
    flex: 1,
    gap: 4,
  },
  inboxTitle: {
    color: colors.echoInk,
    fontSize: 24,
    fontWeight: '700',
  },
  inboxSubtitle: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '500',
  },
  inboxList: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  inboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarBorderSoft,
  },
  inboxAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  inboxRowText: {
    flex: 1,
    gap: 3,
  },
  inboxRowHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  inboxName: {
    color: colors.echoInk,
    fontSize: 15,
    fontWeight: '700',
  },
  inboxTime: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  inboxUsername: {
    color: colors.echoDarkCocoa,
    fontSize: 12,
    fontWeight: '600',
  },
  inboxPreview: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});

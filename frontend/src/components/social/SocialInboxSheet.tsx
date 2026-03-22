import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { InboxItem } from '../../data/socialMock';
import { colors } from '../../theme/colors';
import { SocialAvatar } from './SocialAvatar';

type SocialInboxSheetProps = {
  visible: boolean;
  items: InboxItem[];
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

export function SocialInboxSheet({
  visible,
  items,
  onClose,
}: SocialInboxSheetProps) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.sheet}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Text style={styles.eyebrow}>Social Inbox</Text>
              <Text style={styles.title}>Recent updates</Text>
              <Text style={styles.subtitle}>
                Friends, trades, and quick activity in one polished stream.
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons color={colors.echoDarkCocoa} name="close" size={20} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View key={item.id} style={styles.row}>
                <SocialAvatar
                  active={item.active}
                  name={item.name}
                  size={50}
                  tone={item.tone}
                />
                <View style={styles.copy}>
                  <View style={styles.rowHead}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                  <Text numberOfLines={2} style={styles.preview}>
                    {item.preview}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(32, 24, 20, 0.20)',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.echoMainWhite,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: colors.echoDarkCocoa,
    shadowOpacity: 0.16,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  handle: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#DDD2C6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 16,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: colors.echoOliveBronze,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontFamily: displayFont,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: uiFont,
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.echoOffWhiteBackground,
    borderWidth: 1,
    borderColor: 'rgba(226, 215, 205, 0.9)',
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 24,
    backgroundColor: '#FFFCF8',
    borderWidth: 1,
    borderColor: 'rgba(226, 215, 205, 0.88)',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: uiFont,
    fontWeight: '700',
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: uiFont,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  preview: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: uiFont,
    fontWeight: '500',
  },
});

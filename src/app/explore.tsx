import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function GuideScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const insets = { ...safeAreaInsets, bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three };
  const contentPlatformStyle = Platform.select({
    android: { paddingTop: insets.top, paddingBottom: insets.bottom },
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
  });

  return (
    <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]} contentInset={insets} contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={styles.eyebrow}>WORKFLOW GUIDE</ThemedText>
          <ThemedText type="subtitle" style={styles.title}>Keep every certificate findable.</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">Add the five details exactly as they arrive from Head Office. Search works across every saved field.</ThemedText>
        </ThemedView>
        <ThemedView style={styles.sectionsWrapper}>
          <GuideCard number="01" title="Add a record">Use Add certificate on the Stock tab and enter the recipient&apos;s name, address, telephone, course, and registration number.</GuideCard>
          <GuideCard number="02" title="Search instantly">Search by name, registration no, course, telephone, or address. Results update while you type.</GuideCard>
          <GuideCard number="03" title="Avoid duplicates">Registration numbers are checked before saving, so the same certificate cannot be added twice.</GuideCard>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

function GuideCard({ number, title, children }: { number: string; title: string; children: string }) {
  return <ThemedView type="backgroundElement" style={styles.guideCard}><ThemedText style={styles.cardNumber}>{number}</ThemedText><ThemedText style={styles.cardTitle}>{title}</ThemedText><ThemedText themeColor="textSecondary" style={styles.cardText}>{children}</ThemedText></ThemedView>;
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { flexDirection: 'row', justifyContent: 'center' },
  container: { maxWidth: MaxContentWidth, flexGrow: 1 },
  titleContainer: { gap: Spacing.three, alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.six },
  eyebrow: { color: '#B66A3C', fontSize: 11, letterSpacing: 1.6, fontWeight: '800' },
  title: { color: '#183D3B', textAlign: 'center' },
  centerText: { textAlign: 'center', maxWidth: 520 },
  sectionsWrapper: { gap: Spacing.two, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  guideCard: { padding: Spacing.three, borderRadius: 18, backgroundColor: '#FFFFFF' },
  cardNumber: { color: '#B66A3C', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { color: '#183D3B', fontSize: 19, fontWeight: '800', marginTop: 8 },
  cardText: { fontSize: 14, lineHeight: 21, marginTop: 6 },
});

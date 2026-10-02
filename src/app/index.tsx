import { useMemo, useState } from 'react';
import * as Print from 'expo-print';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type Certificate = { id: string; name: string; address: string; telephone: string; course: string; registrationNo: string; addedAt: string; issuedAt?: string };
const initialCertificates: Certificate[] = [
  { id: '1', name: 'Kasun Perera', address: 'Kandy, Sri Lanka', telephone: '077 123 4567', course: 'Diploma in ICT', registrationNo: 'CERT-2026-001', addedAt: '2026-09-28T09:00:00.000Z' },
  { id: '2', name: 'Nethmi Fernando', address: 'Colombo 05', telephone: '071 555 0198', course: 'English Language', registrationNo: 'CERT-2026-002', addedAt: '2026-09-29T09:00:00.000Z' },
];
const emptyForm = { name: '', address: '', telephone: '', course: '', registrationNo: '' };

export default function HomeScreen() {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const stockCount = certificates.filter((certificate) => !certificate.issuedAt).length;
  const issuedCount = certificates.length - stockCount;
  const filteredCertificates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return certificates;
    return certificates.filter((certificate) => Object.values(certificate).some((value) => value.toLowerCase().includes(query)));
  }, [certificates, searchQuery]);
  function updateField(field: keyof typeof emptyForm, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  function addCertificate() {
    const values = Object.values(form).map((value) => value.trim());
    if (values.some((value) => !value)) { Alert.alert('Missing details', 'Please fill in all certificate details.'); return; }
    if (certificates.some((certificate) => certificate.registrationNo.toLowerCase() === form.registrationNo.trim().toLowerCase())) { Alert.alert('Duplicate registration', 'A certificate with this registration number already exists.'); return; }
    setCertificates((current) => [{ id: Date.now().toString(), ...form, name: form.name.trim(), address: form.address.trim(), telephone: form.telephone.trim(), course: form.course.trim(), registrationNo: form.registrationNo.trim(), addedAt: new Date().toISOString() }, ...current]);
    setForm(emptyForm); setIsFormOpen(false);
  }
  return (
    <ThemedView style={styles.page}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            data={filteredCertificates} keyExtractor={(item) => item.id} contentContainerStyle={styles.content}
            ListHeaderComponent={<View>
              <View style={styles.headerRow}><View><ThemedText style={styles.eyebrow}>HEAD OFFICE / RECORDS</ThemedText><ThemedText style={styles.title}>Certificate stock</ThemedText><ThemedText themeColor="textSecondary" style={styles.subtitle}>ලැබෙන certificates පහසුවෙන් add කරලා හොයන්න.</ThemedText></View><View style={styles.headerMark}><ThemedText style={styles.headerMarkText}>CS</ThemedText></View></View>
              <View style={styles.summaryRow}><ThemedView type="backgroundElement" style={styles.summaryCard}><ThemedText themeColor="textSecondary" style={styles.summaryLabel}>IN STOCK</ThemedText><ThemedText style={styles.summaryValue}>{stockCount}</ThemedText></ThemedView><ThemedView type="backgroundElement" style={[styles.summaryCard, styles.summaryAccent]}><ThemedText style={styles.summaryLabel}>ISSUED</ThemedText><ThemedText style={styles.summaryValue}>{issuedCount}</ThemedText></ThemedView></View>
              <View style={styles.searchWrap}><ThemedText style={styles.searchIcon}>⌕</ThemedText><TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search name, registration no, course..." placeholderTextColor={Colors.light.textSecondary} style={styles.searchInput as any} autoCapitalize="none" />{searchQuery.length > 0 && <Pressable onPress={() => setSearchQuery('')} accessibilityLabel="Clear search"><ThemedText themeColor="textSecondary" style={styles.clearSearch}>×</ThemedText></Pressable>}</View>
              <Pressable onPress={() => setIsFormOpen((current) => !current)} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><ThemedText style={styles.addButtonPlus}>{isFormOpen ? '×' : '+'}</ThemedText><ThemedText style={styles.addButtonText}>{isFormOpen ? 'Close form' : 'Add certificate'}</ThemedText></Pressable>
              {isFormOpen && <ThemedView type="backgroundElement" style={styles.formCard}><ThemedText style={styles.formTitle}>New certificate record</ThemedText><ThemedText themeColor="textSecondary" style={styles.formHint}>Enter the details sent by Head Office.</ThemedText><FormField label="Name" value={form.name} onChangeText={(value) => updateField('name', value)} placeholder="Recipient full name" /><FormField label="Address" value={form.address} onChangeText={(value) => updateField('address', value)} placeholder="Complete address" /><View style={styles.formRow}><View style={styles.halfField}><FormField label="Telephone no" value={form.telephone} onChangeText={(value) => updateField('telephone', value)} placeholder="07X XXX XXXX" keyboardType="phone-pad" /></View><View style={styles.halfField}><FormField label="Registration no" value={form.registrationNo} onChangeText={(value) => updateField('registrationNo', value)} placeholder="CERT-0001" autoCapitalize="characters" /></View></View><FormField label="Course" value={form.course} onChangeText={(value) => updateField('course', value)} placeholder="Course name" /><Pressable onPress={addCertificate} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><ThemedText style={styles.saveButtonText}>Save to stock</ThemedText></Pressable></ThemedView>}
              <View style={styles.listHeading}><ThemedText style={styles.sectionTitle}>Certificate records</ThemedText><ThemedText themeColor="textSecondary" style={styles.recordCount}>{filteredCertificates.length} records</ThemedText></View>
            </View>}
            renderItem={({ item }) => <CertificateCard certificate={item} onIssue={() => issueCertificate(item.id)} onPrint={() => printReceipt(item)} />}
            ListEmptyComponent={<ThemedView type="backgroundElement" style={styles.emptyState}><ThemedText style={styles.emptyIcon}>⌕</ThemedText><ThemedText style={styles.emptyTitle}>No certificates found</ThemedText><ThemedText themeColor="textSecondary" style={styles.emptyText}>Try another search or add a new record.</ThemedText></ThemedView>}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );

  function issueCertificate(id: string) {
    const certificate = certificates.find((item) => item.id === id);
    if (!certificate || certificate.issuedAt) return;
    Alert.alert('Issue certificate?', `Mark ${certificate.name}'s certificate as issued?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Issue certificate', onPress: () => setCertificates((current) => current.map((item) => item.id === id ? { ...item, issuedAt: new Date().toISOString() } : item)) },
    ]);
  }

  async function printReceipt(certificate: Certificate) {
    try {
      await Print.printAsync({ html: receiptHtml(certificate) });
    } catch {
      Alert.alert('Print unavailable', 'The receipt could not be sent to the printer.');
    }
  }
}

function FormField({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) { return <View style={styles.field}><ThemedText style={styles.fieldLabel}>{label}</ThemedText><TextInput {...props} placeholderTextColor={Colors.light.textSecondary} style={styles.input as any} /></View>; }
function CertificateCard({ certificate, onIssue, onPrint }: { certificate: Certificate; onIssue: () => void; onPrint: () => void }) { return <ThemedView type="backgroundElement" style={styles.recordCard}><View style={styles.recordTopRow}><View style={styles.avatar}><ThemedText style={styles.avatarText}>{certificate.name.charAt(0).toUpperCase()}</ThemedText></View><View style={styles.recordIdentity}><ThemedText style={styles.recordName}>{certificate.name}</ThemedText><ThemedText themeColor="textSecondary" style={styles.recordCourse}>{certificate.course}</ThemedText></View><View style={styles.status}><ThemedText style={styles.statusText}>{certificate.issuedAt ? 'ISSUED' : 'IN STOCK'}</ThemedText></View></View><View style={styles.detailsGrid}><Detail label="Registration no" value={certificate.registrationNo} /><Detail label="Telephone" value={certificate.telephone} /><Detail label="Added to system" value={formatDate(certificate.addedAt)} /><Detail label="Issued to student" value={certificate.issuedAt ? formatDate(certificate.issuedAt) : 'Not issued'} /><Detail label="Address" value={certificate.address} fullWidth /></View>{certificate.issuedAt ? <Pressable onPress={onPrint} style={({ pressed }) => [styles.addButton, { marginTop: Spacing.three, marginBottom: 0 }, pressed && styles.pressed]}><ThemedText style={styles.addButtonText}>Print receipt</ThemedText></Pressable> : <Pressable onPress={onIssue} style={({ pressed }) => [styles.addButton, { marginTop: Spacing.three, marginBottom: 0 }, pressed && styles.pressed]}><ThemedText style={styles.addButtonText}>Issue certificate</ThemedText></Pressable>}</ThemedView>; }
function Detail({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) { return <View style={[styles.detail, fullWidth && styles.detailFull]}><ThemedText themeColor="textSecondary" style={styles.detailLabel}>{label}</ThemedText><ThemedText style={styles.detailValue}>{value}</ThemedText></View>; }

function formatDate(value: string) { return new Date(value).toLocaleDateString(); }
function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character); }
function receiptHtml(certificate: Certificate) { return `<html><body style="font-family:Arial,sans-serif;padding:32px;color:#183D3B"><h1>Certificate Issue Receipt</h1><p>Certificate issued to the student</p><hr/><p><strong>Name:</strong> ${escapeHtml(certificate.name)}</p><p><strong>Address:</strong> ${escapeHtml(certificate.address)}</p><p><strong>Telephone:</strong> ${escapeHtml(certificate.telephone)}</p><p><strong>Course:</strong> ${escapeHtml(certificate.course)}</p><p><strong>Registration no:</strong> ${escapeHtml(certificate.registrationNo)}</p><hr/><p><strong>Added to system:</strong> ${formatDate(certificate.addedAt)}</p><p><strong>Issued to student:</strong> ${certificate.issuedAt ? formatDate(certificate.issuedAt) : 'Not issued'}</p></body></html>`; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F8F6' }, safeArea: { flex: 1, width: '100%' }, keyboardView: { flex: 1 }, content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: BottomTabInset + Spacing.five },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.four }, eyebrow: { color: '#B66A3C', fontSize: 11, letterSpacing: 1.6, fontWeight: '800', marginBottom: 8 }, title: { color: '#183D3B', fontSize: 34, lineHeight: 40, fontWeight: '800' }, subtitle: { fontSize: 14, marginTop: 7 }, headerMark: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E7A46A', alignItems: 'center', justifyContent: 'center' }, headerMarkText: { color: '#183D3B', fontWeight: '900', fontSize: 17 }, summaryRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three }, summaryCard: { flex: 1, padding: Spacing.three, borderRadius: 18, minHeight: 92 }, summaryAccent: { backgroundColor: '#183D3B' }, summaryLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 }, summaryValue: { color: '#E7A46A', fontSize: 32, lineHeight: 38, fontWeight: '800', marginTop: 7 }, searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E5E1', borderRadius: 14, paddingHorizontal: 14, minHeight: 52, marginBottom: Spacing.two }, searchIcon: { color: '#B66A3C', fontSize: 27, lineHeight: 30, marginRight: 8 }, searchInput: { flex: 1, color: '#183D3B', fontSize: 15, minHeight: 50 }, clearSearch: { fontSize: 24, paddingLeft: 8 }, addButton: { backgroundColor: '#E7A46A', borderRadius: 14, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three }, addButtonPlus: { color: '#183D3B', fontSize: 25, lineHeight: 27, marginRight: 8 }, addButtonText: { color: '#183D3B', fontSize: 15, fontWeight: '800' }, pressed: { opacity: 0.75 }, formCard: { padding: Spacing.three, borderRadius: 18, marginBottom: Spacing.four, backgroundColor: '#EAF0EC' }, formTitle: { color: '#183D3B', fontSize: 19, fontWeight: '800' }, formHint: { fontSize: 13, marginTop: 4, marginBottom: Spacing.three }, formRow: { flexDirection: 'row', gap: Spacing.two }, halfField: { flex: 1 }, field: { marginBottom: Spacing.two, flex: 1 }, fieldLabel: { color: '#48615F', fontSize: 11, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }, input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D6E0DA', borderRadius: 10, minHeight: 44, paddingHorizontal: 12, color: '#183D3B', fontSize: 14 }, saveButton: { backgroundColor: '#183D3B', minHeight: 46, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.one }, saveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 }, listHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: Spacing.two }, sectionTitle: { color: '#183D3B', fontSize: 19, fontWeight: '800' }, recordCount: { fontSize: 12 }, recordCard: { padding: Spacing.three, borderRadius: 18, marginBottom: Spacing.two, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6EAE6' }, recordTopRow: { flexDirection: 'row', alignItems: 'center' }, avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#F2D4BA', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#9A4E2F', fontSize: 17, fontWeight: '800' }, recordIdentity: { flex: 1, marginLeft: 12 }, recordName: { color: '#183D3B', fontSize: 16, fontWeight: '800' }, recordCourse: { fontSize: 13, marginTop: 2 }, status: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, backgroundColor: '#E4F2E6' }, statusText: { color: '#347043', fontSize: 9, fontWeight: '900', letterSpacing: 0.6 }, detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.three, paddingTop: Spacing.two, borderTopWidth: 1, borderTopColor: '#EDF0ED' }, detail: { width: '50%', marginBottom: Spacing.two }, detailFull: { width: '100%', marginBottom: 0 }, detailLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700' }, detailValue: { color: '#284946', fontSize: 13, fontWeight: '600', marginTop: 2 }, emptyState: { alignItems: 'center', padding: Spacing.five, borderRadius: 18 }, emptyIcon: { color: '#B66A3C', fontSize: 34 }, emptyTitle: { color: '#183D3B', fontSize: 17, fontWeight: '800', marginTop: Spacing.two }, emptyText: { fontSize: 13, marginTop: 5 },
});

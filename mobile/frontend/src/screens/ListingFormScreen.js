import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { listingsApi } from '../api/client';
import { ISPARTA_KONUMLAR, VITES_OPTIONS, YAKIT_OPTIONS, KASA_OPTIONS } from '../constants/config';
import { colors } from '../theme/colors';

const emptyForm = {
  marka: '', seri: '', model: '', yil: '', kilometre: '',
  vites: '', yakit: '', kasaTipi: '', fiyat: '', aciklama: '', konum: ''
};

export default function ListingFormScreen({ route, navigation }) {
  const editing = route.params?.listing;
  const [form, setForm] = useState(editing ? {
    marka: String(editing.marka || ''),
    seri: String(editing.seri || ''),
    model: String(editing.model || ''),
    yil: String(editing.yil || ''),
    kilometre: String(editing.kilometre || ''),
    vites: editing.vites || '',
    yakit: editing.yakit || '',
    kasaTipi: editing.kasaTipi || '',
    fiyat: String(editing.fiyat || ''),
    aciklama: String(editing.aciklama || ''),
    konum: editing.konum || ''
  } : emptyForm);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
      mediaTypes: ['images']
    });
    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const handleSubmit = async () => {
    const required = ['marka', 'seri', 'model', 'yil', 'kilometre', 'vites', 'yakit', 'kasaTipi', 'fiyat', 'aciklama', 'konum'];
    if (required.some((k) => !form[k])) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    images.forEach((img, idx) => {
      formData.append('resimler', {
        uri: img.uri,
        name: `photo-${idx}.jpg`,
        type: 'image/jpeg'
      });
    });

    setLoading(true);
    try {
      if (editing) {
        await listingsApi.update(editing._id, formData);
        Alert.alert('Başarılı', 'İlan güncellendi.');
      } else {
        await listingsApi.create(formData);
        Alert.alert('Başarılı', 'İlan eklendi.');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.mesaj || 'İlan kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{editing ? 'İlanı Düzenle' : 'Yeni İlan Ver'}</Text>

      {['marka', 'seri', 'model', 'yil', 'kilometre', 'fiyat', 'aciklama'].map((field) => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          keyboardType={['yil', 'kilometre', 'fiyat'].includes(field) ? 'numeric' : 'default'}
          value={form[field]}
          onChangeText={(v) => update(field, v)}
        />
      ))}

      <PickerField label="Vites" value={form.vites} options={VITES_OPTIONS} onChange={(v) => update('vites', v)} />
      <PickerField label="Yakıt" value={form.yakit} options={YAKIT_OPTIONS} onChange={(v) => update('yakit', v)} />
      <PickerField label="Kasa" value={form.kasaTipi} options={KASA_OPTIONS} onChange={(v) => update('kasaTipi', v)} />
      <PickerField label="Konum" value={form.konum} options={ISPARTA_KONUMLAR} onChange={(v) => update('konum', v)} />

      <TouchableOpacity style={styles.photoBtn} onPress={pickImages}>
        <Text style={styles.photoBtnText}>Fotoğraf Seç ({images.length})</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{editing ? 'Güncelle' : 'Onayla'}</Text>}
      </TouchableOpacity>
      {editing && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>İptal</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function PickerField({ label, value, options, onChange }) {
  return (
    <View style={styles.pickerWrap}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, value === opt && styles.chipActive]}
            onPress={() => onChange(opt)}
          >
            <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: colors.text },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10 },
  pickerWrap: { marginBottom: 12 },
  pickerLabel: { fontWeight: '600', marginBottom: 8, color: colors.text },
  chip: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12 },
  chipTextActive: { color: '#fff' },
  photoBtn: { backgroundColor: colors.secondary, padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 12 },
  photoBtnText: { color: '#fff', fontWeight: '600' },
  submitBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { backgroundColor: '#6b7280', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  cancelText: { color: '#fff', fontWeight: '600' }
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [form, setForm] = useState({ adSoyad: '', eskiSifre: '', yeniSifre: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!form.eskiSifre) {
      Alert.alert('Hata', 'Mevcut şifrenizi girmelisiniz.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.updateProfile({
        adSoyad: form.adSoyad || undefined,
        eskiSifre: form.eskiSifre,
        yeniSifre: form.yeniSifre || undefined
      });
      if (res.data.kullanici) {
        await updateUser(res.data.kullanici);
      }
      Alert.alert('Başarılı', res.data.mesaj || 'Profil güncellendi.');
      setForm({ adSoyad: '', eskiSifre: '', yeniSifre: '' });
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.mesaj || 'Güncelleme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınız ve tüm ilanlarınız kalıcı olarak silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil', style: 'destructive', onPress: async () => {
            try {
              await authApi.deleteAccount();
              await logout();
              Alert.alert('Bilgi', 'Hesabınız silindi.');
            } catch (err) {
              Alert.alert('Hata', err.response?.data?.mesaj || 'Hesap silinemedi.');
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.adSoyad}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Text style={styles.section}>Profil Güncelle</Text>
      <TextInput
        style={styles.input}
        placeholder={`Yeni Ad Soyad (Mevcut: ${user?.adSoyad})`}
        value={form.adSoyad}
        onChangeText={(v) => setForm({ ...form, adSoyad: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Yeni Şifre (opsiyonel)"
        secureTextEntry
        value={form.yeniSifre}
        onChangeText={(v) => setForm({ ...form, yeniSifre: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Mevcut Şifre (zorunlu)"
        secureTextEntry
        value={form.eskiSifre}
        onChangeText={(v) => setForm({ ...form, eskiSifre: v })}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Değişiklikleri Kaydet</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.btnText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount}>
        <Text style={styles.btnText}>Hesabımı Kalıcı Olarak Sil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  card: { backgroundColor: colors.secondary, borderRadius: 14, padding: 20, marginBottom: 20 },
  name: { color: '#fff', fontSize: 22, fontWeight: '700' },
  email: { color: '#d1d5db', marginTop: 4 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: colors.text },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10 },
  primaryBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  logoutBtn: { backgroundColor: colors.secondary, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  dangerBtn: { backgroundColor: colors.danger, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700' }
});

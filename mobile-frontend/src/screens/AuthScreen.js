import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ adSoyad: '', email: '', sifre: '' });

  const handleSubmit = async () => {
    if (!form.email || !form.sifre || (mode === 'register' && !form.adSoyad)) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.sifre);
        Alert.alert('Başarılı', 'Giriş yapıldı!');
        setForm({ adSoyad: '', email: '', sifre: '' });
      } else {
        await register(form.adSoyad, form.email, form.sifre);
        Alert.alert('Başarılı', 'Kayıt tamamlandı. Şimdi giriş yapabilirsiniz.');
        setMode('login');
        setForm({ adSoyad: '', email: '', sifre: '' });
      }
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.mesaj || 'İşlem başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>32Bit Garage</Text>
        <Text style={styles.subtitle}>{mode === 'login' ? 'Giriş Yap' : 'Üye Ol'}</Text>

        {mode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            value={form.adSoyad}
            onChangeText={(v) => setForm({ ...form, adSoyad: v })}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          secureTextEntry
          value={form.sifre}
          onChangeText={(v) => setForm({ ...form, sifre: v })}
        />

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.btnText}>{mode === 'login' ? 'Giriş' : 'Kayıt Ol'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={styles.toggle}>
            {mode === 'login' ? 'Hesabın yok mu? Üye ol' : 'Zaten üye misin? Giriş yap'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 28, fontWeight: '800', color: colors.secondary, textAlign: 'center' },
  subtitle: { fontSize: 18, color: colors.textMuted, textAlign: 'center', marginBottom: 24, marginTop: 8 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  toggle: { color: colors.primary, textAlign: 'center', marginTop: 20, fontWeight: '600' }
});

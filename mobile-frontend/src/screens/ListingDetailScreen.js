import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { API_URL } from '../constants/config';
import { colors } from '../theme/colors';

export default function ListingDetailScreen({ route }) {
  const { listing } = route.params;
  const imageUrl = listing.resimler?.[0] ? `${API_URL}/uploads/${listing.resimler[0]}` : null;

  return (
    <ScrollView style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.noImage]}><Text>Fotoğraf Yok</Text></View>
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{listing.marka} {listing.seri}</Text>
        <Text style={styles.price}>{Number(listing.fiyat).toLocaleString('tr-TR')} TL</Text>
        <Text style={styles.row}>📍 {listing.konum}</Text>
        <Text style={styles.row}>Model: {listing.model}</Text>
        <Text style={styles.row}>Yıl: {listing.yil}</Text>
        <Text style={styles.row}>Kilometre: {listing.kilometre} KM</Text>
        <Text style={styles.row}>Vites: {listing.vites}</Text>
        <Text style={styles.row}>Yakıt: {listing.yakit}</Text>
        <Text style={styles.row}>Kasa: {listing.kasaTipi}</Text>
        <Text style={styles.descTitle}>Açıklama</Text>
        <Text style={styles.desc}>{listing.aciklama}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { width: '100%', height: 240 },
  noImage: { backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  body: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  price: { fontSize: 26, fontWeight: '800', color: colors.primary, marginVertical: 8 },
  row: { fontSize: 15, color: colors.text, marginBottom: 6 },
  descTitle: { fontWeight: '700', marginTop: 16, marginBottom: 8 },
  desc: { color: colors.textMuted, lineHeight: 22 }
});

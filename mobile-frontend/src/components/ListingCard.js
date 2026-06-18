import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { API_URL } from '../constants/config';
import { colors } from '../theme/colors';

export default function ListingCard({ listing, isFavorite, onPress, onToggleFavorite, showOwnerActions, onEdit, onDelete }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = listing.resimler?.[0]
    ? `${API_URL}/uploads/${listing.resimler[0]}`
    : null;
  const showImage = imageUrl && !imageError;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={styles.noImageText}>Fotoğraf Yok</Text>
        </View>
      )}

      <TouchableOpacity style={styles.favBtn} onPress={onToggleFavorite}>
        <Text style={styles.favIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.title}>{listing.marka} {listing.seri}</Text>
        <Text style={styles.price}>{Number(listing.fiyat).toLocaleString('tr-TR')} TL</Text>
        <Text style={styles.meta}>📍 {listing.konum}</Text>
        <Text style={styles.detail}>{listing.model} · {listing.yil} · {listing.kilometre} KM</Text>
        <Text style={styles.tags}>{listing.yakit} | {listing.vites} | {listing.kasaTipi}</Text>

        {showOwnerActions && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
              <Text style={styles.actionText}>Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Text style={styles.actionText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  image: { width: '100%', height: 180 },
  noImage: { backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: colors.textMuted },
  favBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 6 },
  favIcon: { fontSize: 18 },
  body: { padding: 14 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  price: { fontSize: 20, fontWeight: '800', color: colors.primary, marginTop: 4 },
  meta: { color: colors.textMuted, marginTop: 6 },
  detail: { marginTop: 4, color: colors.text },
  tags: { marginTop: 4, color: colors.textMuted, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  editBtn: { flex: 1, backgroundColor: colors.secondary, padding: 10, borderRadius: 8, alignItems: 'center' },
  deleteBtn: { flex: 1, backgroundColor: colors.danger, padding: 10, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '600' }
});

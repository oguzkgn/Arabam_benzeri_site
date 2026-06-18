export function filterAndSortListings(listings, filters, sort, favoriteIds = [], onlyFavorites = false) {
  let result = [...listings];

  if (filters.vites) result = result.filter((a) => a.vites === filters.vites);
  if (filters.yakit) result = result.filter((a) => a.yakit?.toLowerCase().includes(filters.yakit.toLowerCase()));
  if (filters.kasaTipi) result = result.filter((a) => a.kasaTipi === filters.kasaTipi);
  if (filters.maxKm) result = result.filter((a) => Number(a.kilometre) <= Number(filters.maxKm));
  if (filters.maxFiyat) result = result.filter((a) => Number(a.fiyat) <= Number(filters.maxFiyat));
  if (filters.konum) result = result.filter((a) => a.konum === filters.konum);
  if (onlyFavorites) result = result.filter((a) => favoriteIds.includes(a._id));

  result.sort((a, b) => {
    if (sort === 'fiyatArtan') return Number(a.fiyat) - Number(b.fiyat);
    if (sort === 'fiyatAzalan') return Number(b.fiyat) - Number(a.fiyat);
    if (sort === 'kmArtan') return Number(a.kilometre) - Number(b.kilometre);
    if (sort === 'kmAzalan') return Number(b.kilometre) - Number(a.kilometre);
    return String(b._id).localeCompare(String(a._id));
  });

  return result;
}

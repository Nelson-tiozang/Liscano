const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encode une paire (latitude, longitude) en geohash standard.
 * Précision par défaut de 9 caractères (~5m de résolution), largement suffisant
 * pour indexer/afficher la position d'un mécanicien.
 *
 * Le geohash n'est PAS utilisé pour le calcul de distance exact (on utilise la
 * formule de Haversine en SQL pour ça) : il sert surtout de champ d'indexation
 * textuelle rapide et de repère lisible pour le debug / les logs.
 */
export function encoderGeohash(latitude: number, longitude: number, precision = 9): string {
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;
  let hash = '';
  let bit = 0;
  let ch = 0;
  let estLongitude = true;

  while (hash.length < precision) {
    if (estLongitude) {
      const mid = (lonMin + lonMax) / 2;
      if (longitude >= mid) {
        ch |= 1 << (4 - bit);
        lonMin = mid;
      } else {
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (latitude >= mid) {
        ch |= 1 << (4 - bit);
        latMin = mid;
      } else {
        latMax = mid;
      }
    }

    estLongitude = !estLongitude;

    if (bit < 4) {
      bit++;
    } else {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}

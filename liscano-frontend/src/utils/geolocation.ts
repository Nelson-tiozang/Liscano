export interface Position {
  latitude: number;
  longitude: number;
}

/** Wrapper Promise autour de l'API navigator.geolocation du navigateur. */
export function obtenirPositionActuelle(): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas disponible sur ce navigateur."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      (erreur) => {
        const messages: Record<number, string> = {
          1: 'Permission de localisation refusée. Autorise-la pour trouver un mécanicien proche.',
          2: 'Position indisponible pour le moment.',
          3: "Délai dépassé pour obtenir ta position.",
        };
        reject(new Error(messages[erreur.code] || 'Impossible de récupérer ta position.'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

/** Coordonnées par défaut : centre de Yaoundé — utilisées si la géolocalisation échoue ou est refusée. */
export const POSITION_YAOUNDE: Position = { latitude: 3.848, longitude: 11.5021 };

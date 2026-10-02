import '@fastify/jwt';

export type Role = 'CLIENT' | 'MECANICIEN' | 'ADMINISTRATEUR';
export type TypeJeton = 'access' | 'refresh';

export interface JwtPayload {
  sub: string; // id de l'utilisateur
  telephone: string;
  role: Role;
  type: TypeJeton;
}

declare module 'fastify' {
  interface FastifyRequest {
    /** Rempli par le middleware `authentifier` après vérification du token d'accès. */
    utilisateurCourant?: JwtPayload;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

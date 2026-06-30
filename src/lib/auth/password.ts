import bcrypt from "bcryptjs";

/** Coût bcrypt — compromis sécurité / latence adapté au serverless. */
const COUT_BCRYPT = 12;

export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  return bcrypt.hash(motDePasse, COUT_BCRYPT);
}

export async function verifierMotDePasse(
  motDePasse: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(motDePasse, hash);
}

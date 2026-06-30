import "server-only";

export type StatutSMS = "simule" | "envoye" | "echec";

/**
 * Socle d'envoi SMS — gated par la variable d'env `SMS_API_KEY`.
 * En son absence, l'envoi est SIMULÉ (log console), à l'image du repli console de Resend.
 * Le point d'intégration d'un fournisseur (agrégateur, Orange/MTN…) est marqué ci-dessous.
 */
export async function envoyerSMS(telephone: string, message: string): Promise<StatutSMS> {
  const cle = process.env.SMS_API_KEY;
  if (!cle) {
    console.log(`[SMS simulé] → ${telephone} : ${message}`);
    return "simule";
  }
  try {
    // Point d'intégration du fournisseur SMS — à brancher avec la clé.
    // await fetch(URL_FOURNISSEUR, { method: "POST", headers: { Authorization: `Bearer ${cle}` }, body: ... });
    return "envoye";
  } catch (e) {
    console.error("[SMS] échec d'envoi :", e);
    return "echec";
  }
}

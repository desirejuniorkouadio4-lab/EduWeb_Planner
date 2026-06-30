/** Modèle CSV d'import des enseignants (téléchargement). */
export function GET() {
  const contenu =
    "prenoms;nom;email\n" +
    "Aya;Kouassi;aya.kouassi@exemple.ci\n" +
    "Koffi;Yao;koffi.yao@exemple.ci\n";
  return new Response(contenu, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modele-enseignants.csv"',
    },
  });
}

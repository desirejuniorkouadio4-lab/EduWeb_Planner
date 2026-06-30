"use client";

import { useState } from "react";
import { FileSpreadsheet, Download, Wand2 } from "lucide-react";

interface Ligne {
  nom: string;
  prenoms: string;
  email: string;
  matricule: string;
  etablissement: string;
}

function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
function parseCSV(texte: string): string[][] {
  const lignes = texte.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lignes.length === 0) return [];
  const virg = (lignes[0].match(/,/g) ?? []).length;
  const pv = (lignes[0].match(/;/g) ?? []).length;
  const delim = pv > virg ? ";" : ",";
  return lignes.map((l) => l.split(delim).map((c) => c.trim().replace(/^"|"$/g, "")));
}
function idx(entete: string[], ...alias: string[]) {
  return entete.findIndex((h) => alias.includes(norm(h)));
}

export function Convertisseur() {
  const [texte, setTexte] = useState("");
  const [lignes, setLignes] = useState<Ligne[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  function convertir() {
    setErreur(null);
    const t = parseCSV(texte);
    if (t.length < 2) {
      setErreur("Le CSV doit contenir un en-tête et au moins une ligne.");
      setLignes(null);
      return;
    }
    const e = t[0];
    const cols = {
      nom: idx(e, "nom", "lastname", "surname", "famille"),
      prenoms: idx(e, "prenoms", "prenom", "firstname", "givenname"),
      email: idx(e, "email", "mail", "courriel"),
      matricule: idx(e, "matricule", "idnumber", "id"),
      etablissement: idx(e, "etablissement", "institution", "ecole"),
    };
    if (cols.nom < 0 && cols.prenoms < 0) {
      setErreur("Colonnes introuvables : attendu au moins « nom » (ou lastname).");
      setLignes(null);
      return;
    }
    const cell = (l: string[], i: number) => (i >= 0 && i < l.length ? l[i] : "");
    const res = t.slice(1)
      .map((l) => ({
        nom: cell(l, cols.nom) || cell(l, cols.prenoms),
        prenoms: cols.prenoms >= 0 ? cell(l, cols.prenoms) : "",
        email: cols.email >= 0 ? cell(l, cols.email) : "",
        matricule: cols.matricule >= 0 ? cell(l, cols.matricule) : "",
        etablissement: cols.etablissement >= 0 ? cell(l, cols.etablissement) : "",
      }))
      .filter((r) => r.nom.length > 0);
    if (res.length === 0) {
      setErreur("Aucune ligne valide détectée.");
      setLignes(null);
      return;
    }
    setLignes(res);
  }

  function telecharger() {
    if (!lignes) return;
    const head = "nom;prenoms;email;matricule;etablissement";
    const corps = lignes.map((l) => [l.nom, l.prenoms, l.email, l.matricule, l.etablissement].join(";")).join("\n");
    const blob = new Blob([`${head}\n${corps}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apprenants-converti.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-700/65">
        Collez un export Moodle (colonnes <code>lastname, firstname, email, idnumber, institution</code>).
        Le convertisseur produit le format attendu par l&apos;import des apprenants
        (<code>nom; prenoms; email; matricule; etablissement</code>).
      </p>
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={6}
        placeholder={"lastname,firstname,email,idnumber\nKouassi,Awa,awa@ex.ci,EM-001"}
        className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 font-mono text-xs outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
      />
      {erreur && <p className="text-xs text-red-600">{erreur}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={convertir}
          disabled={!texte.trim()}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-forest-800 px-5 text-sm font-semibold text-cream-50 hover:bg-forest-700 disabled:opacity-50"
        >
          <Wand2 size={15} /> Convertir
        </button>
        {lignes && (
          <button
            type="button"
            onClick={telecharger}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-forest-200 px-5 text-sm font-semibold text-forest-800 hover:bg-forest-50"
          >
            <Download size={15} /> Télécharger ({lignes.length})
          </button>
        )}
      </div>

      {lignes && (
        <div className="overflow-x-auto rounded-xl border border-cream-200">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50 text-left text-ink-700/65">
                <th className="px-2 py-2 font-semibold"><FileSpreadsheet size={12} className="mr-1 inline" />Nom</th>
                <th className="px-2 py-2 font-semibold">Prénoms</th>
                <th className="px-2 py-2 font-semibold">E-mail</th>
                <th className="px-2 py-2 font-semibold">Matricule</th>
                <th className="px-2 py-2 font-semibold">Établissement</th>
              </tr>
            </thead>
            <tbody>
              {lignes.slice(0, 50).map((l, i) => (
                <tr key={i} className="border-b border-cream-100 last:border-0">
                  <td className="px-2 py-1.5 font-medium text-forest-900">{l.nom}</td>
                  <td className="px-2 py-1.5 text-ink-700/80">{l.prenoms || "—"}</td>
                  <td className="px-2 py-1.5 text-ink-700/70">{l.email || "—"}</td>
                  <td className="px-2 py-1.5 font-mono text-ink-700/60">{l.matricule || "—"}</td>
                  <td className="px-2 py-1.5 text-ink-700/70">{l.etablissement || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

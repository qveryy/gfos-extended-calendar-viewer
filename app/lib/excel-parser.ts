import * as XLSX from "xlsx";
import { Abwesenheit, AbwesenheitsTyp, ParsedDaten } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// GFOS-Export Format (echtes Format aus Arbeitszeiterfassung_Beispiel.xlsx):
//
// Spalten: Name | Mandant | OrgEinheit | Person | Stammabt. | Stammgrp. |
//          Datum | Änder.Kennz. | Typ | Zeitpar. | Kommen | Gehen |
//          Ist | Soll | SaldoTag | Arb.-zeit | Kommentar
//
// Besonderheiten:
//  - Typ "ABW" = Abwesenheitseintrag → Kommentar enthält den Abwesenheitstyp
//  - Datum steht nur in der ERSTEN Zeile eines Tages; Folgezeilen erben das Datum
//  - Manche ABW-Kommentare sind keine Abwesenheiten (z.B. "Urlaubsanspruch")
//  - Jede Zeile ist ein einzelner Tag (kein Von/Bis-Bereich)
// ─────────────────────────────────────────────────────────────────────────────

// Spaltenindex (0-basiert)
const COL_NAME      = 0;
const COL_DATUM     = 6;
const COL_TYP       = 8;
const COL_KOMMENTAR = 16;

// Kommentarwerte die als Abwesenheit gelten
const RELEVANTE_KOMMENTARE = new Set([
  "Urlaub",
  "Krank mit AU",
  "Krank ohne AU",
  "Berufs-/Hochschule",
  "Gleitzeitabbau",
  "Sonderurlaub",
  "Homeoffice",
]);

// Mapping von GFOS-Kommentar → unsere AbwesenheitsTyp-Enum
const KOMMENTAR_ZU_TYP: Record<string, AbwesenheitsTyp> = {
  "Urlaub":               "Urlaub",
  "Krank mit AU":         "Krankheit",
  "Krank ohne AU":        "Krankheit",
  "Berufs-/Hochschule":   "Schulung",
  "Gleitzeitabbau":       "Gleitzeitabbau",
  "Sonderurlaub":         "Sonderurlaub",
  "Homeoffice":           "Homeoffice",
};

interface TagEintrag {
  mitarbeiter: string;
  datum: Date;
  typ: AbwesenheitsTyp;
}

export function parseExcelDatei(datei: File): Promise<ParsedDaten> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const daten = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(daten, { type: "array", cellDates: true });

        const blattName = workbook.SheetNames[0];
        const blatt = workbook.Sheets[blattName];

        // raw: false → Dates als JS Date-Objekte
        const alleZeilen: unknown[][] = XLSX.utils.sheet_to_json(blatt, {
          header: 1,
          raw: false,
          dateNF: "yyyy-mm-dd",
          defval: "",
        }) as unknown[][];

        if (alleZeilen.length < 2) {
          reject(new Error("Die Datei enthält keine Daten."));
          return;
        }

        // Erste Zeile = Header, prüfen ob es ein GFOS-Export ist
        const header = alleZeilen[0] as string[];
        const istGFOS =
          header[COL_NAME] === "Name" &&
          header[COL_DATUM] === "Datum" &&
          header[COL_TYP] === "Typ";

        if (!istGFOS) {
          reject(
            new Error(
              "Unbekanntes Dateiformat. Erwartet wird ein GFOS-Arbeitszeitexport mit den Spalten: " +
                "Name, Datum, Typ, Kommentar."
            )
          );
          return;
        }

        // Datumvererbung + ABW-Zeilen extrahieren
        const tagEintraege: TagEintrag[] = [];
        const mitarbeiterDatum = new Map<string, Date>(); // last seen date per employee

        for (let i = 1; i < alleZeilen.length; i++) {
          const zeile = alleZeilen[i] as unknown[];
          const name = String(zeile[COL_NAME] ?? "").trim();
          if (!name) continue;

          // Datum aus Zelle lesen – XLSX liefert es als String "yyyy-mm-dd" oder als Date
          const datumRaw = zeile[COL_DATUM];
          if (datumRaw && String(datumRaw).trim() !== "") {
            const parsed = parseDatumGFOS(datumRaw);
            if (parsed) mitarbeiterDatum.set(name, parsed);
          }

          const typ = String(zeile[COL_TYP] ?? "").trim();
          const kommentar = String(zeile[COL_KOMMENTAR] ?? "").trim();

          if (typ !== "ABW") continue;
          if (!RELEVANTE_KOMMENTARE.has(kommentar)) continue;

          const datum = mitarbeiterDatum.get(name);
          if (!datum) continue;

          const abwTyp = KOMMENTAR_ZU_TYP[kommentar] ?? "Sonstiges";

          tagEintraege.push({
            mitarbeiter: name,
            datum: new Date(datum),
            typ: abwTyp,
          });
        }

        if (tagEintraege.length === 0) {
          reject(
            new Error(
              "Keine Abwesenheitseinträge gefunden. Bitte prüfen Sie, ob die Datei ABW-Einträge mit den Kommentaren Urlaub, Krank mit AU, Krank ohne AU etc. enthält."
            )
          );
          return;
        }

        // Einzelne Tage → zusammenhängende Bereiche (gleicher MA + gleicher Typ + aufeinanderfolgende Tage)
        const abwesenheiten: Abwesenheit[] = konsolidiere(tagEintraege);
        const mitarbeiter = [...new Set(tagEintraege.map((t) => t.mitarbeiter))].sort();

        resolve({ abwesenheiten, mitarbeiter });
      } catch (err) {
        reject(
          new Error(
            "Fehler beim Verarbeiten der Datei. Bitte stellen Sie sicher, dass es sich um eine gültige GFOS-.xlsx-Datei handelt."
          )
        );
      }
    };

    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsArrayBuffer(datei);
  });
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

function parseDatumGFOS(wert: unknown): Date | null {
  if (!wert) return null;

  // XLSX liefert Datum als String "yyyy-mm-dd" wenn dateNF gesetzt
  if (typeof wert === "string") {
    const s = wert.trim();
    // ISO: 2025-01-02
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
    // Deutsch: 02.01.2025
    const de = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (de) return new Date(+de[3], +de[2] - 1, +de[1]);
  }

  if (wert instanceof Date && !isNaN(wert.getTime())) {
    return new Date(wert.getFullYear(), wert.getMonth(), wert.getDate());
  }

  return null;
}

/** Gruppiert einzelne Tageseinträge zu Von–Bis-Bereichen */
function konsolidiere(eintraege: TagEintrag[]): Abwesenheit[] {
  // Sortieren nach Mitarbeiter → Typ → Datum
  const sortiert = [...eintraege].sort((a, b) => {
    if (a.mitarbeiter !== b.mitarbeiter) return a.mitarbeiter.localeCompare(b.mitarbeiter);
    if (a.typ !== b.typ) return a.typ.localeCompare(b.typ);
    return a.datum.getTime() - b.datum.getTime();
  });

  const ergebnis: Abwesenheit[] = [];
  let i = 0;

  while (i < sortiert.length) {
    const start = sortiert[i];
    let ende = start.datum;
    let j = i + 1;

    // Aufeinanderfolgende Tage mit gleichem MA + Typ zusammenfassen
    while (j < sortiert.length) {
      const naechster = sortiert[j];
      if (
        naechster.mitarbeiter !== start.mitarbeiter ||
        naechster.typ !== start.typ
      ) break;

      const diffTage = Math.round(
        (naechster.datum.getTime() - ende.getTime()) / 86_400_000
      );
      // Lücken von 1 Tag (Wochenende) überbrücken wir nicht – jede Woche separat
      if (diffTage > 3) break;

      ende = naechster.datum;
      j++;
    }

    ergebnis.push({
      mitarbeiter: start.mitarbeiter,
      typ: start.typ,
      von: new Date(start.datum),
      bis: new Date(ende),
    });
    i = j;
  }

  return ergebnis;
}


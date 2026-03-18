import { Abwesenheit, AbwesenheitsTyp } from "@/types";

export const TYP_FARBEN: Record<AbwesenheitsTyp, { bg: string; text: string; border: string }> = {
  Urlaub:          { bg: "bg-blue-100",    text: "text-blue-800",    border: "border-blue-300" },
  Krankheit:       { bg: "bg-red-100",     text: "text-red-800",     border: "border-red-300" },
  Schulung:        { bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-300" },
  Sonderurlaub:    { bg: "bg-purple-100",  text: "text-purple-800",  border: "border-purple-300" },
  Homeoffice:      { bg: "bg-green-100",   text: "text-green-800",   border: "border-green-300" },
  Gleitzeitabbau:  { bg: "bg-cyan-100",    text: "text-cyan-800",    border: "border-cyan-300" },
  Sonstiges:       { bg: "bg-gray-100",    text: "text-gray-700",    border: "border-gray-300" },
};

export const MONATE = [
  "Januar","Februar","März","April","Mai","Juni",
  "Juli","August","September","Oktober","November","Dezember",
];

export const WOCHENTAGE_KURZ = ["Mo","Di","Mi","Do","Fr","Sa","So"];

export function getTageImMonat(jahr: number, monat: number): Date[] {
  const ersterTag = new Date(jahr, monat, 1);
  const letzterTag = new Date(jahr, monat + 1, 0);
  const tage: Date[] = [];

  let wochentag = ersterTag.getDay();
  wochentag = wochentag === 0 ? 6 : wochentag - 1;

  for (let i = 0; i < wochentag; i++) {
    tage.push(new Date(jahr, monat, -wochentag + i + 1));
  }
  for (let d = 1; d <= letzterTag.getDate(); d++) {
    tage.push(new Date(jahr, monat, d));
  }
  while (tage.length % 7 !== 0) {
    tage.push(new Date(jahr, monat + 1, tage.length - letzterTag.getDate() - wochentag + 1));
  }
  return tage;
}

// null = alle Mitarbeiter
export function getAbwesenheitenFuerTag(
  datum: Date,
  abwesenheiten: Abwesenheit[],
  aktiveMitarbeiter: string[] | null
): Abwesenheit[] {
  return abwesenheiten.filter((a) => {
    if (aktiveMitarbeiter !== null && !aktiveMitarbeiter.includes(a.mitarbeiter)) return false;
    const d = datum.getTime();
    return d >= a.von.getTime() && d <= a.bis.getTime();
  });
}

export function getAbwesenheitsAnzahl(
  monat: number,
  jahr: number,
  abwesenheiten: Abwesenheit[],
  aktiveMitarbeiter: string[] | null
): number {
  const tage = getTageImMonat(jahr, monat).filter(
    (t) => t.getMonth() === monat && t.getFullYear() === jahr
  );
  let anzahl = 0;
  for (const tag of tage) {
    if (getAbwesenheitenFuerTag(tag, abwesenheiten, aktiveMitarbeiter).length > 0) anzahl++;
  }
  return anzahl;
}

export function istHeute(datum: Date): boolean {
  const h = new Date();
  return datum.getDate() === h.getDate() &&
    datum.getMonth() === h.getMonth() &&
    datum.getFullYear() === h.getFullYear();
}

export function istWochenende(datum: Date): boolean {
  return datum.getDay() === 0 || datum.getDay() === 6;
}

export function istAnderesMonat(datum: Date, monat: number, jahr: number): boolean {
  return datum.getMonth() !== monat || datum.getFullYear() !== jahr;
}

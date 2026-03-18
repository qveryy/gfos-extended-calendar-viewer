export type AbwesenheitsTyp =
  | "Urlaub"
  | "Krankheit"
  | "Schulung"
  | "Sonderurlaub"
  | "Homeoffice"
  | "Gleitzeitabbau"
  | "Sonstiges";

export interface Abwesenheit {
  mitarbeiter: string;
  typ: AbwesenheitsTyp;
  von: Date;
  bis: Date;
}

export interface ParsedDaten {
  abwesenheiten: Abwesenheit[];
  mitarbeiter: string[];
}

export interface GeladeneDatei {
  id: string;
  name: string;
  daten: ParsedDaten;
}

// Feste Farben für Mitarbeiter-Unterscheidung (bis zu 12 gleichzeitig)
export const MITARBEITER_FARBEN = [
  { bg: "bg-violet-100",  text: "text-violet-800",  border: "border-violet-300",  hex: "#7c3aed" },
  { bg: "bg-rose-100",    text: "text-rose-800",    border: "border-rose-300",    hex: "#e11d48" },
  { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300", hex: "#059669" },
  { bg: "bg-orange-100",  text: "text-orange-800",  border: "border-orange-300",  hex: "#ea580c" },
  { bg: "bg-sky-100",     text: "text-sky-800",     border: "border-sky-300",     hex: "#0284c7" },
  { bg: "bg-pink-100",    text: "text-pink-800",    border: "border-pink-300",    hex: "#db2777" },
  { bg: "bg-teal-100",    text: "text-teal-800",    border: "border-teal-300",    hex: "#0d9488" },
  { bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-300",   hex: "#d97706" },
  { bg: "bg-indigo-100",  text: "text-indigo-800",  border: "border-indigo-300",  hex: "#4338ca" },
  { bg: "bg-lime-100",    text: "text-lime-800",    border: "border-lime-300",    hex: "#65a30d" },
  { bg: "bg-cyan-100",    text: "text-cyan-800",    border: "border-cyan-300",    hex: "#0891b2" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-800", border: "border-fuchsia-300", hex: "#a21caf" },
];

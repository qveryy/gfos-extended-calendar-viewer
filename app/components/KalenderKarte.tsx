"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { GeladeneDatei, AbwesenheitsTyp } from "@/types";
import {
  TYP_FARBEN,
  WOCHENTAGE_KURZ,
  getTageImMonat,
  getAbwesenheitenFuerTag,
  istHeute,
  istWochenende,
  istAnderesMonat,
  getAbwesenheitsAnzahl,
} from "@/lib/kalender-utils";

interface Farbe {
  bg: string;
  text: string;
  border: string;
  hex: string;
}

interface KalenderKarteProps {
  datei: GeladeneDatei;
  monat: number;
  jahr: number;
  farbe: Farbe;
  anzahlDateien: number;
}

export function KalenderKarte({ datei, monat, jahr, farbe, anzahlDateien }: KalenderKarteProps) {
  const [ausgewaehlerTag, setAusgewaehlerTag] = useState<Date | null>(null);
  const [aktiverFilter, setAktiverFilter] = useState<AbwesenheitsTyp | null>(null);

  const tage = getTageImMonat(jahr, monat);
  const abwesenheiten = aktiverFilter
    ? datei.daten.abwesenheiten.filter((a) => a.typ === aktiverFilter)
    : datei.daten.abwesenheiten;

  const anzahlDieserMonat = getAbwesenheitsAnzahl(monat, jahr, abwesenheiten, null);

  const tagAbwesenheiten = ausgewaehlerTag
    ? getAbwesenheitenFuerTag(ausgewaehlerTag, abwesenheiten, null)
    : [];

  // Welche Typen kommen in dieser Datei überhaupt vor?
  const vorhandeneTypen = [...new Set(datei.daten.abwesenheiten.map((a) => a.typ))] as AbwesenheitsTyp[];

  // Breite: bei 1 Datei volle Breite, bei 2 halbe, bei 3+ min-width
  const breiteKlasse =
    anzahlDateien === 1
      ? "min-w-full flex-1"
      : anzahlDateien === 2
      ? "min-w-[calc(50%-8px)] flex-1"
      : "min-w-[480px] flex-shrink-0";

  return (
    <div className={`${breiteKlasse} flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden`}>
      {/* Karten-Header mit Dateifarbe */}
      <div className={`flex items-center justify-between border-b px-4 py-3 ${farbe.bg} ${farbe.border} border-opacity-60`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`h-2.5 w-2.5 shrink-0 rounded-full`} style={{ backgroundColor: farbe.hex }} />
          <span className={`truncate text-sm font-semibold ${farbe.text}`}>
            {datei.name.replace(".xlsx", "")}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs ${farbe.text} opacity-70`}>
            {datei.daten.mitarbeiter.length} MA
          </span>
          {anzahlDieserMonat > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold border ${farbe.bg} ${farbe.text} ${farbe.border}`}>
              {anzahlDieserMonat} {anzahlDieserMonat === 1 ? "Tag" : "Tage"}
            </span>
          )}
        </div>
      </div>

      {/* Filter-Leiste für Abwesenheitstypen */}
      {vorhandeneTypen.length > 0 && (
        <div className="flex flex-wrap gap-1 border-b border-slate-100 px-4 py-2">
          {vorhandeneTypen.map((typ) => {
            const tf = TYP_FARBEN[typ];
            const aktiv = aktiverFilter === typ;
            return (
              <button
                key={typ}
                onClick={() => setAktiverFilter(aktiv ? null : typ)}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all ${
                  aktiv
                    ? `${tf.bg} ${tf.text} ${tf.border}`
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {typ}
              </button>
            );
          })}
          {aktiverFilter && (
            <button
              onClick={() => setAktiverFilter(null)}
              className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-400 hover:text-slate-600"
            >
              ✕ Zurücksetzen
            </button>
          )}
        </div>
      )}

      {/* Kalender */}
      <div className="flex flex-1 flex-col p-3 overflow-auto">
        {/* Wochentage */}
        <div className="mb-1 grid grid-cols-7 gap-0.5">
          {WOCHENTAGE_KURZ.map((t) => (
            <div
              key={t}
              className={`py-1 text-center text-[10px] font-semibold uppercase tracking-wide ${
                t === "Sa" || t === "So" ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {t}
            </div>
          ))}
        </div>

        {/* Tage-Grid */}
        <div className="grid grid-cols-7 gap-0.5 flex-1">
          {tage.map((tag, i) => {
            const anderesMonat = istAnderesMonat(tag, monat, jahr);
            const tagAbw = getAbwesenheitenFuerTag(tag, abwesenheiten, null);
            const istAusgewaehlt = ausgewaehlerTag?.toDateString() === tag.toDateString();
            const weekend = istWochenende(tag);

            return (
              <button
                key={i}
                onClick={() => setAusgewaehlerTag(istAusgewaehlt ? null : tag)}
                className={`flex min-h-[70px] flex-col rounded-lg p-1 text-left transition-all border
                  ${anderesMonat ? "opacity-25" : ""}
                  ${weekend && !anderesMonat ? "bg-slate-50" : "bg-white"}
                  ${istHeute(tag) ? "ring-2 ring-blue-400 ring-offset-0" : ""}
                  ${istAusgewaehlt ? "bg-blue-50 ring-2 ring-blue-400" : "hover:bg-slate-50"}
                  border-slate-100 hover:border-slate-200
                `}
              >
                <span
                  className={`mb-0.5 inline-flex h-4.5 w-5 items-center justify-center rounded-full text-[11px] font-semibold
                    ${istHeute(tag) ? "bg-blue-500 text-white" : weekend ? "text-slate-400" : "text-slate-600"}
                  `}
                >
                  {tag.getDate()}
                </span>
                <div className="flex flex-col gap-0.5">
                  {tagAbw.slice(0, 2).map((abw, j) => {
                    const tf = TYP_FARBEN[abw.typ];
                    return (
                      <span
                        key={j}
                        className={`truncate rounded px-0.5 py-px text-[9px] font-medium leading-tight border ${tf.bg} ${tf.text} ${tf.border}`}
                        title={`${abw.mitarbeiter} – ${abw.typ}`}
                      >
                        {datei.daten.mitarbeiter.length === 1
                          ? abw.typ
                          : abw.mitarbeiter.split(",")[0]}
                      </span>
                    );
                  })}
                  {tagAbw.length > 2 && (
                    <span className="text-[9px] text-slate-400 px-0.5">+{tagAbw.length - 2}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tages-Detail */}
        {ausgewaehlerTag && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">
                {ausgewaehlerTag.toLocaleDateString("de-DE", {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </span>
            </div>
            {tagAbwesenheiten.length === 0 ? (
              <p className="text-xs text-slate-400">Keine Abwesenheiten.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tagAbwesenheiten.map((abw, i) => {
                  const tf = TYP_FARBEN[abw.typ];
                  return (
                    <div key={i} className={`rounded-lg border px-2.5 py-1.5 ${tf.bg} ${tf.border}`}>
                      <p className={`text-[11px] font-semibold ${tf.text}`}>{abw.mitarbeiter}</p>
                      <p className={`text-[10px] ${tf.text} opacity-80`}>{abw.typ}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

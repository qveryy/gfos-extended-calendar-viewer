"use client";

import { useState, useMemo } from "react";
import { Shield } from "lucide-react";
import { GeladeneDatei, MITARBEITER_FARBEN } from "@/types";
import { UploadBereich } from "@/components/UploadBereich";
import { Legende } from "@/components/Legende";
import { KalenderKarte } from "@/components/KalenderKarte";

export default function Home() {
  const [geladeneDateien, setGeladeneDateien] = useState<GeladeneDatei[]>([]);
  // Synchronisierter Monat/Jahr für alle Kalender
  const heute = new Date();
  const [monat, setMonat] = useState(heute.getMonth());
  const [jahr, setJahr] = useState(heute.getFullYear());

  // Feste Farbzuweisung pro Datei
  const farbeMap = useMemo(() => {
    const map = new Map<string, number>();
    geladeneDateien.forEach((d, i) => map.set(d.id, i));
    return map;
  }, [geladeneDateien]);

  const handleDateiHinzufuegen = (datei: GeladeneDatei) => {
    setGeladeneDateien((prev) => [...prev, datei]);
  };

  const handleDateiEntfernen = (id: string) => {
    setGeladeneDateien((prev) => prev.filter((d) => d.id !== id));
  };

  const vorMonat = () => {
    if (monat === 0) { setMonat(11); setJahr((j) => j - 1); }
    else setMonat((m) => m - 1);
  };

  const naechsterMonat = () => {
    if (monat === 11) { setMonat(0); setJahr((j) => j + 1); }
    else setMonat((m) => m + 1);
  };

  const zuHeute = () => {
    setMonat(heute.getMonth());
    setJahr(heute.getFullYear());
  };

  const hatDaten = geladeneDateien.length > 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      {/* Titelleiste */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">Abwesenheitskalender</h1>
            <p className="text-[11px] text-slate-400 leading-tight">GFOS · dSPACE Group</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hatDaten && (
            <span className="text-[11px] text-slate-400">
              {geladeneDateien.length} {geladeneDateien.length === 1 ? "Datei" : "Dateien"} geladen
            </span>
          )}
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
            <Shield className="h-3 w-3 text-green-500" />
            <span className="text-[11px] font-medium text-slate-500">Intern</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-60 shrink-0 flex-col gap-5 overflow-y-auto border-r border-slate-200 bg-white p-4">
          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Datei-Upload
            </p>
            <UploadBereich
              geladeneDateien={geladeneDateien}
              onDateiHinzufuegen={handleDateiHinzufuegen}
              onDateiEntfernen={handleDateiEntfernen}
            />
            <p className="mt-2 text-[11px] text-slate-400">
              Jede Datei erhält einen eigenen Kalender.
            </p>
          </section>

          {hatDaten && (
            <section>
              <Legende geladeneDateien={geladeneDateien} farbeMap={farbeMap} />
            </section>
          )}
        </aside>

        {/* Hauptbereich */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {!hatDaten ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="mb-1 text-base font-semibold text-slate-600">Noch keine Daten geladen</h2>
                <p className="text-sm text-slate-400">
                  Laden Sie GFOS-Excel-Exporte hoch – jede Datei erscheint als eigener Kalender.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Synchronisierte Navigationsleiste */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-2.5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={vorMonat}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="min-w-[160px] text-center text-base font-bold text-slate-800">
                    {["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][monat]} {jahr}
                  </span>
                  <button
                    onClick={naechsterMonat}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={zuHeute}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                >
                  Heute
                </button>
              </div>

              {/* Kalender nebeneinander – horizontal scrollbar wenn zu viele */}
              <div className="flex flex-1 gap-4 overflow-x-auto overflow-y-auto p-4">
                {geladeneDateien.map((datei) => {
                  const farbIdx = farbeMap.get(datei.id) ?? 0;
                  const farbe = MITARBEITER_FARBEN[farbIdx % MITARBEITER_FARBEN.length];
                  return (
                    <KalenderKarte
                      key={datei.id}
                      datei={datei}
                      monat={monat}
                      jahr={jahr}
                      farbe={farbe}
                      anzahlDateien={geladeneDateien.length}
                    />
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

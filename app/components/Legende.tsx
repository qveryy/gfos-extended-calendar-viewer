import { GeladeneDatei, MITARBEITER_FARBEN } from "@/types";
import { TYP_FARBEN } from "@/lib/kalender-utils";
import { AbwesenheitsTyp } from "@/types";

interface LegendeProps {
  geladeneDateien: GeladeneDatei[];
  farbeMap: Map<string, number>;
}

export function Legende({ geladeneDateien, farbeMap }: LegendeProps) {
  if (geladeneDateien.length === 0) return null;

  // Alle Abwesenheitstypen die in irgendeiner Datei vorkommen
  const alleTypen = [...new Set(
    geladeneDateien.flatMap((d) => d.daten.abwesenheiten.map((a) => a.typ))
  )] as AbwesenheitsTyp[];

  return (
    <div className="space-y-4">
      {/* Dateien / Kalender */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Kalender
        </p>
        <div className="space-y-1.5">
          {geladeneDateien.map((d) => {
            const farbIdx = farbeMap.get(d.id) ?? 0;
            const farbe = MITARBEITER_FARBEN[farbIdx % MITARBEITER_FARBEN.length];
            return (
              <div key={d.id} className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 shrink-0 rounded-sm border ${farbe.bg} ${farbe.border}`}
                />
                <span className="truncate text-xs text-slate-600" title={d.name}>
                  {d.name.replace(".xlsx", "")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Abwesenheitstypen */}
      {alleTypen.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Abwesenheitstypen
          </p>
          <div className="space-y-1.5">
            {alleTypen.map((typ) => {
              const tf = TYP_FARBEN[typ];
              return (
                <div key={typ} className="flex items-center gap-2">
                  <span className={`h-3 w-3 shrink-0 rounded-sm border ${tf.bg} ${tf.border}`} />
                  <span className="text-xs text-slate-600">{typ}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

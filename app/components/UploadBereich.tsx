"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X, AlertCircle, Plus } from "lucide-react";
import { parseExcelDatei } from "@/lib/excel-parser";
import { GeladeneDatei } from "@/types";

interface UploadBereichProps {
  geladeneDateien: GeladeneDatei[];
  onDateiHinzufuegen: (datei: GeladeneDatei) => void;
  onDateiEntfernen: (id: string) => void;
}

export function UploadBereich({
  geladeneDateien,
  onDateiHinzufuegen,
  onDateiEntfernen,
}: UploadBereichProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const verarbeiteDatei = useCallback(
    async (datei: File) => {
      setFehler(null);
      if (!datei.name.endsWith(".xlsx")) {
        setFehler("Nur .xlsx-Dateien werden unterstützt.");
        return;
      }
      if (datei.size > 10 * 1024 * 1024) {
        setFehler("Die Datei darf maximal 10 MB groß sein.");
        return;
      }
      // Doppelt hochgeladene Dateien vermeiden
      if (geladeneDateien.some((d) => d.name === datei.name)) {
        setFehler(`"${datei.name}" ist bereits geladen.`);
        return;
      }
      setIsLoading(true);
      try {
        const daten = await parseExcelDatei(datei);
        onDateiHinzufuegen({
          id: crypto.randomUUID(),
          name: datei.name,
          daten,
        });
      } catch (err) {
        setFehler(err instanceof Error ? err.message : "Unbekannter Fehler.");
      } finally {
        setIsLoading(false);
      }
    },
    [geladeneDateien, onDateiHinzufuegen]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      // Mehrere Dateien auf einmal droppen
      const dateien = Array.from(e.dataTransfer.files);
      dateien.forEach((d) => verarbeiteDatei(d));
    },
    [verarbeiteDatei]
  );

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateien = Array.from(e.target.files ?? []);
    dateien.forEach((d) => verarbeiteDatei(d));
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      {/* Geladene Dateien */}
      {geladeneDateien.map((d) => (
        <div key={d.id} className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2">
          <FileSpreadsheet className="h-4 w-4 shrink-0 text-green-600" />
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-green-800">
            {d.name}
          </span>
          <button
            onClick={() => onDateiEntfernen(d.id)}
            className="shrink-0 rounded p-0.5 text-green-500 transition hover:bg-green-200 hover:text-green-700"
            title="Entfernen"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {/* Upload-Zone */}
      <label
        htmlFor="file-upload"
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-xs text-slate-500">Wird verarbeitet…</p>
          </div>
        ) : (
          <>
            {geladeneDateien.length > 0 ? (
              <Plus className="mb-1 h-5 w-5 text-slate-400" />
            ) : (
              <Upload className="mb-1 h-5 w-5 text-slate-400" />
            )}
            <p className="text-center text-xs font-medium text-slate-600">
              {geladeneDateien.length > 0 ? "Weitere Datei hochladen" : "GFOS-Export hochladen"}
            </p>
            <p className="text-center text-[11px] text-slate-400">.xlsx · max. 10 MB</p>
          </>
        )}
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".xlsx"
        multiple
        className="sr-only"
        onChange={onFileInput}
        disabled={isLoading}
      />

      {fehler && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
          <p className="text-[11px] leading-relaxed text-red-700">{fehler}</p>
        </div>
      )}
    </div>
  );
}

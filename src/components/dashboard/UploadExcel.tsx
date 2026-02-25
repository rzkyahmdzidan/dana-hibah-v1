"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { DanaHibah } from "@/lib/types";
import { parseExcelData } from "@/lib/utils";
import { uploadDanaHibah } from "@/lib/dana-hibah-actions";

interface UploadExcelProps {
  onDataLoaded: (data: DanaHibah[]) => void;
  onLoadSample: () => void;
}

export default function UploadExcel({ onDataLoaded, onLoadSample }: UploadExcelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  async function processFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError("Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv");
      return;
    }
    setLoading(true);
    setError(null);
    setUploadStatus(null);
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<string, unknown>[];
      if (json.length === 0) {
        setError("File kosong atau sheet pertama tidak memiliki data.");
        return;
      }
      const parsed = parseExcelData(json);
      setFileName(file.name);

      // Simpan ke DB
      const result = await uploadDanaHibah(parsed);
      if (result.error) {
        setError(`Gagal menyimpan: ${result.error}`);
        return;
      }

      setUploadStatus(`${result.count} baris berhasil diupload. Menunggu persetujuan superadmin.`);
      onDataLoaded(parsed);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Gagal membaca file: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (files && files[0]) processFile(files[0]);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Upload Data Excel</h2>
          <p className="text-xs text-slate-400 mt-0.5">Format: .xlsx · .xls · .csv</p>
        </div>
        <button
          onClick={onLoadSample}
          className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-1.5 transition-colors font-medium"
        >
          Gunakan Data Contoh
        </button>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer
          ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}
          ${loading ? "pointer-events-none opacity-60" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="py-8 px-4 flex flex-col items-center gap-2 text-center">
          {loading ? (
            <>
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Memproses & menyimpan file…</p>
            </>
          ) : fileName ? (
            <>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-emerald-700">{fileName}</p>
              <p className="text-xs text-slate-400">Klik untuk ganti file</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-medium text-blue-600">Klik untuk upload</span> atau drag & drop
              </p>
              <p className="text-xs text-slate-400">Excel (.xlsx, .xls) atau CSV</p>
            </>
          )}
        </div>
      </div>

      {uploadStatus && (
        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm text-emerald-700">
          ✓ {uploadStatus}
        </div>
      )}

      {error && (
        <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2 text-sm text-rose-600">
          {error}
        </div>
      )}

      <details className="mt-4">
        <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 select-none">
          Lihat format kolom yang didukung ▾
        </summary>
        <div className="mt-2 text-xs text-slate-500 grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-50 rounded-lg p-3">
          {["No", "Tipe Hibah", "No SPHL", "Tanggal SPHL", "Kode KPPN", "BA Eselon I",
            "Kode Satker", "Nama Satker", "Lokasi Satker", "No Register", "Mata Uang",
            "Nilai Belanja", "Nilai Pendapatan"].map((col) => (
            <span key={col} className="font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5">{col}</span>
          ))}
        </div>
      </details>
    </div>
  );
}
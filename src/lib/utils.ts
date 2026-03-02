import { DanaHibah, SummaryStats, ChartData } from "./types";
import { Dipa } from "./types"; //

export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(2)} Jt`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function parseExcelData(jsonData: Record<string, unknown>[]): DanaHibah[] {
  function convertDate(raw: string): string {
    const [dd, mm, yyyy] = raw.split("-");
    if (dd && mm && yyyy) return `${yyyy}-${mm}-${dd}`;
    return "";
  }

  return jsonData.map((row, index) => {
    const noSphlTanggal = String(row["No. SPHL Tanggal SPHL"] ?? "");
    const parts = noSphlTanggal.trim().split(/\s+/);
    const no_sphl = parts[0] ?? "";
    const tanggal_sphl = parts[1] ? convertDate(parts[1]) : "";

    const baKode = String(row["BA Eselon I Kode Satker"] ?? "");
    const baParts = baKode.replace(/^'/, "").trim().split(/\s+/);
    const ba_eselon_i = baParts.length >= 3 ? baParts.slice(0, 2).join(" ") : (baParts[0] ?? "");
    const kode_satker = baParts.length >= 3 ? baParts[2] : (baParts[1] ?? "");

    return {
      no: Number(row["No."] ?? row["No"] ?? index + 1),
      tipe_hibah: String(row["Tipe Hibah"] ?? ""),
      no_sphl,
      tanggal_sphl,
      kode_kppn: String(row["Kode KPPN"] ?? ""),
      ba_eselon_i,
      kode_satker,
      nama_satker: String(row["Nama Satker"] ?? ""),
      lokasi_satker: String(row["Lokasi Satker"] ?? ""),
      no_register: String(row["No Register"] ?? ""),
      mata_uang: String(row["Mata Uang"] ?? "IDR"),
      nilai_belanja: Number(row["Nilai Belanja"] ?? 0),
      nilai_pendapatan: Number(row["Nilai Pendapatan"] ?? 0),
    };
  });
}

export function computeSummary(data: DanaHibah[]): SummaryStats {
  const satkerSet = new Set(data.map((d) => d.nama_satker).filter(Boolean));
  return {
    totalData: data.length,
    totalSatker: satkerSet.size,
    totalBelanja: data.reduce((s, d) => s + d.nilai_belanja, 0),
    totalPendapatan: data.reduce((s, d) => s + d.nilai_pendapatan, 0),
  };
}

export function groupByLokasi(data: DanaHibah[]): ChartData[] {
  const map: Record<string, ChartData> = {};
  for (const d of data) {
    const key = d.lokasi_satker || "Tidak Diketahui";
    if (!map[key]) map[key] = { label: key, belanja: 0, pendapatan: 0 };
    map[key].belanja += d.nilai_belanja;
    map[key].pendapatan += d.nilai_pendapatan;
  }
  return Object.values(map)
    .sort((a, b) => b.belanja - a.belanja)
    .slice(0, 8);
}

export function groupByTipe(data: DanaHibah[]): ChartData[] {
  const map: Record<string, ChartData> = {};
  for (const d of data) {
    const key = d.tipe_hibah || "Tidak Diketahui";
    if (!map[key]) map[key] = { label: key, belanja: 0, pendapatan: 0 };
    map[key].belanja += d.nilai_belanja;
    map[key].pendapatan += d.nilai_pendapatan;
  }
  return Object.values(map);
}

// Tambahkan 2 fungsi ini ke src/lib/utils.ts

export function groupBySatker(data: DanaHibah[]): ChartData[] {
  const map: Record<string, ChartData> = {};
  for (const d of data) {
    const key = d.nama_satker || d.kode_satker || "Tidak Diketahui";
    if (!map[key]) map[key] = { label: key, belanja: 0, pendapatan: 0 };
    map[key].belanja += d.nilai_belanja;
    map[key].pendapatan += d.nilai_pendapatan;
  }
  return Object.values(map).sort((a, b) => b.belanja - a.belanja);
}

export function groupByBulan(data: DanaHibah[]): ChartData[] {
  const map: Record<string, ChartData> = {};
  for (const d of data) {
    const tgl = d.tanggal_sphl ? new Date(d.tanggal_sphl) : null;
    const key = tgl && !isNaN(tgl.getTime()) ? tgl.toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : "Tidak Diketahui";
    if (!map[key]) map[key] = { label: key, belanja: 0, pendapatan: 0 };
    map[key].belanja += d.nilai_belanja;
    map[key].pendapatan += d.nilai_pendapatan;
  }
  return Object.values(map).sort((a, b) => a.label.localeCompare(b.label));
}
export function parseDipaSheet(jsonData: Record<string, unknown>[]): Omit<Dipa, "id" | "uploaded_by" | "status" | "created_at">[] {
  function cleanNumber(raw: unknown): number {
    if (typeof raw === "number") return raw;
    const s = String(raw ?? "").replace(/[^0-9.-]/g, "");
    return parseFloat(s) || 0;
  }

  function splitBaKodeSatker(raw: unknown): { ba_eselon_i: string; kode_satker: string } {
    // Value: "'060 01 640427" → ba_eselon_i: "060 01", kode_satker: "640427"
    const s = String(raw ?? "")
      .replace(/^'/, "")
      .trim();
    const parts = s.split(/\s+/);
    if (parts.length >= 3) {
      return {
        ba_eselon_i: parts.slice(0, 2).join(" "),
        kode_satker: parts[2],
      };
    }
    return { ba_eselon_i: s, kode_satker: "" };
  }

  return jsonData
    .filter((row) => row["No."] !== undefined && row["No."] !== "")
    .map((row, index) => {
      const { ba_eselon_i, kode_satker } = splitBaKodeSatker(row["BA Eselon I  Kode Satker"]);

      return {
        no: Number(row["No."] ?? index + 1),
        kppn: String(row["KPPN"] ?? "")
          .replace(/^'/, "")
          .trim(),
        tipe_hibah: String(row["Tipe Hibah"] ?? ""),
        no_dipa: "",
        tanggal_dipa: null,
        revisi_ke: "",
        ba_eselon_i,
        kode_satker,
        nama_satker: String(row["Nama Satker"] ?? ""),
        lokasi_satker: String(row["Lokasi Satker"] ?? "")
          .replace(/^'/, "")
          .trim(),
        no_register: String(row["No Register"] ?? ""),
        nilai_hibah: cleanNumber(row["Nilai Hibah"]),
      };
    });
}

import * as XLSX from "xlsx";

export function parseExcelDualSheet(buffer: ArrayBuffer): {
  spmData: Omit<DanaHibah, "id" | "uploaded_by" | "status" | "created_at">[];
  dipaData: Omit<Dipa, "id" | "uploaded_by" | "status" | "created_at">[];
} {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
  const sheetNames = workbook.SheetNames;

  // Cari sheet DIPA dan SPM (tidak case-sensitive)
  const dipaSheetName = sheetNames.find((n) => n.toLowerCase().includes("dipa"));
  const spmSheetName = sheetNames.find((n) => n.toLowerCase().includes("spm") || n.toLowerCase().includes("pengesahan"));

  if (!dipaSheetName) throw new Error(`Sheet DIPA tidak ditemukan. Sheet tersedia: ${sheetNames.join(", ")}`);
  if (!spmSheetName) throw new Error(`Sheet SPM tidak ditemukan. Sheet tersedia: ${sheetNames.join(", ")}`);

  // Parse SPM sheet (pakai parseExcelData yang sudah ada)
  const spmJson = XLSX.utils.sheet_to_json(workbook.Sheets[spmSheetName], {
    defval: "",
  }) as Record<string, unknown>[];
  const spmData = parseExcelData(spmJson);

  // Parse DIPA sheet
  const dipaJson = XLSX.utils.sheet_to_json(workbook.Sheets[dipaSheetName], {
    defval: "",
  }) as Record<string, unknown>[];
  const dipaData = parseDipaSheet(dipaJson);

  return { spmData, dipaData };
}

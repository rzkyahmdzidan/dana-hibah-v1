import { DanaHibah } from "./types";

const SATKER_LIST = [
  { kode: "019001", nama: "Dinas Pendidikan Kota Medan", lokasi: "Medan" },
  { kode: "019002", nama: "Dinas Kesehatan Kota Medan", lokasi: "Medan" },
  { kode: "019003", nama: "Dinas PU Kota Medan", lokasi: "Medan" },
  { kode: "019004", nama: "Dinas Pertanian Kab. Deli Serdang", lokasi: "Deli Serdang" },
  { kode: "019005", nama: "Dinas Kesehatan Kab. Deli Serdang", lokasi: "Deli Serdang" },
  { kode: "019006", nama: "BPBD Kab. Langkat", lokasi: "Langkat" },
  { kode: "019007", nama: "Dinas PU Kab. Langkat", lokasi: "Langkat" },
  { kode: "019008", nama: "Dinas Pendidikan Kab. Karo", lokasi: "Karo" },
];

const TIPE_LIST = ["Langsung", "Tidak Langsung", "Khusus", "Otsus"];
const BA_LIST = ["015", "018", "020", "023", "054"];

export function generateSampleData(count = 30): DanaHibah[] {
  const data: DanaHibah[] = [];
  for (let i = 1; i <= count; i++) {
    const satker = SATKER_LIST[Math.floor(Math.random() * SATKER_LIST.length)];
    const tipe = TIPE_LIST[Math.floor(Math.random() * TIPE_LIST.length)];
    const ba = BA_LIST[Math.floor(Math.random() * BA_LIST.length)];
    const belanja = Math.floor(Math.random() * 5_000_000_000) + 100_000_000;
    const pendapatan = Math.floor(belanja * (0.85 + Math.random() * 0.15));
    const bulan = String(Math.ceil(Math.random() * 12)).padStart(2, "0");
    const tanggal = String(Math.ceil(Math.random() * 28)).padStart(2, "0");

    data.push({
      no: i,
      tipe_hibah: tipe,
      no_sphl: `SPHL-${String(i).padStart(4, "0")}/2024`,
      tanggal_sphl: `${tanggal}/${bulan}/2024`,
      kode_kppn: "116",
      ba_eselon_i: ba,
      kode_satker: satker.kode,
      nama_satker: satker.nama,
      lokasi_satker: satker.lokasi,
      no_register: `REG-${String(i).padStart(5, "0")}`,
      mata_uang: "IDR",
      nilai_belanja: belanja,
      nilai_pendapatan: pendapatan,
    });
  }
  return data;
}
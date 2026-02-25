export interface DanaHibah {
  no: number;
  tipe_hibah: string;
  no_sphl: string;
  tanggal_sphl: string;
  kode_kppn: string;
  ba_eselon_i: string;
  kode_satker: string;
  nama_satker: string;
  lokasi_satker: string;
  no_register: string;
  mata_uang: string;
  nilai_belanja: number;
  nilai_pendapatan: number;
}

export interface SummaryStats {
  totalData: number;
  totalSatker: number;
  totalBelanja: number;
  totalPendapatan: number;
}

export interface ChartData {
  label: string;
  belanja: number;
  pendapatan: number;
}
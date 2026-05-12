import api from './api';

export interface MonthlyWrapped {
  total_pengeluaran: number;
  kategori_terfavorit: string;
  hari_paling_boros: string;
  barang_termahal: string;
  tanggal_terboros: string;
  detail_tanggal_terboros: string;
  tips_bulan_depan: string;
  vibe_bulan_ini: string;
  pesan_lucu: string;
}

export const getMonthlyWrapped = async (year: string, month: string): Promise<MonthlyWrapped> => {
  const response = await api.get(`/ai/wrapped/${year}/${month}`);
  return response.data.data;
};

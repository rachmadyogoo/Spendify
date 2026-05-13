import api from './api';

export interface Transaction {
  id: string;
  user_id: string;
  kategori_nama: string;
  jumlah: number;
  deskripsi: string;
  tanggal: string;
  created_at: string;
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await api.get('/transactions');
  console.log(response.data.data.transactions);
  return response.data.data.transactions;
};

export const addTransaction = async (data: { tanggal: string, kategori: string, jumlah: number, deskripsi: string }) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

export const uploadTransactionsExcel = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/transactions/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteTransaction = async (id: string) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

export const scanReceipt = async (base64Image: string) => {
  const response = await api.post('/transactions/scan', { image: base64Image });
  return response.data.data;
};

export const addBulkTransactions = async (transactions: { tanggal: string, kategori: string, jumlah: number, deskripsi: string }[]) => {
  const response = await api.post('/transactions/bulk', { transactions });
  return response.data;
};

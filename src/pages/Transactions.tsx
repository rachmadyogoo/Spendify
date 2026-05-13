import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileUp, Trash2, Search, ChevronLeft, ChevronRight, Camera, Sparkles, Loader2 } from 'lucide-react';
import { getTransactions, addTransaction, uploadTransactionsExcel, deleteTransaction, scanReceipt, addBulkTransactions } from '../services/transactionService';
import { getCategories, type Category } from '../services/categoryService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../lib/utils';

export default function Transactions() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isManualOpen, setManualOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanMenuOpen, setScanMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formValues, setFormValues] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: '',
    jumlah: '',
    deskripsi: '',
  });

  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [isReviewOpen, setReviewOpen] = useState(false);
  
  // Fetch Data
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Mutation: Add Manual
  const addMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setManualOpen(false);
      setFormValues({
        tanggal: new Date().toISOString().split('T')[0],
        kategori: '',
        jumlah: '',
        deskripsi: '',
      });
    }
  });

  // Mutation: Upload Excel
  const uploadMutation = useMutation({
    mutationFn: uploadTransactionsExcel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      alert('Berhasil mengunggah transaksi!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal mengunggah file');
    }
  });

  const scanMutation = useMutation({
    mutationFn: scanReceipt,
    onSuccess: (res: any) => {
      console.log("Scan Data received:", res);
      setIsScanning(false);
      
      let items: any[] = [];
      
      // Deteksi Array secara agresif
      if (Array.isArray(res)) {
        items = res;
      } else if (res && Array.isArray(res.data)) {
        items = res.data;
      } else if (res && typeof res === 'object') {
        const foundArray = Object.values(res).find(v => Array.isArray(v));
        if (foundArray) items = foundArray as any[];
      }

      if (items && items.length > 0) {
        console.log("Found items array:", items);
        setScannedItems(items);
        setReviewOpen(true);
        setManualOpen(false);
      } else if (res) {
        console.log("No array found, using fallback for single item:", res);
        const singleItem = Array.isArray(res) ? res[0] : (res.data && !Array.isArray(res.data) ? res.data : res);
        setFormValues({
          tanggal: singleItem.tanggal || new Date().toISOString().split('T')[0],
          kategori: singleItem.kategori || '',
          jumlah: singleItem.jumlah?.toString() || '',
          deskripsi: singleItem.deskripsi || '',
        });
        setManualOpen(true);
        setReviewOpen(false);
      }
    },
    onError: () => {
      setIsScanning(false);
      alert('Gagal memproses struk. Silakan coba lagi atau input manual.');
    }
  });

  const bulkAddMutation = useMutation({
    mutationFn: addBulkTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setReviewOpen(false);
      setScannedItems([]);
      alert('Semua transaksi berhasil disimpan!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal menyimpan transaksi');
    }
  });

  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanMenuOpen(false);
      setIsScanning(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        scanMutation.mutate(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredTransactions = transactions?.filter(t => {
    const date = new Date(t.tanggal);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString();

    const matchesSearch = t.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.kategori_nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === 'all' || m === selectedMonth;
    const matchesYear = selectedYear === 'all' || y === selectedYear;

    return matchesSearch && matchesMonth && matchesYear;
  });

  // Pagination Logic
  const totalPages = Math.ceil((filteredTransactions?.length || 0) / itemsPerPage);
  const paginatedTransactions = filteredTransactions?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const months = [
    { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
    { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
  ];

  const years = ['2024', '2025', '2026'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Riwayat Pengeluaran</h2>
          <p className="text-muted-foreground text-sm">Kelola dan pantau semua pengeluaranmu di sini.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".xlsx, .xls"
          />
          <input 
            key={isScanning ? 'scanning' : 'idle'}
            type="file" 
            ref={cameraInputRef} 
            onChange={handleCameraCapture} 
            className="hidden" 
            accept="image/*"
            capture="environment"
          />
          <input 
            type="file" 
            ref={galleryInputRef} 
            onChange={handleCameraCapture} 
            className="hidden" 
            accept="image/*"
          />
          
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setScanMenuOpen(!isScanMenuOpen)} 
              disabled={isScanning}
              className="relative overflow-hidden group"
            >
              {isScanning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2 text-primary" />
              )}
              {isScanning ? 'Memproses...' : 'Scan Struk'}
              {isScanning && (
                <motion.div 
                  className="absolute inset-0 bg-primary/10"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                />
              )}
            </Button>

            <AnimatePresence>
              {isScanMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setScanMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full px-4 py-3 text-sm font-bold flex items-center gap-3 hover:bg-secondary transition-colors text-left"
                    >
                      <Camera className="w-4 h-4 text-primary" />
                      Ambil Foto
                    </button>
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-full px-4 py-3 text-sm font-bold flex items-center gap-3 hover:bg-secondary border-t border-border transition-colors text-left"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Pilih dari Galeri
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
            <FileUp className="w-4 h-4 mr-2" /> 
            {uploadMutation.isPending ? 'Mengunggah...' : 'Upload Excel'}
          </Button>
          <Button size="sm" onClick={() => setManualOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Manual
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-secondary/20 p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari transaksi..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-background border border-input rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px]"
          >
            <option value="all">Semua Bulan</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-background border border-input rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[100px]"
          >
            <option value="all">Semua Tahun</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Memuat data...</td>
                </tr>
              ) : paginatedTransactions?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground italic">Belum ada data transaksi.</td>
                </tr>
              ) : (
                paginatedTransactions?.map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/30 transition-colors group text-sm">
                    <td className="px-6 py-4 font-medium">{new Date(t.tanggal).toLocaleString('id-ID', { dateStyle: 'medium' })}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-wider">
                        {t.kategori_nama}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{t.deskripsi}</td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {formatCurrency(t.jumlah)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground hover:text-destructive p-2 h-auto"
                        onClick={() => {
                          if (confirm('Hapus transaksi ini?')) {
                            deleteMutation.mutate(t.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-secondary/20 border-t border-border flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className={`h-8 w-8 p-0 rounded-lg text-xs font-bold ${currentPage === pageNum ? 'shadow-lg shadow-primary/20' : ''}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Scan Review Modal */}
      <AnimatePresence>
        {isReviewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setReviewOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-md md:text-2xl font-bold">Review Hasil Scan</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Kami menemukan {scannedItems.length} item. Silakan periksa dan sesuaikan.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setScannedItems([...scannedItems, {
                    tanggal: new Date().toISOString().split('T')[0],
                    kategori: '',
                    jumlah: 0,
                    deskripsi: 'Item Baru'
                  }])}
                >
                  <Plus className="w-4 h-4 mr-2" /> Tambah Item
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {scannedItems.map((item, index) => (
                  <motion.div 
                    layout
                    key={index} 
                    className="p-6 bg-secondary/20 border border-border rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative group"
                  >
                    <button 
                      onClick={() => setScannedItems(scannedItems.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 p-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">Tanggal</label>
                      <Input 
                        type="date" 
                        value={item.tanggal}
                        onChange={(e) => {
                          const newItems = [...scannedItems];
                          newItems[index].tanggal = e.target.value;
                          setScannedItems(newItems);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">Kategori</label>
                      <select
                        value={item.kategori}
                        onChange={(e) => {
                          const newItems = [...scannedItems];
                          newItems[index].kategori = e.target.value;
                          setScannedItems(newItems);
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>Kategori</option>
                        {categories?.map((cat: Category) => (
                          <option key={cat.id} value={cat.nama}>{cat.nama}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">Deskripsi</label>
                      <Input 
                        type="text" 
                        value={item.deskripsi}
                        onChange={(e) => {
                          const newItems = [...scannedItems];
                          newItems[index].deskripsi = e.target.value;
                          setScannedItems(newItems);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">Jumlah (Rp)</label>
                      <Input 
                        type="number" 
                        value={item.jumlah}
                        onChange={(e) => {
                          const newItems = [...scannedItems];
                          newItems[index].jumlah = Number(e.target.value);
                          setScannedItems(newItems);
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-8 border-t border-border flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setReviewOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  className="flex-2 px-12" 
                  disabled={bulkAddMutation.isPending || scannedItems.length === 0}
                  onClick={() => bulkAddMutation.mutate(scannedItems)}
                >
                  {bulkAddMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Simpan {scannedItems.length} Transaksi
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Input Modal */}
      <AnimatePresence>
        {isManualOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setManualOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border p-8 rounded-3xl shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-bold">Input Transaksi Manual</h3>
              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  addMutation.mutate({
                    tanggal: formValues.tanggal,
                    kategori: formValues.kategori,
                    jumlah: Number(formValues.jumlah),
                    deskripsi: formValues.deskripsi,
                  });
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Tanggal</label>
                    <Input 
                      type="date" 
                      value={formValues.tanggal} 
                      onChange={(e) => setFormValues({ ...formValues, tanggal: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Kategori</label>
                    <select
                      value={formValues.kategori}
                      onChange={(e) => setFormValues({ ...formValues, kategori: e.target.value })}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Pilih Kategori</option>
                      {categories?.map((cat: Category) => (
                        <option key={cat.id} value={cat.nama}>
                          {cat.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Jumlah (Rp)</label>
                  <Input 
                    type="number" 
                    placeholder="15000" 
                    value={formValues.jumlah}
                    onChange={(e) => setFormValues({ ...formValues, jumlah: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Deskripsi Barang</label>
                  <Input 
                    type="text" 
                    placeholder="Mie Ayam Pangsit" 
                    value={formValues.deskripsi}
                    onChange={(e) => setFormValues({ ...formValues, deskripsi: e.target.value })}
                    required 
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      setManualOpen(false);
                      setFormValues({
                        tanggal: new Date().toISOString().split('T')[0],
                        kategori: '',
                        jumlah: '',
                        deskripsi: '',
                      });
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1" disabled={addMutation.isPending}>
                    {addMutation.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMonthlyWrapped, type MonthlyWrapped } from '../services/aiService';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Calendar, Share2, Download, Home, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wrapped() {
  const [data, setData] = useState<MonthlyWrapped | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Selector state
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const fetchWrapped = async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const targetMonth = parseInt(selectedMonth);
    const targetYear = parseInt(selectedYear);

    // Cek apakah bulan yang dipilih sudah berakhir atau belum
    if (targetYear > currentYear || (targetYear === currentYear && targetMonth >= currentMonth)) {
      setError(`Maaf, Wrapped untuk ${new Date(`${selectedYear}-${selectedMonth}-01`).toLocaleString('id-ID', { month: 'long', year: 'numeric' })} belum tersedia. Tunggu sampai awal bulan depan ya! ✨`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const wrappedData = await getMonthlyWrapped(selectedYear, selectedMonth);
      setData(wrappedData);
      setCurrentSlide(0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengambil data wrapped bulan ini.');
    } finally {
      setLoading(false);
    }
  };

  const slides = data ? [
    {
      id: 'intro',
      title: 'Monthly Wrapped',
      subtitle: `Bulan ${new Date(`${selectedYear}-${selectedMonth}-01`).toLocaleString('id-ID', { month: 'long' })} ${selectedYear}`,
      content: (
        <div className="flex flex-col items-center text-center space-y-8 px-6">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-violet-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] relative group"
          >
            <div className="absolute inset-0 bg-white opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
            <Sparkles className="w-10 h-10 text-white relative z-10" />
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50 tracking-tighter">
              Petualangan Dompetmu Dimulai.
            </h2>
            <p className="text-base md:text-xl text-white/60 font-medium max-w-md mx-auto leading-relaxed">
              Kami telah merangkum semua jejak digital uangmu bulan ini. Siap terkejut?
            </p>
          </div>
        </div>
      ),
      bg: 'bg-[#0a0a0a]'
    },
    {
      id: 'total',
      title: 'Total Pengeluaran',
      subtitle: 'Angka yang berbicara',
      content: (
        <div className="flex flex-col items-center text-center space-y-12 px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-2"
          >
            <span className="text-violet-300 font-black uppercase tracking-[0.3em] text-sm opacity-80">Bulan Ini Kamu Melepas</span>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-violet-500/20 blur-[100px] rounded-full" />
            <div className="text-3xl md:text-6xl font-black text-white relative z-10 tabular-nums tracking-tighter drop-shadow-2xl">
              Rp {data.total_pengeluaran.toLocaleString('id-ID')}
            </div>
          </motion.div>
          <p className="text-lg md:text-2xl text-violet-100/60 font-medium max-w-md">
            Angka yang cukup fantastis untuk sebuah cerita satu bulan, bukan?
          </p>
        </div>
      ),
      bg: 'bg-gradient-to-b from-violet-950 to-[#050510]'
    },
    {
      id: 'category',
      title: 'Kategori Terfavorit',
      subtitle: 'Magnet uangmu',
      content: (
        <div className="flex flex-col items-center text-center space-y-10 px-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-20 border border-emerald-500/10 rounded-full"
            />
            <motion.div
              initial={{ rotate: -15, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-3xl md:text-5xl font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)] relative z-10"
            >
              {data.kategori_terfavorit}
            </motion.div>
          </div>
          <p className="text-xl md:text-3xl text-emerald-100/70 font-bold max-w-lg leading-tight">
            Sepertinya semesta pengeluaranmu berpusat di sini bulan ini.
          </p>
        </div>
      ),
      bg: 'bg-gradient-to-tr from-[#021a1a] to-emerald-950'
    },
    {
      id: 'expensive-item',
      title: 'Barang Termahal',
      subtitle: 'The Big Buy',
      content: (
        <div className="flex flex-col items-center text-center space-y-10 px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="p-10 rounded-[3rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl relative group"
          >
            <div className="absolute -top-4 -left-4 bg-amber-500 text-black font-black text-xs px-4 py-2 rounded-xl rotate-[-5deg] shadow-xl">MOST EXPENSIVE</div>
            <div className="text-xl md:text-4xl font-black text-amber-300 tracking-tight leading-tight">
              "{data.barang_termahal || 'Tidak terdeteksi'}"
            </div>
          </motion.div>
          <p className="text-lg md:text-2xl text-amber-100/60 font-medium max-w-sm">
            Investasi masa depan atau sekadar lapar mata saat itu? Hanya kamu yang tahu.
          </p>
        </div>
      ),
      bg: 'bg-gradient-to-br from-amber-950 via-[#1a1502] to-black'
    },
    {
      id: 'worst-day-week',
      title: 'Hari Paling Boros',
      subtitle: 'Ritual Mingguan',
      content: (
        <div className="flex flex-col items-center text-center space-y-10 px-6">
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "anticipate" }}
            className="text-4xl md:text-7xl font-black text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.4)] tracking-tighter uppercase"
          >
            {data.hari_paling_boros}
          </motion.div>
          <div className="space-y-4">
            <h4 className="text-xl md:text-4xl font-black text-white leading-tight">
              Adalah hari paling "berbahaya" bagi dompetmu.
            </h4>
            <p className="text-base md:text-xl text-rose-100/50 font-medium">
              Akumulasi pengeluaran tertinggimu konsisten jatuh di hari ini.
            </p>
          </div>
        </div>
      ),
      bg: 'bg-gradient-to-b from-rose-950 via-[#1a0205] to-black'
    },
    {
      id: 'worst-date',
      title: 'Puncak Pengeluaran',
      subtitle: 'The Peak Moment',
      content: (
        <div className="flex flex-col items-center text-center space-y-8 px-6">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-2"
          >
            <span className="text-white/40 font-black uppercase tracking-[0.4em] text-xs">Kejadian Terjadi Pada</span>
            <h3 className="text-xl md:text-4xl font-black text-white">
              {new Date(data.tanggal_terboros).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 max-w-xl shadow-2xl relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 px-4 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">Detail Belanja</div>
            <p className="text-base md:text-2xl text-white/90 font-medium italic leading-relaxed">
              "{data.detail_tanggal_terboros || 'Tidak ada detail untuk hari ini.'}"
            </p>
          </motion.div>
        </div>
      ),
      bg: 'bg-gradient-to-br from-[#1a0a0a] to-[#2a0505]'
    },
    {
      id: 'tips',
      title: 'Tips Masa Depan',
      subtitle: 'Langkah Bijak',
      content: (
        <div className="flex flex-col items-center space-y-4 md:space-y-10 px-6 w-full max-w-2xl">
          <div className="text-center space-y-2">
            <h3 className="text-lg md:text-3xl font-black text-blue-400">Strategi Baru</h3>
            <p className="text-blue-200/50 text-xs md:text-base font-medium">Berdasarkan pola belanjamu bulan ini</p>
          </div>

          <motion.div
            className="space-y-6 w-full"
          >
            {(typeof data.tips_bulan_depan === 'string' ? data.tips_bulan_depan.split('\n') : (Array.isArray(data.tips_bulan_depan) ? data.tips_bulan_depan : [])).map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                className="flex gap-4 md:gap-6 items-center bg-white/5 p-4 md:p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors group"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 text-lg md:text-xl font-black shrink-0 group-hover:scale-110 transition-transform">
                  {idx + 1}
                </div>
                <p className="text-purple-50/90 text-sm md:text-xl font-medium leading-tight">
                  {tip.replace(/^\d+\.\s*/, '')}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ),
      bg: 'bg-gradient-to-bl from-[#1a051a] via-[#0a0a1a] to-black'
    },
    {
      id: 'vibe',
      title: 'The Final Vibe',
      subtitle: 'Siapakah Kamu?',
      content: (
        <div className="flex flex-col items-center text-center space-y-12 px-6">
          <div className="space-y-4">
            <span className="text-amber-500 font-black uppercase tracking-[0.5em] text-[9px] md:text-xs">Gelar Bulan Ini</span>
            <motion.div
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 drop-shadow-2xl py-1"
            >
              {data.vibe_bulan_ini}
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="p-4 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white/5 backdrop-blur-3xl border border-white/20 max-w-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-500 to-orange-500" />
            <p className="text-[11px] md:text-xl text-white font-black italic leading-relaxed tracking-tight">
              "{data.pesan_lucu}"
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap justify-center gap-2 pt-2 md:pt-4"
          >
            <Button className="rounded-2xl h-11 md:h-14 px-4 md:px-8 text-[10px] md:text-base font-black bg-white text-black hover:bg-white/90 gap-2 shadow-xl">
              <Share2 className="w-4 h-4 md:w-5 md:h-5" /> Bagikan
            </Button>
            <Button variant="outline" className="rounded-2xl h-11 md:h-14 px-4 md:px-8 text-[10px] md:text-base font-black text-white border-white/20 hover:bg-white/10 gap-2 backdrop-blur-md">
              <Download className="w-4 h-4 md:w-5 md:h-5" /> Simpan
            </Button>
            <Link to="/">
              <Button variant="ghost" className="rounded-2xl h-11 md:h-14 px-4 md:px-8 text-[10px] md:text-base font-black text-white/60 hover:text-white gap-2">
                <Home className="w-4 h-4 md:w-5 md:h-5" /> Dashboard
              </Button>
            </Link>
          </motion.div>


        </div>
      ),
      bg: 'bg-[#050505]'
    }
  ] : [];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  if (!data && !loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4" /> AI Powered Experience
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Monthly Wrapped</h1>
          <p className="text-muted-foreground text-md md:text-xl font-medium max-w-md mx-auto">
            Temukan pola rahasia di balik setiap transaksi yang kamu lakukan.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-xl bg-card border border-border p-8 md:p-12 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Calendar className="w-32 h-32 rotate-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Pilih Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-secondary/50 border-2 border-border/50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const m = (i + 1).toString().padStart(2, '0');
                  const label = new Date(`2024-${m}-01`).toLocaleString('id-ID', { month: 'long' });
                  return <option key={m} value={m}>{label}</option>;
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Pilih Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-secondary/50 border-2 border-border/50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={fetchWrapped}
            className="w-full h-16 rounded-[2rem] text-sm md:text-lg font-black shadow-2xl shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-95 gap-3"
          >
            <Sparkles className="w-4 h-4 md:w-6 md:h-6" />
            Generate Wrapped
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] h-[90vh] md:h-[85vh] min-h-[600px] md:min-h-[700px] shadow-2xl bg-black border border-white/5 mx-auto max-w-4xl">
      {loading ? (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center space-y-8 p-12 text-center">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]"
          >
            <RefreshCw className="w-12 h-12 text-white animate-spin-slow" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">Menyusun Ceritamu...</h2>
            <p className="text-muted-foreground font-medium animate-pulse">AI sedang menganalisis setiap rupiah yang keluar.</p>
          </div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 p-10 text-center space-y-6">
          <div className="p-6 bg-rose-500/10 rounded-[2rem] border border-rose-500/20">
            <AlertCircle className="w-16 h-16 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">Ada Sedikit Kendala</h2>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto">{error}</p>
          </div>
          <Button onClick={() => { setError(null); setData(null); }} variant="outline" className="h-14 px-8 rounded-2xl font-black border-white/20 text-white hover:bg-white/10">
            Coba Bulan Lain
          </Button>
        </div>
      ) : (
        <>
          {/* Progress Bar - Story Style */}
          <div className="absolute top-0 left-0 right-0 z-50 flex gap-1.5 p-4 md:p-8">
            {slides.map((_, idx) => (
              <div key={idx} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  initial={{ width: idx < currentSlide ? '100%' : '0%' }}
                  animate={{ width: idx === currentSlide ? '100%' : (idx < currentSlide ? '100%' : '0%') }}
                  transition={{
                    duration: idx === currentSlide ? 8 : 0.3, // Each slide lasts 8 seconds ideally
                    ease: 'linear'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Navigation Overlay */}
          <div className="absolute inset-0 z-40 flex">
            <div className="flex-[0_0_30%] cursor-w-resize" onClick={prevSlide} />
            <div className="flex-1" />
            <div className="flex-[0_0_30%] cursor-e-resize" onClick={nextSlide} />
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-12 right-6 sm:right-8 z-[60] text-white/40 hover:text-white hover:bg-white/10 rounded-xl p-2 h-10 w-10 backdrop-blur-md border border-white/5"
            onClick={() => { setData(null); }}
          >
            <X className="w-6 h-6" />
          </Button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute inset-0 flex flex-col items-center justify-center ${slides[currentSlide].bg} overflow-hidden`}
            >
              {/* Background Ambient Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent blur-[120px] pointer-events-none"
              />

              <div className="z-10 relative w-full h-full flex flex-col items-center justify-center pt-36 sm:pt-0">
                {/* Header Title for each slide */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-24 sm:top-28 text-center px-6"
                >
                  <span className="text-white/30 font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px] mb-1 block">
                    {slides[currentSlide].subtitle}
                  </span>
                </motion.div>

                {slides[currentSlide].content}
              </div>

              {/* Navigation Hint (Hidden on small screens or very subtle) */}
              <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-12 z-50 text-white/20 font-black text-[10px] uppercase tracking-widest pointer-events-none hidden sm:flex">
                {currentSlide > 0 && <span className="flex items-center gap-2 animate-pulse"><ArrowLeft className="w-3 h-3" /> Tap Left</span>}
                {currentSlide < slides.length - 1 && <span className="flex items-center gap-2 animate-pulse">Tap Right <ArrowRight className="w-3 h-3" /></span>}
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

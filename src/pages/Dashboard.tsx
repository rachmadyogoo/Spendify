import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight, Brain, PlusCircle, X, ShoppingBag } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getTransactions } from '../services/transactionService';
import { getMe, updateProfile } from '../services/authService';
import { Link } from 'react-router-dom';
import { cn, formatCurrency } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';


export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [newIncome, setNewIncome] = useState<number | string>('');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const { data: transactions } = useQuery({ queryKey: ['transactions'], queryFn: getTransactions });

  const updateMutation = useMutation({
    mutationFn: (amount: number) => updateProfile({ uangBulanan: amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setUpdateModalOpen(false);
      setNewIncome('');
    }
  });

  const handleUpdateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIncome) {
      updateMutation.mutate(Number(newIncome));
    }
  };

  // 1. Perhitungan Statistik Dasar
  const totalExpenses = transactions?.reduce((sum, t) => sum + Number(t.jumlah), 0) || 0;
  const balance = (user?.uang_bulanan || 0) - totalExpenses;
  const transactionsCount = transactions?.length || 0;

  // 2. Olah Data untuk Chart (6 Bulan Terakhir)
  const chartData = (() => {
    if (!transactions) return [];

    // Group transactions by month (YYYY-MM)
    const grouped = transactions.reduce((acc: any, t) => {
      const date = new Date(t.tanggal);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + Number(t.jumlah);
      return acc;
    }, {});

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short' });
      months.push({
        name: label,
        total: grouped[monthKey] || 0
      });
    }
    return months;
  })();

  const stats = [
    {
      title: 'Saldo',
      value: formatCurrency(balance),
      icon: Wallet,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',

      trend: '+2.5%',
      trendUp: true,
    },
    {
      title: 'Total Pengeluaran',
      value: formatCurrency(totalExpenses),
      icon: TrendingUp,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      trend: '+12.3%',
      trendUp: false,
    },
    {
      title: 'Total Transaksi',
      value: transactionsCount.toString(),
      icon: ShoppingBag,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      trend: 'Bulan Ini',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Halo, {user?.nama || 'User'}!
          </h1>
          <p className="text-muted-foreground font-medium opacity-80">Let's Start Track Your Money!</p>
        </div>
        <Button
          onClick={() => {
            setNewIncome('');
            setUpdateModalOpen(true);
          }}
          className="rounded-2xl shadow-xl shadow-primary/20 h-12 px-6 text-base font-bold transition-transform hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Tambah Saldo
        </Button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col gap-6 group hover:border-primary/50 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="flex items-center justify-between">
              <div className={cn("p-4 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-7 h-7", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full",
                stat.trendUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{stat.title}</p>
              <h3 className="text-3xl font-black mt-2 tracking-tight group-hover:text-primary transition-colors">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-8">

        {/* Main Chart Area - Full Width */}
        <div className="p-6 sm:p-10 rounded-[2.5rem] bg-card border border-border/60 space-y-8 shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                Tren Pengeluaran Bulanan
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                Statistik aktivitas 6 bulan terakhir
              </p>
            </div>

            <div className="flex items-center gap-3 w-fit text-xs font-bold text-muted-foreground bg-secondary/40 px-5 py-3 rounded-2xl border border-border/50 backdrop-blur-md">
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_14px_hsl(var(--primary))]" />
              Total Pengeluaran per Bulan
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="70%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.12}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="rgba(255,255,255,0.06)"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#9ca3af",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={60}
                  tick={{
                    fill: "#9ca3af",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                  tickFormatter={(value) =>
                    `Rp${(value / 1000).toLocaleString()}k`
                  }
                />

                <Tooltip
                  cursor={{
                    stroke: "hsl(var(--primary))",
                    strokeWidth: 2,
                    strokeDasharray: "5 5",
                  }}
                  contentStyle={{
                    background: "rgba(10,10,10,0.85)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "22px",
                    padding: "14px 18px",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
                  }}
                  labelStyle={{
                    color: "#fff",
                    fontWeight: 800,
                    marginBottom: "6px",
                    fontSize: "14px",
                  }}
                  itemStyle={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                  formatter={(value) => [
                    `Rp${Number(value).toLocaleString("id-ID")}`,
                    "Total",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fill="url(#colorTotal)"
                  fillOpacity={1}
                  animationDuration={1800}
                  activeDot={{
                    r: 7,
                    fill: "hsl(var(--primary))",
                    stroke: "#fff",
                    strokeWidth: 3,
                  }}
                  dot={{
                    r: 4,
                    fill: "hsl(var(--primary))",
                    strokeWidth: 0,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Widgets - 50:50 Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-primary via-primary/90 to-violet-600 text-primary-foreground shadow-2xl shadow-primary/30 relative overflow-hidden group border border-white/10 flex flex-col justify-between"
          >
            <div className="absolute -top-6 -right-6 p-6 opacity-10 transition-transform duration-1000 group-hover:scale-150 group-hover:rotate-12">
              <Sparkles className="w-24 h-24 md:w-40 md:h-40" />
            </div>

            <div className="relative z-10 space-y-6 md:space-y-8 h-full flex flex-col">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-xl md:rounded-2xl backdrop-blur-xl border border-white/20">
                  <Brain className="w-5 h-5 md:w-6 md:h-6" />
                </div>

                <span className="text-xs md:text-lg font-black uppercase tracking-[0.15em] md:tracking-[0.2em] opacity-90">
                  AI Wrapped
                </span>
              </div>

              <div className="space-y-4 md:space-y-6 flex-1 flex flex-col justify-center">
                <h3 className="text-xl md:text-4xl font-black leading-snug md:leading-tight">
                  Intip vibe belanjamu bulan ini! ✨
                </h3>

                <p className="text-xs md:text-lg text-primary-foreground/80 font-medium leading-relaxed">
                  Dapatkan rangkuman gaya hidup finansialmu dalam tampilan visual yang estetik.
                </p>
              </div>

              <div className="pt-2 md:pt-4">
                <Link
                  to="/app/wrapped"
                  className="inline-flex items-center justify-center w-full py-3 md:py-5 bg-black text-primary rounded-[1.5rem] md:rounded-[2rem] text-sm md:text-lg font-black shadow-2xl hover:bg-opacity-95 transition-all active:scale-95 group"
                >
                  Buka Wrapped

                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-card border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h4 className="text-sm md:text-xl font-black flex items-center gap-2 md:gap-3">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                Transaksi Terakhir
              </h4>

              {transactions && transactions.length > 0 && (
                <Link
                  to="/app/transactions"
                  className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                >
                  Lihat Semua
                </Link>
              )}
            </div>

            <div className="space-y-4 md:space-y-6 flex-1">
              {transactions?.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between group cursor-default p-2 rounded-2xl hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xs md:text-sm font-black group-hover:scale-110 transition-transform shrink-0">
                      {t.kategori_nama.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-black group-hover:text-primary transition-colors truncate">
                        {t.deskripsi}
                      </p>

                      <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] md:tracking-widest truncate">
                        {t.kategori_nama}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs md:text-base font-black tabular-nums shrink-0 ml-3">
                    Rp{t.jumlah.toLocaleString()}
                  </span>
                </div>
              ))}

              {(!transactions || transactions.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 md:py-10 space-y-3 md:space-y-4 opacity-50">
                  <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />

                  <p className="text-xs md:text-sm font-medium italic text-center">
                    Belum ada transaksi bulan ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Monthly Income Modal */}
      <AnimatePresence>
        {isUpdateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setUpdateModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border p-10 rounded-[3rem] shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <Wallet className="w-7 h-7 text-primary" /> Tambah Saldo
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setUpdateModalOpen(false)} className="rounded-xl">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleUpdateIncome} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nominal Tambahan</label>
                  <Input
                    type="number"
                    value={newIncome}
                    onChange={(e) => setNewIncome(e.target.value)}
                    placeholder="Contoh: 500000"
                    className="h-14 text-lg font-bold rounded-2xl border-2 focus:border-primary"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground font-medium italic leading-relaxed">
                    Saldo saat ini: <span className="font-bold text-foreground">{formatCurrency(balance || 0)}</span>.
                    Input ini akan ditambahkan ke saldo utama Anda.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={() => setUpdateModalOpen(false)}>Batal</Button>
                  <Button type="submit" className="flex-1 h-12 rounded-2xl font-black shadow-lg shadow-primary/20" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Menyimpan...' : 'Tambah Sekarang'}
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

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, Zap, ShieldCheck, Star, Info, Loader2, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { getChallenges, toggleChallenge, generateChallenges, type Challenge } from '../services/challengeService';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export default function Challenges() {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data: challenges, isLoading, error } = useQuery({
    queryKey: ['challenges', selectedMonth, selectedYear],
    queryFn: () => getChallenges(selectedMonth, selectedYear),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => generateChallenges(selectedMonth, selectedYear),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', selectedMonth, selectedYear] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal men-generate tantangan. Pastikan kamu memiliki data transaksi di bulan sebelumnya.');
    }
  });

  const difficultyColors = {
    Easy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Hardcore: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  const difficultyIcons = {
    Easy: Star,
    Medium: Zap,
    Hardcore: Trophy,
  };

  const completedCount = challenges?.filter(c => c.is_completed).length || 0;
  const totalSavings = challenges?.filter(c => c.is_completed).reduce((sum, c) => sum + c.savings_pct, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">AI sedang meracik tantangan untukmu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Target className="w-4 h-4" /> Gamified Saving
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Savings Challenges</h1>
            <p className="text-muted-foreground text-sm md:text-lg font-medium max-w-2xl">
              Berdasarkan pola belanjamu bulan lalu, AI telah menyiapkan misi khusus agar kamu bisa lebih hemat bulan ini.
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px] shadow-sm"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const m = (i + 1).toString().padStart(2, '0');
                return (
                  <option key={m} value={m}>
                    {new Date(`2024-${m}-01`).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                );
              })}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-card border border-border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[100px] shadow-sm"
            >
              {['2024', '2025', '2026'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-[2.5rem] bg-card border border-border flex items-center justify-between group overflow-hidden relative"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Trophy className="w-32 h-32" />
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Misi Diselesaikan</p>
            <h3 className="text-4xl font-black">{completedCount} <span className="text-lg text-muted-foreground opacity-50">/ {challenges?.length}</span></h3>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative z-10">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground flex items-center justify-between group overflow-hidden relative shadow-2xl shadow-primary/20"
        >
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Zap className="w-32 h-32" />
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-xs font-black uppercase tracking-widest opacity-70">Potensi Hemat</p>
            <h3 className="text-4xl font-black">~{totalSavings}%</h3>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white relative z-10">
            <Target className="w-8 h-8" />
          </div>
        </motion.div>
      </div>

      {/* Challenges List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {challenges && challenges.length > 0 ? (
            challenges.map((challenge, idx) => {
              const Icon = difficultyIcons[challenge.difficulty];
              return (
                <motion.div
                  key={challenge.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-8 rounded-[2.5rem] bg-card border border-border group hover:border-primary/50 transition-all shadow-sm hover:shadow-xl relative overflow-hidden",
                    challenge.is_completed && "opacity-70 grayscale-[0.5] border-emerald-500/30"
                  )}
                >
                  {challenge.is_completed && (
                    <div className="absolute top-0 right-0 p-8 text-emerald-500 opacity-20">
                      <CheckCircle2 className="w-24 h-24" />
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-start gap-6">
                      <div className={cn(
                        "md:w-16 md:h-16 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                        challenge.is_completed ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary"
                      )}>
                        {challenge.is_completed ? <CheckCircle2 className="md:w-8 md:h-8 w-6 h-6" /> : <Icon className="w-6 h-6 md:w-8 md:h-8" />}
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            difficultyColors[challenge.difficulty]
                          )}>
                            {challenge.difficulty}
                          </span>
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Hemat ~{challenge.savings_pct}%
                          </span>
                        </div>
                        <h3 className={cn(
                          "text-md md:text-2xl font-black leading-tight",
                          challenge.is_completed && "line-through opacity-60"
                        )}>
                          {challenge.title}
                        </h3>
                      </div>
                    </div>

                    <Button
                      onClick={() => toggleMutation.mutate(challenge.id)}
                      variant={challenge.is_completed ? 'outline' : 'primary'}
                      className={cn(
                        "h-10 md:h-14 px-4 md:px-8 rounded-2xl font-black text-sm md:text-base shadow-xl transition-all",
                        challenge.is_completed ? "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5" : "shadow-primary/20"
                      )}
                      disabled={toggleMutation.isPending}
                    >
                      {challenge.is_completed ? 'Batalkan Selesai' : 'Selesaikan Misi'}
                    </Button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-20 rounded-[2.5rem] bg-secondary/20 border border-dashed border-border flex flex-col items-center justify-center text-center space-y-4"
            >
              <Target className="w-12 h-12 text-muted-foreground opacity-20" />
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-lg font-black text-muted-foreground">Tidak Ada Tantangan</p>
                  <p className="text-sm text-muted-foreground/60 font-medium">Belum ada misi yang di-generate untuk periode ini.</p>
                </div>
                <Button 
                  onClick={() => generateMutation.mutate()} 
                  disabled={generateMutation.isPending}
                  className="rounded-xl px-6 font-black gap-2"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate Tantangan AI
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="p-8 rounded-[2.5rem] bg-secondary/30 border border-border/50 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Info className="w-4 h-4" />
          <p className="text-sm font-medium italic">Tantangan diperbarui secara otomatis setiap awal bulan berdasarkan gaya belanjamu.</p>
        </div>
      </footer>
    </div>
  );
}

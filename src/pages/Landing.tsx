import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Brain, 
  Shield, 
  ArrowRight, 
  BarChart3, 
  Layers,
  Zap,
  Target
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { isAuthenticated } from '../services/authService';

export default function Landing() {
  const isAuth = isAuthenticated();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-violet-500/10 blur-[100px] rounded-full animate-pulse delay-700" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[40%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 backdrop-blur-sm bg-background/50 sticky top-0 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <img src="/logo.svg" alt="Spendify Logo" className="w-8 h-8" />
          </div>
          <span className="text-xl font-black tracking-tighter">SPENDIFY</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuth ? (
            <Link to="/app">
              <Button variant="outline" className="rounded-full font-bold">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="rounded-full font-bold">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="rounded-full font-black px-6 shadow-lg shadow-primary/20">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest opacity-80">AI-Powered Financial Tracker</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
        >
          Kelola Uang,<br />
          <span className="bg-gradient-to-r from-primary via-fuchsia-400 to-violet-500 bg-clip-text text-transparent">
            Pake Spendify.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-4xl text-muted-foreground max-w-3xl mx-auto mb-12 font-black tracking-tight"
        >
          Track. Wrap. <span className="text-primary">Level Up.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register">
            <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 group">
              Mulai Sekarang
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold backdrop-blur-md">
            Lihat Demo
          </Button>
        </motion.div>
      </section>

      {/* Features Bento Grid */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Fitur Gokil Buat Kamu</h2>
          <p className="text-muted-foreground font-medium">Gak cuma catat, tapi bener-bener ngertiin gaya hidupmu.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Main Feature */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 p-10 rounded-[3rem] bg-card border border-border overflow-hidden relative group hover:border-primary/50 transition-colors shadow-sm hover:shadow-2xl hover:shadow-primary/5"
          >
            <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:opacity-20 transition-opacity">
              <Brain className="w-80 h-80 text-primary" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
              <div className="p-4 bg-primary/10 rounded-2xl w-fit">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-4">AI Financial Advisor</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                  Dapatkan saran keuangan yang personal dari AI. Mulai dari tips nabung sampe peringatan kalo jajanmu udah over-budget.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Spotify Wrapped Style */}
          <motion.div 
            variants={itemVariants}
            className="p-10 rounded-[3rem] bg-gradient-to-br from-primary to-violet-500 text-primary-foreground overflow-hidden relative group shadow-2xl shadow-primary/20"
          >
            <div className="absolute -right-10 -top-10 opacity-20 rotate-12 group-hover:scale-110 transition-transform duration-700">
              <Sparkles className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="p-3 bg-white/20 rounded-xl w-fit backdrop-blur-md">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Monthly Wrapped</h3>
                <p className="text-white/80 text-sm font-medium">
                  Rangkuman gaya belanja bulananmu yang dikemas estetik. Siap share ke Story!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Real-time Tracking */}
          <motion.div 
            variants={itemVariants}
            className="p-10 rounded-[3rem] bg-card border border-border group hover:border-primary/50 transition-colors"
          >
            <div className="p-4 bg-purple-500/10 rounded-2xl w-fit mb-8">
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-2xl font-black mb-4">Gercep & Intuitive</h3>
            <p className="text-muted-foreground font-medium">
              Input transaksi secepat kilat. UI yang clean bikin kamu gak males buat catat pengeluaran.
            </p>
          </motion.div>

          {/* Gamification / Challenges */}
          <motion.div 
            variants={itemVariants}
            className="p-10 rounded-[3rem] bg-card border border-border group hover:border-primary/50 transition-colors relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Target className="w-40 h-40 text-primary" />
            </div>
            <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-8">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-black mb-4">Savings Challenges</h3>
            <p className="text-muted-foreground font-medium relative z-10">
              Gamifikasi menabung! Selesaikan misi dari AI berdasarkan kebiasaan belanjamu dan hemat hingga 30% tiap bulan.
            </p>
          </motion.div>

          {/* Analytics */}
          <motion.div 
            variants={itemVariants}
            className="p-10 rounded-[3rem] bg-card border border-border group hover:border-primary/50 transition-colors"
          >
            <div className="p-4 bg-amber-500/10 rounded-2xl w-fit mb-8">
              <BarChart3 className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black mb-4">Visual Insight</h3>
            <p className="text-muted-foreground font-medium">
              Grafik interaktif yang bikin kamu paham kemana aja larinya uangmu setiap bulan.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto p-12 md:p-20 rounded-[4rem] bg-primary text-primary-foreground text-center relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <TrendingUp className="w-64 h-64" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">Siap Atur Keuanganmu?</h2>
          <p className="text-lg md:text-xl opacity-90 mb-12 max-w-2xl mx-auto font-medium relative z-10">
            Gabung bareng ribuan orang lainnya yang udah upgrade gaya hidup finansialnya.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link to="/register">
              <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-black bg-black text-primary hover:bg-black/90 shadow-2xl">
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-6 border-t border-border mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-2 group">
              <div className="p-1 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <img src="/logo.svg" alt="Spendify Logo" className="w-6 h-6" />
              </div>
              <span className="text-lg font-black tracking-tighter">SPENDIFY</span>
            </Link>
            <p className="text-muted-foreground text-sm font-medium">
              &copy; 2026 Spendify Team. Built for the future of finance.
            </p>
          </div>
          
          <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

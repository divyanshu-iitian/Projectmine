import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CinematicHero } from '../three/CinematicHero';
import { ArrowRight, Zap, Shield, Truck, TrendingUp, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 0.1,
        y: (e.clientY / window.innerHeight - 0.5) * 0.1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      {/* Cinematic 3D Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Scene */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <CinematicHero 
            mouseX={mousePosition.x}
            mouseY={mousePosition.y}
            scrollProgress={scrollYProgress.get()}
          />
        </motion.div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0F]/20 to-[#0B0B0F] pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-block mb-6 px-4 py-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-sm text-[#d4af37]"
            >
              Premium Shopping Experience
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="text-white">Shop</span>
              <br />
              <span className="gradient-text">Your Way</span>
            </h1>

            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
              Fast, secure, and seamless shopping experience.
              <br className="hidden md:block" />
              Real-time inventory with instant checkout.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="group px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0a0a0f] rounded-xl font-semibold text-base hover:shadow-2xl hover:shadow-[#d4af37]/30 transition-all duration-300 flex items-center gap-2"
              >
                Explore Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#platform"
                className="px-8 py-4 glass text-white rounded-xl font-semibold text-base hover:bg-white/5 transition-all duration-300"
              >
                See Platform
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-[#d4af37]/30 rounded-full flex justify-center p-2">
            <motion.div 
              className="w-1 h-2 bg-[#d4af37] rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            ></motion.div>
          </div>
        </motion.div>
      </section>

      {/* Platform Features - Depth-based */}
      <section id="platform" className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Why Choose <span className="gradient-text">DivyaLuxe</span>
            </h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Fast, secure, and reliable shopping platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <PremiumFeatureCard
              icon={<Zap className="w-10 h-10" />}
              title="Lightning Fast"
              description="Redis-powered caching and optimized microservices deliver sub-100ms response times"
              delay={0}
            />
            <PremiumFeatureCard
              icon={<Shield className="w-10 h-10" />}
              title="Bank-Grade Security"
              description="JWT authentication, Stripe payments, and end-to-end encryption protect every transaction"
              delay={0.1}
            />
            <PremiumFeatureCard
              icon={<Truck className="w-10 h-10" />}
              title="Real-Time Inventory"
              description="Atomic operations with Redis ensure accurate stock levels and prevent overselling"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4af37]/5 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <MetricCard number="99.9%" label="Uptime" />
            <MetricCard number="<100ms" label="API Response" />
            <MetricCard number="5" label="Microservices" />
            <MetricCard number="100%" label="Secure" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative p-12 rounded-3xl glass premium-glow">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl text-muted mb-10">
              Discover amazing products at great prices
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#0a0a0f] rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all duration-300"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted text-sm">
            © 2026 DivyaLuxe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PremiumFeatureCard({ icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="group relative p-8 rounded-2xl glass hover:bg-white/5 transition-all duration-500"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#d4af37]/0 to-[#b8860b]/0 group-hover:from-[#d4af37]/5 group-hover:to-[#b8860b]/5 transition-all duration-500"></div>
      
      <div className="relative z-10">
        <div className="mb-6 text-[#d4af37] group-hover:text-[#ffd700] transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4 text-white">
          {title}
        </h3>
        <p className="text-muted leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function MetricCard({ number, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
        {number}
      </div>
      <div className="text-muted text-sm uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

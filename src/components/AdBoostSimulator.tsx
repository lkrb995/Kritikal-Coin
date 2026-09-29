import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Volume2, ShieldCheck, RefreshCw, X } from 'lucide-react';

interface AdBoostSimulatorProps {
  onClose: () => void;
  onAdComplete: () => void;
  purpose?: 'mining' | 'boost' | 'roulette' | 'general' | null;
}

const CYBER_ADS = [
  {
    brand: 'NEURAL-LINK CORE',
    slogan: '¡Descarga RAM directamente a tu cerebro!',
    desc: 'Versión 4.2 ya disponible. Optimiza tus sueños y duplica tu productividad nocturna. Libre de virus (mayoritariamente).',
    buttonText: 'COMPRAR CHIP INTEGRADO',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
  },
  {
    brand: 'ASTRO-MINING MARS',
    slogan: 'Adquiere tu lote mineral en el Cráter Gale',
    desc: 'Rentabilidad asegurada en extracción de Litio-7. Desde 49,999 Créditos Federales. Oxígeno no incluido en el precio base.',
    buttonText: 'VER CATÁLOGO MARCIANO',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=500&q=80',
  },
  {
    brand: 'CYBER-BODY IMPLANTS',
    slogan: 'Reemplaza tus ojos biológicos por sensores láser',
    desc: 'Visión nocturna integrada, sensor térmico de calor y HUD financiero en tiempo real. 100% de garantía contra parpadeos involuntarios.',
    buttonText: 'RESERVAR OPERACIÓN',
    image: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=500&q=80',
  },
];

export default function AdBoostSimulator({ onClose, onAdComplete, purpose = 'general' }: AdBoostSimulatorProps) {
  const [adIndex, setAdIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Select random ad
    const randIdx = Math.floor(Math.random() * CYBER_ADS.length);
    setAdIndex(randIdx);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeAd = CYBER_ADS[adIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-cyber-dark border border-brand-cyan rounded-sm overflow-hidden shadow-[0_0_40px_rgba(0,212,255,0.3)] flex flex-col relative">
        
        {/* Ad Badge Header */}
        <div className="bg-cyber-black border-b border-brand-cyan/20 px-4 py-2.5 flex justify-between items-center">
          <span className="text-[10px] font-mono tracking-widest text-brand-cyan font-bold animate-pulse flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            HOLOGRÁFICA PROPAGANDA DE RED
          </span>
          {isFinished ? (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-brand-cyan transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs font-mono font-semibold text-slate-400">
              Cerrar en {timeLeft}s
            </span>
          )}
        </div>

        {/* Commercial video/image frame */}
        <div className="relative h-48 bg-black overflow-hidden flex items-center justify-center">
          <img
            src={activeAd.image}
            alt={activeAd.brand}
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
            referrerPolicy="no-referrer"
          />
          {/* Glitch Overlay Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]"></div>
          
          <div className="absolute bottom-4 left-4 right-4 text-left">
            <span className="text-[9px] font-mono font-bold bg-brand-cyan text-cyber-black px-2 py-0.5 rounded-sm">
              {activeAd.brand}
            </span>
            <h3 className="text-base font-bold text-slate-100 font-sans tracking-wide mt-1.5 drop-shadow">
              {activeAd.slogan}
            </h3>
          </div>
        </div>

        {/* Description & Interactive cyber buttons */}
        <div className="p-5 flex flex-col gap-4 text-left">
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            {activeAd.desc}
          </p>

          <button
            disabled
            className="w-full bg-cyber-black border border-brand-cyan/10 text-slate-500 font-mono text-[10px] py-2 rounded-sm cursor-not-allowed text-center uppercase"
          >
            {activeAd.buttonText}
          </button>

          {/* Success screen once completed */}
          <AnimatePresence>
            {isFinished && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-brand-cyan/5 border border-brand-cyan/30 p-4 rounded-sm flex flex-col gap-3 items-center text-center mt-2"
              >
                <div className="p-2 rounded-full bg-brand-cyan text-cyber-black shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono text-brand-cyan">¡TRANSMISIÓN VERIFICADA!</h4>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {purpose === 'mining' && (
                      <p>Se ha habilitado la activación de tu <span className="text-brand-cyan font-bold">Rig de Minería Kritical por 3 horas</span>.</p>
                    )}
                    {purpose === 'boost' && (
                      <p>Recibes <span className="text-brand-cyan font-bold">+50% de Multiplicador de Hashrate</span> por 1 hora.</p>
                    )}
                    {purpose === 'roulette' && (
                      <p>Se ha liberado <span className="text-brand-cyan font-bold">1 Giro Gratuito</span> en la Ruleta Kritical.</p>
                    )}
                    {purpose === 'general' && (
                      <p>Recibes <span className="text-brand-cyan font-bold">2x de Hashrate Boost</span> durante 4 horas.</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onAdComplete}
                  className="w-full bg-brand-cyan hover:bg-[#00e1ff] text-cyber-black font-bold font-sans text-xs py-2 rounded-sm transition-all shadow-[0_0_10px_rgba(0,212,255,0.2)] cursor-pointer uppercase tracking-wider font-mono"
                >
                  {purpose === 'mining' && "Activar Rig (3hs)"}
                  {purpose === 'boost' && "Reclamar +50% Boost"}
                  {purpose === 'roulette' && "Girar la Ruleta"}
                  {purpose === 'general' && "Reclamar 2x Boost"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

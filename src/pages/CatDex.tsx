/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Search, Lock, Info } from 'lucide-react';
import { useApp } from '../store/AppContext';
import MobileLayout from '../components/layout/MobileLayout';

const CatDex: React.FC = () => {
  const { dex, isLoading } = useApp();

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-4 border-[#99452c] border-t-transparent rounded-full"
          />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <header className="px-6 py-8 flex justify-between items-center">
        <div>
          <h1 className="font-headline font-bold text-[#99452c] dark:text-[#e27d60] text-2xl tracking-tight">猫咪图鉴</h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">发现你邻里间所有的猫咪朋友</p>
        </div>
        <button className="p-2 rounded-full text-[#99452c] dark:text-[#e27d60] hover:bg-white/50 dark:hover:bg-stone-900 transition-colors">
          <Search size={20} />
        </button>
      </header>

      <div className="px-6 grid grid-cols-2 gap-4 pb-8">
        {dex.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative rounded-3xl overflow-hidden aspect-[4/5] shadow-sm border border-stone-100 dark:border-stone-800 ${
              entry.isDiscovered ? 'bg-white dark:bg-stone-900' : 'bg-stone-100 dark:bg-stone-900/50'
            }`}
          >
            {entry.isDiscovered ? (
              <>
                <img 
                  src={entry.photoUrl} 
                  alt={entry.breed}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{entry.rarity}</p>
                  <h3 className="font-headline font-bold text-lg leading-none">{entry.breed}</h3>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white">
                    <Info size={14} />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-stone-200 dark:bg-stone-800 w-12 h-12 rounded-full flex items-center justify-center text-stone-400 dark:text-stone-600 mb-3">
                  <Lock size={20} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-600 mb-1">尚未发现</p>
                <h3 className="font-headline font-bold text-stone-400 dark:text-stone-600">???</h3>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </MobileLayout>
  );
};

export default CatDex;

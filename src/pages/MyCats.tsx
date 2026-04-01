/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Heart, Search, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import MobileLayout from '../components/layout/MobileLayout';

const MyCats: React.FC = () => {
  const { myCats, isLoading } = useApp();

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
          <h1 className="font-headline font-bold text-[#99452c] dark:text-[#e27d60] text-2xl tracking-tight">我的猫</h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">你的猫咪朋友和它们的故事</p>
        </div>
        <button className="p-2 rounded-full text-[#99452c] dark:text-[#e27d60] hover:bg-white/50 dark:hover:bg-stone-900 transition-colors">
          <Search size={20} />
        </button>
      </header>

      <div className="px-6 space-y-6 pb-8">
        {myCats.length > 0 ? (
          myCats.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-[0px_4px_20px_rgba(153,69,44,0.03)] border border-stone-100 dark:border-stone-800 flex items-center gap-5 active:scale-[0.98] transition-all"
            >
              <div className="shrink-0">
                <img 
                  src={cat.photoUrl} 
                  alt={cat.nickname}
                  className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-4 ring-stone-50 dark:ring-stone-800"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-headline text-xl font-bold text-[#1c1c18] dark:text-stone-100 truncate">{cat.nickname}</h3>
                  <div className="flex items-center gap-1 bg-[#ffdbd1] dark:bg-[#3b0900] px-2 py-1 rounded-lg text-[#99452c] dark:text-[#ffb5a0]">
                    <Heart size={12} fill="currentColor" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">等级 {cat.intimacyLevel}</span>
                  </div>
                </div>
                <p className="text-stone-500 dark:text-stone-400 text-xs mb-3">
                  {cat.breed} • {cat.encounterCount} 次邂逅
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.personalityTags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight size={20} className="text-stone-300 dark:text-stone-700" />
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="w-24 h-24 border-2 border-dashed border-stone-400 rounded-full flex items-center justify-center mb-4">
              <Heart size={40} />
            </div>
            <p className="font-body text-sm italic">你还没有结交任何猫咪朋友...</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MyCats;

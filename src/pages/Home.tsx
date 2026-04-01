/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, PartyPopper, Quote } from 'lucide-react';
import { useApp } from '../store/AppContext';
import CatCard from '../components/ui/CatCard';
import MobileLayout from '../components/layout/MobileLayout';

const Home: React.FC = () => {
  const { encounters, dex, isLoading } = useApp();

  const discoveredCount = dex.filter(d => d.isDiscovered).length;
  const todayEncounters = encounters.filter(e => {
    const today = new Date().toISOString().split('T')[0];
    return e.timestamp.startsWith(today);
  }).length;

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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 ring-2 ring-[#99452c]/10">
            <img 
              src="https://picsum.photos/seed/user/200/200" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest leading-none mb-1">早上好</p>
            <h1 className="font-headline font-bold text-[#99452c] dark:text-[#e27d60] text-2xl tracking-tight">猫咪日志</h1>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-8">
        {/* Stats Bento Grid */}
        <section className="grid grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-stone-900 p-5 rounded-3xl shadow-[0px_4px_20px_rgba(153,69,44,0.03)] flex flex-col justify-between h-36 border border-stone-100 dark:border-stone-800"
          >
            <div className="bg-[#ffdbd1] dark:bg-[#3b0900] w-10 h-10 rounded-xl flex items-center justify-center text-[#99452c] dark:text-[#ffb5a0]">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-3xl font-bold font-headline text-[#1c1c18] dark:text-stone-100">{discoveredCount}</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">已发现的朋友</p>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-[#e27d60] p-5 rounded-3xl flex flex-col justify-between h-36 shadow-[0px_8px_24px_rgba(226,125,96,0.15)]"
          >
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center text-white">
              <PartyPopper size={20} />
            </div>
            <div className="text-white">
              <p className="text-3xl font-bold font-headline">{todayEncounters}</p>
              <p className="text-[10px] opacity-90 font-bold uppercase tracking-wider">今日新邂逅</p>
            </div>
          </motion.div>
        </section>

        {/* Discovery Feed Header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-2xl font-bold text-[#1c1c18] dark:text-stone-100">最近邂逅</h2>
            <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">捕捉街角温柔的瞬间</p>
          </div>
          <button className="text-[#99452c] dark:text-[#e27d60] text-xs font-bold uppercase tracking-widest hover:underline">查看全部</button>
        </div>

        {/* Feed */}
        <div className="space-y-8 pb-8">
          {encounters.length > 0 ? (
            encounters.slice(0, 3).map((encounter, index) => (
              <motion.div
                key={encounter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CatCard encounter={encounter} />
              </motion.div>
            ))
          ) : (
            <div className="bg-stone-100 dark:bg-stone-900/50 rounded-3xl p-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-800">
              <p className="text-stone-400 dark:text-stone-600 font-medium italic">还没有邂逅。是时候出去走走了！</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Home;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, Filter } from 'lucide-react';
import { useApp } from '../store/AppContext';
import MobileLayout from '../components/layout/MobileLayout';
import { format } from 'date-fns';

const Timeline: React.FC = () => {
  const { encounters, isLoading } = useApp();

  // Group encounters by month
  const groupedEncounters = encounters.reduce((acc, encounter) => {
    const month = format(new Date(encounter.timestamp), 'yyyy年MM月');
    if (!acc[month]) acc[month] = [];
    acc[month].push(encounter);
    return acc;
  }, {} as Record<string, typeof encounters>);

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
      <header className="fixed top-0 w-full max-w-md z-50 bg-[#fdf9f3]/85 dark:bg-stone-950/85 backdrop-blur-3xl flex items-center justify-between px-6 py-4">
        <h1 className="font-headline text-lg font-bold tracking-tight text-[#99452c] dark:text-[#e27d60]">时光</h1>
        <button className="text-[#99452c] dark:text-[#e27d60] hover:bg-white/50 dark:hover:bg-stone-900 transition-colors p-2 rounded-full">
          <Filter size={20} />
        </button>
      </header>

      <div className="pt-24 px-6 pb-8">
        {Object.keys(groupedEncounters).length > 0 ? (
          (Object.entries(groupedEncounters) as [string, typeof encounters][]).map(([month, monthEncounters], monthIndex) => (
            <div key={month} className="mb-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="font-headline text-3xl font-black text-[#1c1c18] dark:text-stone-100 tracking-tight">{month}</h2>
                <p className="font-body text-stone-500 dark:text-stone-400 text-xs mt-1 uppercase tracking-widest font-bold">
                  记录了 {monthEncounters.length} 个瞬间
                </p>
              </motion.div>

              <div className="relative space-y-10 before:content-[''] before:absolute before:left-5 before:top-0 before:bottom-0 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800 before:opacity-50">
                {monthEncounters.map((encounter, index) => (
                  <motion.div 
                    key={encounter.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-12 group"
                  >
                    <div className="absolute left-[1.1rem] top-3 w-3 h-3 rounded-full bg-[#99452c] ring-4 ring-[#fdf9f3] dark:ring-stone-950 z-10" />
                    
                    <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-[0px_4px_20px_rgba(153,69,44,0.03)] border border-stone-100 dark:border-stone-800 active:scale-[0.98] transition-all">
                      <div className="flex gap-4">
                        <div className="shrink-0">
                          <img 
                            src={encounter.photoUrl} 
                            alt={encounter.nickname}
                            className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-4 ring-stone-50 dark:ring-stone-800"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-headline text-lg font-bold text-[#1c1c18] dark:text-stone-100 truncate">{encounter.nickname}</h3>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter shrink-0">
                              {format(new Date(encounter.timestamp), 'h:mm a')}
                            </span>
                          </div>
                          <p className="font-serif text-stone-600 dark:text-stone-400 text-xs leading-relaxed line-clamp-2 mb-3">
                            {encounter.notes}
                          </p>
                          <div className="flex items-center gap-1.5 text-[#99452c] dark:text-[#e27d60]">
                            <MapPin size={12} />
                            <span className="font-body text-[10px] font-bold uppercase tracking-wider">{encounter.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="w-24 h-24 border-2 border-dashed border-stone-400 rounded-full flex items-center justify-center mb-4">
              <Clock size={40} />
            </div>
            <p className="font-body text-sm italic">继续探索，填满你的日志...</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Timeline;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, MapPin, Calendar, Clock, Info } from 'lucide-react';
import { useApp } from '../store/AppContext';
import MobileLayout from '../components/layout/MobileLayout';

const CatDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { myCats, encounters } = useApp();

  const cat = myCats.find(c => c.id === id);
  const catEncounters = encounters.filter(e => e.catId === id || e.nickname === cat?.nickname);

  if (!cat) {
    return (
      <MobileLayout>
        <div className="p-6 text-center">
          <p>找不到猫咪。</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#99452c]">返回</button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      <header className="fixed top-0 w-full max-w-md z-50 flex items-center justify-between px-6 py-4 bg-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-headline font-bold text-white text-lg drop-shadow-md">猫咪档案</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="relative h-96 w-full overflow-hidden">
        <img 
          src={cat.photoUrl} 
          alt={cat.nickname}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdf9f3] via-transparent to-black/30" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {cat.personalityTags.map(tag => (
              <span key={tag} className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="font-headline font-black text-4xl text-[#1c1c18] tracking-tight">{cat.nickname}</h2>
          <p className="font-body text-stone-600 italic mt-1">{cat.breed}</p>
        </div>
      </div>

      <div className="px-6 py-8 space-y-10">
        {/* Intimacy Level */}
        <section className="bg-white dark:bg-stone-900 p-8 rounded-3xl flex flex-col items-center text-center shadow-[0px_12px_32px_rgba(153,69,44,0.06)]">
          <div className="w-24 h-24 relative mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-stone-100 dark:text-stone-800" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
              <circle 
                className="text-[#e27d60]" 
                cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" 
                strokeWidth="8" strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * cat.intimacyLevel / 5)} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart size={32} className="text-[#99452c]" fill="currentColor" />
            </div>
          </div>
          <h3 className="font-headline font-bold text-xl text-[#1c1c18] dark:text-stone-100">亲密伙伴</h3>
          <p className="font-label text-stone-500 text-xs mt-1 uppercase tracking-widest">等级 {cat.intimacyLevel} / 5</p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
            <Calendar size={20} className="text-[#99452c] mb-2" />
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">首次见面</p>
            <p className="font-headline font-bold text-lg text-[#1c1c18] dark:text-stone-100">{cat.firstEncounterDate}</p>
          </div>
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
            <Clock size={20} className="text-[#99452c] mb-2" />
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">邂逅次数</p>
            <p className="font-headline font-bold text-lg text-[#1c1c18] dark:text-stone-100">{cat.encounterCount} 次</p>
          </div>
        </section>

        {/* Favorite Spot */}
        <section className="bg-[#ffdbd1] dark:bg-[#3b0900] p-6 rounded-3xl flex items-center gap-4">
          <div className="bg-white/50 dark:bg-white/10 p-3 rounded-2xl text-[#99452c] dark:text-[#ffb5a0]">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#99452c] dark:text-[#ffb5a0] uppercase tracking-widest">最爱出没地</p>
            <p className="font-headline font-bold text-xl text-[#3b0900] dark:text-white">{cat.favoriteSpot}</p>
          </div>
        </section>

        {/* Recent History */}
        <section>
          <h3 className="font-headline font-bold text-2xl text-[#1c1c18] dark:text-stone-100 mb-6">最近邂逅</h3>
          <div className="space-y-6">
            {catEncounters.map((encounter, index) => (
              <motion.div 
                key={encounter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                  <img src={encounter.photoUrl} alt="Encounter" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 border-b border-stone-100 dark:border-stone-800 pb-4">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                    {new Date(encounter.timestamp).toLocaleDateString()}
                  </p>
                  <p className="font-serif text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {encounter.notes}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </MobileLayout>
  );
};

export default CatDetail;

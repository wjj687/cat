/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Clock, Heart } from 'lucide-react';
import { Encounter } from '../../types/domain';
import { formatDistanceToNow } from 'date-fns';

interface CatCardProps {
  encounter: Encounter;
  onClick?: () => void;
}

const CatCard: React.FC<CatCardProps> = ({ encounter, onClick }) => {
  return (
    <article 
      onClick={onClick}
      className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-[0px_4px_20px_rgba(153,69,44,0.03)] border border-stone-100 dark:border-stone-800 group active:scale-[0.98] transition-all"
    >
      <div className="relative h-64 w-full overflow-hidden">
        <img 
          src={encounter.photoUrl} 
          alt={encounter.nickname}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#99452c] dark:text-[#e27d60] shadow-sm uppercase tracking-wider">
            {encounter.breed}
          </span>
          <span className="bg-[#99452c]/90 dark:bg-[#e27d60]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1 uppercase tracking-wider">
            <Heart size={10} fill="currentColor" />
            {encounter.personality}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-headline text-xl font-bold text-[#1c1c18] dark:text-stone-100">{encounter.nickname}</h3>
            <div className="flex items-center text-stone-500 dark:text-stone-400 gap-1 mt-0.5">
              <MapPin size={14} />
              <span className="text-xs font-medium">{encounter.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg text-stone-500 dark:text-stone-400">
            <Clock size={12} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {formatDistanceToNow(new Date(encounter.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
        <p className="font-serif text-stone-600 dark:text-stone-400 text-sm leading-relaxed line-clamp-2">
          {encounter.notes}
        </p>
      </div>
    </article>
  );
};

export default CatCard;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Sparkles, MapPin, Sun, Cloud, CloudRain, Thermometer, Save, Heart, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useApp } from '../store/AppContext';
import MobileLayout from '../components/layout/MobileLayout';
import { Encounter, CatBreed } from '../types/domain';

type Step = 'UPLOAD' | 'RECOGNIZING' | 'RESULT' | 'EDITOR';

const Capture: React.FC = () => {
  const navigate = useNavigate();
  const { addEncounter } = useApp();
  const [step, setStep] = useState<Step>('UPLOAD');
  const [photo, setPhoto] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<{ breed: string; confidence: number; message: string } | null>(null);
  
  // Form state
  const [nickname, setNickname] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [personality, setPersonality] = useState('活泼');
  const [weather, setWeather] = useState<'晴朗' | '多云' | '下雨' | '寒冷'>('晴朗');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        startRecognition();
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecognition = async () => {
    setStep('RECOGNIZING');
    const result = await apiService.recognizeCat('photo_data');
    setRecognition(result);
    setStep('RESULT');
  };

  const handleSave = async () => {
    if (!photo) return;
    
    const newEncounter: Encounter = {
      id: `e${Date.now()}`,
      nickname: nickname || '未知的猫咪朋友',
      breed: (recognition?.breed as CatBreed) || '未知品种',
      location: location || '宁静的某处',
      notes: notes || '一次温柔的邂逅。',
      personality,
      timestamp: new Date().toISOString(),
      photoUrl: photo,
      weather,
    };

    addEncounter(newEncounter);
    navigate('/');
  };

  return (
    <MobileLayout showNav={step === 'UPLOAD'}>
      <AnimatePresence mode="wait">
        {step === 'UPLOAD' && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[80vh] px-6"
          >
            <div className="w-full max-w-xs aspect-square rounded-3xl border-2 border-dashed border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
              <div className="bg-[#ffdbd1] dark:bg-[#3b0900] w-20 h-20 rounded-full flex items-center justify-center text-[#99452c] dark:text-[#ffb5a0] mb-4 group-hover:scale-110 transition-transform">
                <Camera size={40} />
              </div>
              <h2 className="font-headline font-bold text-xl text-[#1c1c18] dark:text-stone-100 mb-2">捕捉瞬间</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm">拍一张你新猫咪朋友的照片</p>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="mt-8 text-stone-400 dark:text-stone-600 font-bold uppercase tracking-widest text-xs hover:text-[#99452c] transition-colors"
            >
              取消
            </button>
          </motion.div>
        )}

        {step === 'RECOGNIZING' && (
          <motion.div 
            key="recognizing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
          >
            <div className="relative w-48 h-48 mb-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-4 border-[#99452c] border-t-transparent rounded-full opacity-20"
              />
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-4 bg-[#ffdbd1] dark:bg-[#3b0900] rounded-full flex items-center justify-center text-[#99452c] dark:text-[#ffb5a0]"
              >
                <Sparkles size={48} />
              </motion.div>
            </div>
            <h2 className="font-headline font-bold text-2xl text-[#1c1c18] dark:text-stone-100 mb-2">识别中...</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm">正在查阅猫咪档案</p>
          </motion.div>
        )}

        {step === 'RESULT' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-6 pt-12 pb-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-headline font-bold text-2xl text-[#1c1c18] dark:text-stone-100">识别结果</h2>
              <button onClick={() => setStep('UPLOAD')} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-end gap-6 mb-8">
              <div className="w-2/3 aspect-[4/5] rounded-3xl overflow-hidden shadow-lg bg-stone-200 dark:bg-stone-800 transform rotate-1">
                <img src={photo!} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 pb-4">
                <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
                  <Sparkles size={32} className="text-[#e27d60] mb-2" />
                  <p className="font-serif text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {recognition?.message}
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep('EDITOR')}
              className="w-full bg-gradient-to-br from-[#99452c] to-[#e27d60] text-white font-headline font-bold py-5 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
            >
              继续记录日志
            </button>
          </motion.div>
        )}

        {step === 'EDITOR' && (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="px-6 pt-12 pb-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-headline font-bold text-2xl text-[#1c1c18] dark:text-stone-100">日志条目</h2>
              <button onClick={() => setStep('RESULT')} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-headline font-bold text-sm text-stone-500 dark:text-stone-400 ml-2 uppercase tracking-widest">昵称</label>
                <input 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#99452c]/20 transition-all placeholder:text-stone-300 dark:placeholder:text-stone-700 text-lg shadow-sm" 
                  placeholder="例如：午后的守护者" 
                  type="text"
                />
              </div>

              <div className="space-y-3">
                <label className="font-headline font-bold text-sm text-stone-500 dark:text-stone-400 ml-2 uppercase tracking-widest">性格</label>
                <div className="flex flex-wrap gap-2">
                  {['活泼', '想睡', '高冷', '好奇'].map(p => (
                    <button 
                      key={p}
                      onClick={() => setPersonality(p)}
                      className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                        personality === p 
                          ? 'bg-[#99452c] text-white shadow-md' 
                          : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-stone-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-headline font-bold text-sm text-stone-500 dark:text-stone-400 ml-2 uppercase tracking-widest">地点</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border-none rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-[#99452c]/20 transition-all shadow-sm" 
                    placeholder="你在哪里见到的？" 
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-headline font-bold text-sm text-stone-500 dark:text-stone-400 ml-2 uppercase tracking-widest">天气</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: '晴朗', icon: Sun },
                    { id: '多云', icon: Cloud },
                    { id: '下雨', icon: CloudRain },
                    { id: '寒冷', icon: Thermometer },
                  ].map(w => (
                    <button 
                      key={w.id}
                      onClick={() => setWeather(w.id as any)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                        weather === w.id 
                          ? 'bg-[#ffdbd1] dark:bg-[#3b0900] text-[#99452c] dark:text-[#ffb5a0] ring-2 ring-[#99452c] shadow-sm' 
                          : 'bg-white dark:bg-stone-900 text-stone-400 border border-stone-100 dark:border-stone-800'
                      }`}
                    >
                      <w.icon size={20} />
                      <span className="text-[8px] font-black uppercase tracking-widest mt-2">{w.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-headline font-bold text-sm text-stone-500 dark:text-stone-400 ml-2 uppercase tracking-widest">笔记</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#99452c]/20 transition-all placeholder:text-stone-300 dark:placeholder:text-stone-700 shadow-sm font-serif" 
                  placeholder="描述这次邂逅... (例如：当我坐下时它发出了呼噜声)" 
                  rows={4}
                />
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSave}
                  className="w-full bg-gradient-to-br from-[#99452c] to-[#e27d60] text-white font-headline font-bold py-5 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
                >
                  <Save size={20} />
                  保存到我的猫
                </button>
                <p className="text-center text-stone-400 text-[10px] mt-4 font-bold uppercase tracking-widest opacity-60">
                  此条目将被添加到你的时光轴和图鉴中
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
};

export default Capture;

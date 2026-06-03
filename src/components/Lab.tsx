/**
 * Lab Component - Enhanced with Bilingual Support and Spiritual-Tech Design
 * Full i18n integration with Arabic/English support and glassmorphism UI
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../i18n/config';

interface SurahInfo {
  name: string;
  number: number;
  arabicName: string;
  englishName: string;
  totalVerses: number;
  revelation: 'Meccan' | 'Medinan';
}

interface DailyTarget {
  day: number;
  date: string;
  sabaq: {
    surah: number;
    startVerse: number;
    endVerse: number;
  };
  manzil: Array<{
    surah: number;
    startVerse: number;
    endVerse: number;
  }>;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
}

interface MemorizationPlan {
  id: string;
  userId: string;
  planName: string;
  targetSurah: SurahInfo;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalVerses: number;
  dailyTargets: DailyTarget[];
  status: string;
}

export const Lab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(18);
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(110);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MemorizationPlan | null>(null);
  const [error, setError] = useState<string>('');

  // Fetch Surahs on mount
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await axios.get('/api/surahs');
        setSurahs(response.data.surahs);
      } catch (err) {
        console.error('Error fetching Surahs:', err);
        setError(t('errors.failedToLoad'));
      }
    };
    fetchSurahs();
  }, [t]);

  // Update ayah limits when surah changes
  useEffect(() => {
    const currentSurah = surahs.find((s) => s.number === selectedSurah);
    if (currentSurah) {
      setStartAyah(1);
      setEndAyah(currentSurah.totalVerses);
    }
  }, [selectedSurah, surahs]);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError('');
    setPlan(null);

    try {
      if (endAyah < startAyah) {
        throw new Error(t('errors.endLessThanStart'));
      }
      if (days < 1 || days > 365) {
        throw new Error(t('errors.invalidDays'));
      }

      // Generate readable plan name with translations
      const currentSurah = surahs.find((s) => s.number === selectedSurah);
      const surahName = i18n.language === 'ar' ? currentSurah?.arabicName : currentSurah?.englishName;
      const versesText = t('plan.titleVerses')
        .replace('{start}', startAyah.toString())
        .replace('{end}', endAyah.toString());
      const daysText = t('plan.titleDays').replace('{days}', days.toString());
      const planName = `${t('plan.titleFormat').replace('{surah}', surahName || '')} - ${versesText} - ${daysText}`;

      const response = await axios.post('/api/generate-plan', {
        userId: `user_${Date.now()}`,
        surahNumber: selectedSurah,
        startVerse: startAyah,
        endVerse: endAyah,
        durationDays: days,
        planName: planName,
      });

      setPlan(response.data.plan);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || t('errors.failedToGenerate'));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currentSurah = surahs.find((s) => s.number === selectedSurah);
  const totalVerses = currentSurah ? currentSurah.totalVerses : 0;
  const isArabic = i18n.language === 'ar';

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isArabic ? 'rtl' : 'ltr'
      }`}
      style={{
        direction: isArabic ? 'rtl' : 'ltr',
        background: `
          linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%,
          rgba(6, 182, 212, 0.1) 25%,
          rgba(15, 23, 42, 0.3) 50%,
          rgba(6, 182, 212, 0.1) 75%,
          rgba(16, 185, 129, 0.1) 100%),
          radial-gradient(at 20% 50%, rgba(34, 197, 94, 0.15) 0px,
          transparent 50%),
          radial-gradient(at 80% 80%, rgba(6, 182, 212, 0.15) 0px,
          transparent 50%),
          linear-gradient(to bottom, #0f172a, #1a1a2e)
        `,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-2">
          <h1 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
            🕋 {t('app.title')}
          </h1>
          <button
            onClick={handleLanguageToggle}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all backdrop-blur-md border border-white/20"
          >
            {isArabic ? 'EN' : t('controls.language')}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Control Panel - Glassmorphism */}
          <div
            className="rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 sticky top-16 md:top-24"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
              ⚙️ {t('controls.selectSurah')}
            </h2>

            {/* Surah Select */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                📖 {t('controls.selectSurah')}
              </label>
              <select
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                style={{
                  backdropFilter: 'blur(10px)',
                }}
              >
                {surahs.map((surah) => (
                  <option key={surah.number} value={surah.number} className="bg-gray-900">
                    {surah.number}. {surah.englishName} ({surah.arabicName}) - {surah.totalVerses} {t('plan.verses')}
                  </option>
                ))}
              </select>
            </div>

            {/* Ayah Range */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  📍 {t('controls.startAyah')}
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalVerses}
                  value={startAyah}
                  onChange={(e) => setStartAyah(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  style={{
                    backdropFilter: 'blur(10px)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  📍 {t('controls.endAyah')}
                </label>
                <input
                  type="number"
                  min={startAyah}
                  max={totalVerses}
                  value={endAyah}
                  onChange={(e) =>
                    setEndAyah(Math.min(totalVerses, parseInt(e.target.value) || totalVerses))
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  style={{
                    backdropFilter: 'blur(10px)',
                  }}
                />
              </div>
            </div>

            {/* Duration Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-200 mb-3">
                ⏱️ {t('controls.duration')}: <span className="text-cyan-400 font-bold">{days}</span> {t('controls.durationDays')}
              </label>
              <input
                type="range"
                min="1"
                max="365"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex items-center justify-between text-xs text-gray-400 mt-2 gap-4">
                <span>1</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={days}
                    onChange={(e) => setDays(Math.min(365, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
                    aria-label="Exact days"
                  />
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                    {[1,5,10,30,60,90,180,365].map((p) => (
                      <button
                        key={p}
                        onClick={() => setDays(p)}
                        className="px-1 sm:px-2 py-1 text-xs sm:text-sm rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        aria-label={`Set ${p} days`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <span>365</span>
              </div>
            </div>

            {/* Statistics */}
            <div
              className="rounded-lg p-4 mb-6 border border-white/20"
              style={{
                background: 'rgba(6, 182, 212, 0.1)',
              }}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('stats.totalVerses')}:</span>
                  <span className="font-bold text-cyan-400">{endAyah - startAyah + 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('stats.versesPerDay')}:</span>
                  <span className="font-bold text-cyan-400">{((endAyah - startAyah + 1) / days).toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('stats.estimatedTime')}:</span>
                  <span className="font-bold text-cyan-400">
                    {Math.round(((endAyah - startAyah + 1) * 1.5 * days) / 60)} {t('stats.minutes')}
                  </span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/50"
            >
              {loading ? '⏳ ' + t('controls.generating') : '✨ ' + t('controls.generatePlan')}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200">
                ❌ {error}
              </div>
            )}
          </div>

          {/* Plan Display - Glassmorphism */}
          <div>
            {plan ? (
              <div
                className="rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">
                  {t('plan.title')} - {plan.targetSurah.arabicName} ({plan.targetSurah.name})
                </h2>
                <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-gray-300">
                  <span>📅 {plan.totalDays} {t('controls.durationDays')}</span>
                  <span>📖 {plan.totalVerses} {t('plan.verses')}</span>
                </div>

                <h3 className="text-lg font-bold text-cyan-400 mb-4">📋 {t('plan.daily')}</h3>
                <div className="max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto space-y-3 pr-2 sm:pr-4">
                  {plan.dailyTargets.map((target, index) => {
                    const priorityColors = {
                      high: 'border-l-4 border-red-500',
                      medium: 'border-l-4 border-yellow-500',
                      low: 'border-l-4 border-green-500',
                    };

                    return (
                      <div
                        key={index}
                        className={`rounded-lg p-4 ${priorityColors[target.priority]}`}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-white">
                            {t('plan.day')} {target.day}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(target.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                          </span>
                          <span className="px-2 py-1 rounded bg-cyan-500/30 text-cyan-300 text-xs font-medium">
                            {target.estimatedMinutes} {t('stats.minutes')}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-300">{t('plan.sabaq')}: </span>
                            <span className="text-white font-semibold">
                              {t('plan.verses')} {target.sabaq.startVerse}-{target.sabaq.endVerse}
                              {target.sabaq.endVerse - target.sabaq.startVerse + 1 > 0 &&
                                ` (${target.sabaq.endVerse - target.sabaq.startVerse + 1})`}
                            </span>
                          </div>

                          {target.manzil.length > 0 && (
                            <div>
                              <span className="text-gray-300">{t('plan.manzil')}: </span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {target.manzil.map((rev, revIdx) => (
                                  <span
                                    key={revIdx}
                                    className="px-2 py-1 rounded bg-white/10 text-gray-300 text-xs border border-white/20"
                                  >
                                    {t('plan.verses')} {rev.startVerse}-{rev.endVerse}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl p-12 border border-white/20 flex flex-col items-center justify-center min-h-[400px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="text-6xl mb-4">🕋</div>
                <p className="text-gray-300 text-center">{t('app.description')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lab;

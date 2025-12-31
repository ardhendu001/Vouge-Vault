import React, { useEffect, useState } from 'react';
import { CloudRain, TrendingUp, Sun, Cloud, Snowflake, CloudLightning, Calendar, ArrowRight, DollarSign, CloudFog } from 'lucide-react';
import { WardrobeItem, WeatherData } from '../types';
import { getLookOfTheDay } from '../services/geminiService';

interface DashboardProps {
  weather: WeatherData;
  items: WardrobeItem[];
  onNavigate: (view: any) => void;
  moneySaved: number;
}

const Dashboard: React.FC<DashboardProps> = ({ weather: initialWeather, items, onNavigate, moneySaved }) => {
  const [weather, setWeather] = useState<WeatherData>(initialWeather);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [lookOfTheDay, setLookOfTheDay] = useState<WardrobeItem[]>([]);

  useEffect(() => {
    // 1. Set Real-time Date
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };
    updateDate();

    // 2. Fetch Real-time Weather
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          if (!res.ok) throw new Error('Weather fetch failed');
          const data = await res.json();
          const w = data.current_weather;
          
          let condition = 'Sunny';
          let recommendation = 'Great light for a vibrant outfit.';
          
          // Simple WMO code mapping
          const code = w.weathercode;
          if (code >= 1 && code <= 3) {
            condition = 'Cloudy';
            recommendation = 'Cloudy skies. A perfect backdrop for bold colors.';
          } else if (code >= 45 && code <= 48) {
            condition = 'Foggy';
             recommendation = 'Mysterious fog. Layer up with textures.';
          } else if (code >= 51 && code <= 67) {
            condition = 'Rainy';
            recommendation = 'Rain detected. Don\'t forget your waterproof tech-wear.';
          } else if (code >= 71 && code <= 86) {
            condition = 'Snowy';
            recommendation = 'Freezing temps. Time for the heavy-duty puffer.';
          } else if (code >= 95) {
            condition = 'Stormy';
            recommendation = 'Storm warning. Stay cozy indoors or go full cyberpunk.';
          }

          setWeather({
            temp: Math.round(w.temperature),
            condition: condition,
            recommendation: recommendation
          });
        } catch (e) {
          console.error("Failed to fetch weather", e);
        }
      }, (error) => {
        console.log("Geolocation blocked:", error);
      });
    }
  }, []);

  // Update Look of the Day when weather changes
  useEffect(() => {
    setLookOfTheDay(getLookOfTheDay(items, weather.condition));
  }, [weather, items]);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Rainy': return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'Cloudy': return <Cloud className="w-5 h-5 text-gray-400" />;
      case 'Foggy': return <CloudFog className="w-5 h-5 text-gray-300" />;
      case 'Snowy': return <Snowflake className="w-5 h-5 text-cyan-200" />;
      case 'Stormy': return <CloudLightning className="w-5 h-5 text-purple-400" />;
      default: return <Sun className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Hero: Context Aware */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-4xl font-bold mb-2">
              Good Morning.
            </h2>
            <p className="text-xl text-gray-400">
               You don't need to buy anything today.
            </p>
            
            <div className="flex items-center gap-4 mt-6">
               <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  {getWeatherIcon(weather.condition)}
                  <span className="font-medium text-white">{weather.temp}°C, {weather.condition}</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{currentDate}</span>
               </div>
            </div>
          </div>
          
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Wardrobe Utilization</p>
            <p className="text-3xl font-bold text-white">42% Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Look of the Day */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sun className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-2 h-8 rounded-full bg-fuchsia-500"></span>
                Look of the Day
              </h3>
              <button onClick={() => onNavigate('orchestrator')} className="text-sm text-fuchsia-400 hover:text-white transition-colors flex items-center gap-1">
                Customize <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {lookOfTheDay.map(item => (
                <div key={item.id} className="w-32 flex-shrink-0">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 border border-white/10">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-bold truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
              ))}
              <div className="w-32 flex-shrink-0 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl aspect-[3/4]">
                 <p className="text-xs text-center text-gray-500 px-2">Wear these {lookOfTheDay.length} items to save $120 vs buying new.</p>
              </div>
            </div>
            
            <p className="mt-4 text-gray-400 italic text-sm border-l-2 border-white/20 pl-4">
              "Use your {lookOfTheDay[0]?.title || 'Items'}. It perfectly matches the {weather.condition.toLowerCase()} vibe."
            </p>
          </div>
        </div>

        {/* Quick Stats Vertical */}
        <div className="flex flex-col gap-6">
           <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-green-500/20 blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 text-green-400">
                  <DollarSign className="w-6 h-6" />
                  <span className="font-bold uppercase tracking-wider text-xs">Avoided Spending</span>
                </div>
                <h4 className="text-4xl font-bold text-white">${moneySaved.toLocaleString()}</h4>
                <p className="text-sm text-gray-400 mt-1">This Month</p>
              </div>
           </div>

           <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 text-fuchsia-400">
                  <TrendingUp className="w-6 h-6" />
                  <span className="font-bold uppercase tracking-wider text-xs">Wear Ratio</span>
                </div>
                <h4 className="text-4xl font-bold text-white">High</h4>
                <p className="text-sm text-gray-400 mt-1">You wear 80% of what you own.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame, Percent, Truck } from 'lucide-react';

const banners = [
  {
    id: 1,
    icon: Flame,
    title: 'Promoções da Semana',
    subtitle: 'Confira os destaques com preços especiais!',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 2,
    icon: Truck,
    title: 'Frete Grátis',
    subtitle: 'Em pedidos acima de R$ 50,00',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 3,
    icon: Percent,
    title: 'Combo Especial',
    subtitle: 'Monte seu combo e ganhe desconto!',
    gradient: 'from-violet-500 to-purple-500',
  },
];

export default function PromoBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const banner = banners[current];
  const Icon = banner.icon;

  return (
    <div className="px-4 -mt-5 relative z-20">
      <div
        className={`bg-gradient-to-r ${banner.gradient} rounded-xl p-4 text-white shadow-lg transition-all duration-500 relative overflow-hidden`}
      >
        <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
        <div className="absolute right-8 bottom-0 w-16 h-16 bg-white/5 rounded-full -mb-6" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{banner.title}</p>
            <p className="text-xs opacity-90 truncate">{banner.subtitle}</p>
          </div>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

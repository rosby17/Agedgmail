import React from 'react';

const FinanceCard = ({ label, value, subtext, color = 'emerald', icon: Icon, onClick }) => {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    'profit-accent': 'bg-white/15 text-white border-white/20',
  };

  const isAccent = color === 'profit-accent';

  return (
    <div
      onClick={onClick}
      className={`p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group transition-all duration-200 border ${
        onClick ? 'cursor-pointer hover:border-primary/45 dark:hover:border-primary/45' : ''
      } ${
        isAccent
          ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border-transparent shadow-emerald-500/10 hover:scale-[1.02]'
          : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isAccent ? 'text-emerald-100' : 'text-gray-400 dark:text-slate-400'}`}>{label}</span>
          <div className={`text-3xl font-black font-mono ${isAccent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</div>
          {subtext && <div className={`text-xs font-semibold ${isAccent ? 'text-emerald-100/80' : 'text-gray-500 dark:text-slate-500'}`}>{subtext}</div>}
        </div>
        <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${colors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      {isAccent && (
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
      )}
    </div>
  );
};

export default FinanceCard;

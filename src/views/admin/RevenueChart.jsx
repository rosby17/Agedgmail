import React, { useState } from 'react';
import { netProfitOf } from '../../utils/helpers';

const RevenueChart = ({ confirmedOrders, allUsers = [], mappings = [], lang = 'fr' }) => {
  // Par défaut sur "à vie" pour matcher les cartes Financial Highlights
  // au-dessus (elles aussi non filtrées par date) — un défaut sur 7 jours
  // donnait l'impression trompeuse que le CA/bénéfice affichés en haut de
  // page ne portaient que sur la semaine, alors qu'ils sont déjà lifetime.
  const [range, setRange] = useState('lifetime');
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'users'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const calculateNetProfit = (ordersList) => netProfitOf(ordersList, mappings);

  const getChartData = () => {
    if (range === 7 || range === 30) {
      // Daily grouping
      const days = [...Array(range)].map((_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (range - 1 - i));
        return d;
      });

      return days.map((day, index) => {
        const next = new Date(day); next.setDate(next.getDate() + 1);
        const dayOrders = confirmedOrders
          .filter(o => { const t = new Date(o.created_at); return t >= day && t < next; });

        const netProfit = calculateNetProfit(dayOrders);

        const users = allUsers
          .filter(u => { const t = new Date(u.created_at); return t >= day && t < next; })
          .length;

        return {
          date: day,
          label: day.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: '2-digit' }),
          revenue: netProfit,
          users,
          index
        };
      });
    } else if (range === 365) {
      // Monthly grouping (last 12 months)
      const months = [...Array(12)].map((_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        d.setMonth(d.getMonth() - (11 - i));
        return d;
      });

      return months.map((monthStart, index) => {
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthOrders = confirmedOrders
          .filter(o => { const t = new Date(o.created_at); return t >= monthStart && t < monthEnd; });

        const netProfit = calculateNetProfit(monthOrders);

        const users = allUsers
          .filter(u => { const t = new Date(u.created_at); return t >= monthStart && t < monthEnd; })
          .length;

        return {
          date: monthStart,
          label: monthStart.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: '2-digit' }),
          revenue: netProfit,
          users,
          index
        };
      });
    } else {
      // Lifetime grouping (Monthly from oldest to now)
      const oldestOrderTime = confirmedOrders.length > 0
        ? Math.min(...confirmedOrders.map(o => new Date(o.created_at).getTime()))
        : Date.now();
      const oldestUserTime = allUsers.length > 0
        ? Math.min(...allUsers.map(u => new Date(u.created_at).getTime()))
        : Date.now();

      const oldestTime = Math.min(oldestOrderTime, oldestUserTime, Date.now());
      const start = new Date(oldestTime);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const current = new Date();
      const diffMonths = (current.getFullYear() - start.getFullYear()) * 12 + (current.getMonth() - start.getMonth()) + 1;
      const numMonths = Math.max(diffMonths, 6); // at least 6 months

      const months = [...Array(numMonths)].map((_, i) => {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i);
        return d;
      });

      return months.map((monthStart, index) => {
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthOrders = confirmedOrders
          .filter(o => { const t = new Date(o.created_at); return t >= monthStart && t < monthEnd; });

        const netProfit = calculateNetProfit(monthOrders);

        const users = allUsers
          .filter(u => { const t = new Date(u.created_at); return t >= monthStart && t < monthEnd; })
          .length;

        return {
          date: monthStart,
          label: monthStart.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: '2-digit' }),
          revenue: netProfit,
          users,
          index
        };
      });
    }
  };

  const dataPoints = getChartData();

  // Totaux cumulés sur la période sélectionnée (pour l'en-tête des onglets)
  const rangeRevenue = dataPoints.reduce((s, p) => s + p.revenue, 0);
  const rangeUsers = dataPoints.reduce((s, p) => s + p.users, 0);

  // Données actives pour le tracé du graphique
  const activeTotals = dataPoints.map(p => activeMetric === 'revenue' ? p.revenue : p.users);
  const max = Math.max(...activeTotals, 1);

  // Configuration SVG
  const width = 600;
  const height = 160;
  const paddingX = 25;
  const paddingY = 25;

  const denom = dataPoints.length > 1 ? dataPoints.length - 1 : 1; // évite /0 si un seul point
  const points = dataPoints.map((p, i) => {
    const val = activeMetric === 'revenue' ? p.revenue : p.users;
    const x = paddingX + (i / denom) * (width - 2 * paddingX);
    // Borne la coordonnée dans le cadre : une valeur négative (bénéfice en perte)
    // ne doit pas faire piquer la courbe hors du graphique. Elle se pose sur la
    // ligne de base ; le montant réel (négatif) reste visible dans l'infobulle.
    const rawY = height - paddingY - (val / max) * (height - 2 * paddingY);
    const y = Math.max(paddingY, Math.min(height - paddingY, rawY));
    return { x, y, amount: val, date: p.date, label: p.label, index: i };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - 5} L ${points[0].x} ${height - 5} Z`
    : '';

  const rangeOptions = [
    { value: 7, label: lang === 'fr' ? '7 jours' : '7 days' },
    { value: 30, label: lang === 'fr' ? '30 jours' : '30 days' },
    { value: 365, label: lang === 'fr' ? '1 an' : '1 year' },
    { value: 'lifetime', label: lang === 'fr' ? 'À vie' : 'Lifetime' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative space-y-6">
      {/* Sélecteurs de Période */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">
            {lang === 'fr' ? 'Performances générales' : 'General metrics'}
          </h3>
        </div>
        <div className="flex gap-2">
          {rangeOptions.map(opt => (
            <button key={opt.value} onClick={() => { setRange(opt.value); setHoveredPoint(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${range === opt.value ? 'bg-primary text-white dark:text-gray-900' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-800'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Onglets style YouTube Studio */}
      <div className="grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-slate-800 pb-2">
        {/* Onglet Revenu Estimé */}
        <button
          onClick={() => { setActiveMetric('revenue'); setHoveredPoint(null); }}
          className={`text-left p-4 rounded-2xl transition-all relative border flex flex-col justify-between ${
            activeMetric === 'revenue'
              ? 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white'
              : 'bg-transparent border-transparent text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-400">
            {lang === 'fr' ? 'Bénéfice Net' : 'Net Profit'}
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-gray-900 dark:text-white">${rangeRevenue.toFixed(2)}</div>
          <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1">
            {lang === 'fr' ? `Total sur ${rangeOptions.find(o => o.value === range)?.label.toLowerCase()}` : `Total for ${rangeOptions.find(o => o.value === range)?.label.toLowerCase()}`}
          </div>
          {activeMetric === 'revenue' && (
            <div className="absolute bottom-[-10px] left-0 right-0 h-1 bg-primary rounded-full" />
          )}
        </button>

        {/* Onglet Clients Inscrits */}
        <button
          onClick={() => { setActiveMetric('users'); setHoveredPoint(null); }}
          className={`text-left p-4 rounded-2xl transition-all relative border flex flex-col justify-between ${
            activeMetric === 'users'
              ? 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white'
              : 'bg-transparent border-transparent text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-400">
            {lang === 'fr' ? 'Clients Inscrits' : 'Registered Clients'}
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-gray-900 dark:text-white">{rangeUsers}</div>
          <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1">
            {lang === 'fr' ? `Inscriptions sur la période` : `Registrations in period`}
          </div>
          {activeMetric === 'users' && (
            <div className="absolute bottom-[-10px] left-0 right-0 h-1 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Zone Graphique */}
      <div className="relative h-44 w-full">
        {/* Tooltip flottant */}
        {hoveredPoint && (
          <div
            className="absolute z-20 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 px-3 py-2 rounded-xl shadow-xl text-center pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 45}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-[9px] text-gray-500 dark:text-slate-500 font-black uppercase">
              {hoveredPoint.label}
            </div>
            <div className="text-xs font-black text-primary font-mono">
              {activeMetric === 'revenue' ? `${hoveredPoint.amount.toFixed(2)}` : `${hoveredPoint.amount} client(s)`}
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grille horizontale en arrière-plan */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + ratio * (height - 2 * paddingY);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                strokeWidth="1"
                strokeDasharray="4 4"
                className="stroke-gray-100 dark:stroke-slate-800"
              />
            );
          })}

          {/* Remplissage dégradé sous la courbe */}
          {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

          {/* Ligne principale de la courbe */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points sur la courbe */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.index === i ? "6" : "3.5"}
              fill="#10B981"
              strokeWidth={hoveredPoint?.index === i ? "3" : "2"}
              className="stroke-white dark:stroke-slate-900 transition-all duration-150"
            />
          ))}

          {/* Zones interactives transparentes pour le survol */}
          {points.map((p, i) => (
            <rect
              key={i}
              x={p.x - (width / points.length) / 2}
              y={0}
              width={width / points.length}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase pt-2">
        <span>{points[0]?.label || ''}</span>
        <span>{points[points.length - 1]?.label || ''}</span>
      </div>
    </div>
  );
};

export default RevenueChart;

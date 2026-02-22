import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend
} from "recharts";
import { ChartBarIcon } from '@heroicons/react/24/outline';

// Types pour les données
interface ChartDataItem {
  site: string;
  total: number;
  retirees?: number;
  delivrees?: number;
  enAttente?: number;
}

interface ChartCartesProps {
  data: ChartDataItem[];
  title?: string;
  height?: number;
  type?: 'bar' | 'pie' | 'line';
  showLegend?: boolean;
  showGrid?: boolean;
}

const ChartCartes: React.FC<ChartCartesProps> = ({ 
  data, 
  title = "Statistiques des Cartes par Site",
  height = 400,
  type = 'bar',
  showLegend = true,
  showGrid = true
}) => {
  
  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>(type);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Adapter la hauteur pour mobile
  const chartHeight = isMobile ? height * 0.7 : height;

  // Calculer les totaux
  const totalCartes = data.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalDelivrees = data.reduce((sum, item) => sum + (item.delivrees || item.retirees || 0), 0);
  const totalEnAttente = data.reduce((sum, item) => sum + (item.enAttente || (item.total - (item.delivrees || item.retirees || 0))), 0);

  // Format personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const delivrees = dataPoint.delivrees || dataPoint.retirees || 0;
      const enAttente = dataPoint.enAttente || (dataPoint.total - delivrees);
      
      return (
        <div className="bg-white/95 backdrop-blur-lg border border-orange-200 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-xl max-w-[250px] md:max-w-xs">
          <p className="font-semibold text-gray-800 mb-2 text-sm md:text-base">
            {dataPoint.site}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-[#0077B6] rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">Total:</span>
              </div>
              <span className="font-semibold text-[#0077B6] text-xs md:text-sm">
                {dataPoint.total.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-[#2E8B57] rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">Délivrées:</span>
              </div>
              <span className="font-semibold text-[#2E8B57] text-xs md:text-sm">
                {delivrees.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-[#F77F00] rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">En attente:</span>
              </div>
              <span className="font-semibold text-[#F77F00] text-xs md:text-sm">
                {enAttente.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-gray-200 mt-2 pt-2">
              <p className="text-xs md:text-sm text-gray-500">
                Taux de délivrance: {dataPoint.total > 0 ? ((delivrees / dataPoint.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Format personnalisé pour le tooltip du pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-lg border border-orange-200 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-xl">
          <p className="font-semibold text-gray-800 text-sm md:text-base">{data.name}</p>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Valeur: <span className="font-bold text-[#0077B6]">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalCartes > 0 ? ((data.value / totalCartes) * 100).toFixed(1) : 0}% du total
          </p>
        </div>
      );
    }
    return null;
  };

  // Format personnalisé pour la légende
  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-1.5 md:gap-2">
            <div 
              className="w-2 h-2 md:w-3 md:h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs md:text-sm font-medium text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Données pour le pie chart
  const pieData = [
    { name: 'Cartes délivrées', value: totalDelivrees, color: '#2E8B57' },
    { name: 'Cartes en attente', value: totalEnAttente, color: '#F77F00' }
  ];

  // Données pour le line chart (évolution)
  const lineData = data.map((item) => ({
    name: item.site,
    total: item.total,
    delivrees: item.delivrees || item.retirees || 0,
    enAttente: item.enAttente || (item.total - (item.delivrees || item.retirees || 0))
  }));

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl border border-orange-100 p-3 md:p-6">
      
      {/* En-tête avec sélecteur de type */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-lg md:rounded-xl flex items-center justify-center`}>
            <ChartBarIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
          </div>
          <div>
            <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-sm' : 'text-lg md:text-xl'}`}>
              {title}
            </h3>
            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {data.length} site{data.length > 1 ? 's' : ''} • {totalCartes.toLocaleString()} cartes
            </p>
          </div>
        </div>

        {/* Sélecteur de type de graphique */}
        <div className="flex items-center gap-1 md:gap-2 bg-gray-100 p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setChartType('bar')}
            className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
              chartType === 'bar' 
                ? 'bg-white text-[#F77F00] shadow-sm' 
                : 'text-gray-600 hover:text-[#F77F00]'
            }`}
          >
            Barres
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
              chartType === 'pie' 
                ? 'bg-white text-[#F77F00] shadow-sm' 
                : 'text-gray-600 hover:text-[#F77F00]'
            }`}
          >
            Circulaire
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
              chartType === 'line' 
                ? 'bg-white text-[#F77F00] shadow-sm' 
                : 'text-gray-600 hover:text-[#F77F00]'
            }`}
          >
            Lignes
          </button>
        </div>
      </div>

      {/* Graphique */}
      <ResponsiveContainer width="100%" height={chartHeight}>
        {chartType === 'bar' && (
          <BarChart
            data={data}
            margin={{ 
              top: 10, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 0 : 10, 
              bottom: isMobile ? 40 : 60 
            }}
          >
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                vertical={false}
              />
            )}
            <XAxis 
              dataKey="site"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
              angle={isMobile ? -45 : -30}
              textAnchor="end"
              height={isMobile ? 60 : 80}
              interval={isMobile ? 1 : 0}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 50}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend content={renderLegend} />}
            <Bar 
              dataKey="total" 
              name="Total des cartes"
              fill="#0077B6"
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 30 : 50}
            />
            <Bar 
              dataKey={data[0]?.delivrees !== undefined ? "delivrees" : "retirees"} 
              name="Cartes délivrées"
              fill="#2E8B57"
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 30 : 50}
            />
          </BarChart>
        )}

        {chartType === 'pie' && (
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 40 : 60}
              outerRadius={isMobile ? 70 : 100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={!isMobile ? (entry: any) => `${entry.name} ${((entry.value / totalCartes) * 100).toFixed(0)}%` : undefined}
              labelLine={!isMobile}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            {showLegend && (
              <Legend 
                layout={isMobile ? 'horizontal' : 'vertical'}
                align="right"
                verticalAlign={isMobile ? 'bottom' : 'middle'}
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
            )}
          </PieChart>
        )}

        {chartType === 'line' && (
          <LineChart
            data={lineData}
            margin={{ 
              top: 10, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 0 : 10, 
              bottom: isMobile ? 40 : 60 
            }}
          >
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                vertical={false}
              />
            )}
            <XAxis 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
              angle={isMobile ? -45 : -30}
              textAnchor="end"
              height={isMobile ? 60 : 80}
              interval={isMobile ? 1 : 0}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 50}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend content={renderLegend} />}
            <Line 
              type="monotone" 
              dataKey="total" 
              name="Total des cartes"
              stroke="#0077B6" 
              strokeWidth={2}
              dot={{ r: isMobile ? 3 : 4, fill: "#0077B6" }}
              activeDot={{ r: isMobile ? 5 : 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="delivrees" 
              name="Cartes délivrées"
              stroke="#2E8B57" 
              strokeWidth={2}
              dot={{ r: isMobile ? 3 : 4, fill: "#2E8B57" }}
              activeDot={{ r: isMobile ? 5 : 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="enAttente" 
              name="En attente"
              stroke="#F77F00" 
              strokeWidth={2}
              dot={{ r: isMobile ? 3 : 4, fill: "#F77F00" }}
              activeDot={{ r: isMobile ? 5 : 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Résumé des totaux */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xs md:text-sm text-gray-600 mb-1">Total</div>
          <div className="font-bold text-[#0077B6] text-sm md:text-lg">
            {totalCartes.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs md:text-sm text-gray-600 mb-1">Délivrées</div>
          <div className="font-bold text-[#2E8B57] text-sm md:text-lg">
            {totalDelivrees.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs md:text-sm text-gray-600 mb-1">En attente</div>
          <div className="font-bold text-[#F77F00] text-sm md:text-lg">
            {totalEnAttente.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCartes;
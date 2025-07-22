import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface PieChartProps {
  data: ChartData[];
  title: string;
}

const COLORS = ['#14B8A6', '#0EA5E9', '#8B5CF6', '#EC4899', '#F97316', '#FACC15'];

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-gray-800 p-4 rounded-lg flex flex-col">
                <h4 className="font-bold text-gray-300 mb-2">{title}</h4>
                <div className="flex-grow flex items-center justify-center text-gray-500 min-h-[100px]">
                    Không có dữ liệu
                </div>
            </div>
        );
    }
    
    const total = data.reduce((acc, d) => acc + d.value, 0);
    
    let cumulativePercentage = 0;
    const gradientParts = data.map((d, i) => {
        const percentage = total > 0 ? (d.value / total) * 100 : 0;
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        const end = cumulativePercentage;
        return `${COLORS[i % COLORS.length]} ${start}% ${end}%`;
    });
    
    const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-gray-300 mb-4">{title}</h4>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div 
                    className="w-28 h-28 rounded-full" 
                    style={{ background: conicGradient }}
                    role="img"
                    aria-label={title}
                ></div>
                <div className="flex-1 space-y-1">
                    {data.map((d, i) => (
                        <div key={d.label} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                <span className="text-gray-300">{d.label}</span>
                            </div>
                            <span className="font-semibold text-white">{d.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

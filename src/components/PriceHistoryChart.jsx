import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

function PriceHistoryChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                Dados insuficientes para exibir o gráfico de histórico.
            </div>
        );
    }

    // Format dates for XAxis
    const formattedData = data.map(item => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
        market: parseFloat(item.market_price) || 0,
        foil: parseFloat(item.foil_market_price) || 0
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                        dataKey="displayDate"
                        stroke="var(--text-secondary)"
                        fontSize={12}
                    />
                    <YAxis
                        stroke="var(--text-secondary)"
                        fontSize={12}
                        tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)'
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="market"
                        name="Normal"
                        stroke="var(--primary-color)"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                    />
                    {/* Only show Foil line if there is foil data */}
                    {formattedData.some(d => d.foil > 0) && (
                        <Line
                            type="monotone"
                            dataKey="foil"
                            name="Foil"
                            stroke="#fbbf24"
                            strokeWidth={2}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default PriceHistoryChart;

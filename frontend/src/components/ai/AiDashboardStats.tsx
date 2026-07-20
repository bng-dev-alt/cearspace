import React from 'react';
import { aiCostEstimator } from '../../services/ai/aiCostEstimator';
import { AiStats } from '../../services/ai/aiAnalyticsService';
import { Activity, Cpu, Coins, Clock } from 'lucide-react';

interface AiDashboardStatsProps {
  stats: AiStats;
}

export default function AiDashboardStats({ stats }: AiDashboardStatsProps) {
  const cards = [
    {
      title: 'Požadavky dnes',
      value: stats.todayRequests,
      icon: <Activity size={20} style={{ color: '#209dd7' }} />,
      desc: 'Úspěšně zpracované požadavky',
    },
    {
      title: 'Spotřebované tokeny dnes',
      value: stats.todayTokens.toLocaleString(),
      icon: <Cpu size={20} style={{ color: '#ecad0a' }} />,
      desc: 'Celkový počet prompt + completion tokenů',
    },
    {
      title: 'Odhadované náklady dnes',
      value: aiCostEstimator.formatCostCzk(stats.todayCostCzk),
      icon: <Coins size={20} style={{ color: '#753991' }} />,
      desc: 'Přepočteno z USD dle aktuálního ceníku',
    },
    {
      title: 'Průměrná doba odezvy',
      value: stats.averageResponseTime > 0 
        ? `${(stats.averageResponseTime / 1000).toFixed(2)} s` 
        : '0.00 s',
      icon: <Clock size={20} style={{ color: '#888888' }} />,
      desc: 'Průměrná latence AI requestů',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%' }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-text)' }}>
              {card.title}
            </span>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '8px',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {card.icon}
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.2rem 0' }}>
            {card.value}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-text)', lineHeight: '1.2' }}>
            {card.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

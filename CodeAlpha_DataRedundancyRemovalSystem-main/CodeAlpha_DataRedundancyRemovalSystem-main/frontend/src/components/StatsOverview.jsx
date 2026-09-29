import React from 'react';
import { 
  Database, 
  CheckCircle2, 
  ShieldAlert, 
  UserCheck, 
  AlertTriangle, 
  Zap 
} from 'lucide-react';

export default function StatsOverview({ stats = {} }) {
  const {
    totalRecords = 0,
    uniqueRecords = 0,
    duplicateAttempts = 0,
    falsePositives = 0,
    invalidAttempts = 0,
    preventionRate = 0
  } = stats;

  const cards = [
    {
      label: 'Total Cloud Records',
      value: totalRecords,
      subtext: 'Persisted in MongoDB Atlas',
      icon: Database,
      accent: 'var(--accent-cyan)'
    },
    {
      label: 'Unique Verified Entries',
      value: uniqueRecords,
      subtext: 'Append-only verified records',
      icon: CheckCircle2,
      accent: 'var(--status-unique)'
    },
    {
      label: 'Duplicate Attempts Blocked',
      value: duplicateAttempts,
      subtext: 'Exact & similar duplicates intercepted',
      icon: ShieldAlert,
      accent: 'var(--status-exact)'
    },
    {
      label: 'False Positive Cases',
      value: falsePositives,
      subtext: 'Same name, distinct credentials',
      icon: UserCheck,
      accent: 'var(--status-fp)'
    },
    {
      label: 'Validation Failures',
      value: invalidAttempts,
      subtext: 'Malformed/incomplete inputs',
      icon: AlertTriangle,
      accent: 'var(--status-invalid)'
    },
    {
      label: 'Efficiency Rate',
      value: `${preventionRate}%`,
      subtext: 'Redundancy prevention ratio',
      icon: Zap,
      accent: 'var(--accent-indigo)'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div 
            key={idx} 
            className="stat-card"
            style={{ '--card-accent': card.accent }}
          >
            <div className="stat-header">
              <span>{card.label}</span>
              <div className="stat-icon">
                <IconComponent size={18} />
              </div>
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-subtext">{card.subtext}</div>
          </div>
        );
      })}
    </div>
  );
}

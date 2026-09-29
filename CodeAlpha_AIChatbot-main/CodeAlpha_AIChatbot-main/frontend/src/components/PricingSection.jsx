import React from 'react';

const PLANS = [
  {
    name: 'Starter Plan',
    price: '$199',
    period: '/ month',
    desc: 'Perfect for startups and small business workloads looking for solid cloud fundamentals.',
    features: [
      'Single cloud provider management (AWS/Azure/GCP)',
      'Automated weekly snapshot backups',
      'Basic uptime monitoring (5-min check intervals)',
      'Email & Community support',
      'CloudBot AI Assistant integration'
    ],
    isFeatured: false,
    prompt: 'Tell me about the Starter pricing plan'
  },
  {
    name: 'Professional Plan',
    price: '$599',
    period: '/ month',
    desc: 'Engineered for growing teams that need high-availability, CI/CD pipelines, and SLA.',
    features: [
      'Multi-cloud Kubernetes cluster management',
      'Automated hourly backups with zero-loss RPO',
      'Continuous 1-minute real-time telemetry',
      '99.95% uptime SLA guarantee',
      'Priority ticketing & Slack channel access',
      'Custom CloudBot intent tuning'
    ],
    isFeatured: true,
    badge: 'Most Popular',
    prompt: 'What are the details of the Professional plan?'
  },
  {
    name: 'Enterprise Plan',
    price: 'Custom',
    period: '',
    desc: 'Full-service tailored architecture, dedicated cloud architect, and 24/7 hotline escalation.',
    features: [
      'Bespoke hybrid-cloud architecture & migration',
      'Dedicated Principal Cloud Architect',
      '15-minute P1 incident response SLA',
      'SOC 2 Type II audit readiness & assistance',
      'Custom Generative AI & Retrieval Pipelines',
      'Executive quarterly business reviews'
    ],
    isFeatured: false,
    prompt: 'How do I contact enterprise sales for custom pricing?'
  }
];

export default function PricingSection({ onSelectPrompt }) {
  return (
    <section id="pricing" className="section">
      <div className="container">
        <div className="section-header">
          <div className="badge">Transparent Billing</div>
          <h2 className="section-title">Flexible Pricing Plans</h2>
          <p className="section-subtitle">
            All plans include a 14-day risk-free trial and our 30-day money-back guarantee.
          </p>
        </div>

        <div className="grid-3">
          {PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={`glass-card pricing-card ${plan.isFeatured ? 'featured' : ''}`}
            >
              {plan.badge && <span className="pricing-badge">{plan.badge}</span>}
              <h3>{plan.name}</h3>
              <div className="pricing-price">
                {plan.price}
                <span>{plan.period}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{plan.desc}</p>

              <ul className="pricing-features">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="active">
                    <span style={{ color: '#10b981' }}>✓</span> {feat}
                  </li>
                ))}
              </ul>

              <button
                className={`btn ${plan.isFeatured ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onSelectPrompt(plan.prompt)}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Start 14-Day Trial'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

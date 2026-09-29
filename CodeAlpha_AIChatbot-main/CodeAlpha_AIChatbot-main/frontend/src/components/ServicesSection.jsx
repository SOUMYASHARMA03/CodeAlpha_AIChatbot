import React from 'react';

const SERVICES = [
  {
    icon: '⚡',
    title: 'Cloud Migration & Modernization',
    desc: 'Seamless zero-downtime transition from on-premise infrastructure to AWS, Microsoft Azure, or Google Cloud Platform.'
  },
  {
    icon: '🔄',
    title: 'DevOps & CI/CD Automation',
    desc: 'Automate build, test, and release lifecycles using Docker, Kubernetes, Terraform, and GitHub Actions with zero friction.'
  },
  {
    icon: '🛡️',
    title: 'Cloud Security & Compliance',
    desc: 'Full-spectrum protection featuring AES-256 encryption at rest, TLS 1.3 in transit, SOC 2 Type II, and ISO 27001 hardening.'
  },
  {
    icon: '📊',
    title: 'Cloud Cost Optimization',
    desc: 'Continuous resource right-sizing, auto-scaling policy management, and reserved instance planning saving up to 40% on cloud spend.'
  },
  {
    icon: '🌐',
    title: 'Serverless & Microservices',
    desc: 'Deconstruct monolithic codebases into high-velocity microservices using event-driven serverless architectures.'
  },
  {
    icon: '🚨',
    title: '24/7 Managed Infrastructure',
    desc: 'Continuous automated telemetry, real-time threat detection, automated snapshot backups, and rapid incident response.'
  }
];

export default function ServicesSection({ onSelectPrompt }) {
  return (
    <section id="services" className="section">
      <div className="container">
        <div className="section-header">
          <div className="badge">Our Capabilities</div>
          <h2 className="section-title">Enterprise Cloud Services</h2>
          <p className="section-subtitle">
            Reliable infrastructure engineered to scale with your business demands.
          </p>
        </div>

        <div className="grid-3">
          {SERVICES.map((s, idx) => (
            <div key={idx} className="glass-card service-card">
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <button
                style={{
                  marginTop: 18,
                  fontSize: '0.85rem',
                  color: '#38bdf8',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onClick={() => onSelectPrompt(`Tell me more about ${s.title}`)}
              >
                Ask bot about this &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

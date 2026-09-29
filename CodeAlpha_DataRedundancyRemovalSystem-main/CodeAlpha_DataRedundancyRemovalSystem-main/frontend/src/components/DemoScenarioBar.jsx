import React from 'react';
import { 
  PlayCircle, 
  CheckCircle, 
  Copy, 
  GitFork, 
  UserCheck, 
  AlertOctagon 
} from 'lucide-react';

export const DEMO_PRESETS = {
  unique: {
    name: 'Dr. Jane Goodall',
    email: 'jane.goodall@primateresearch.org',
    phone: '4155550255',
    city: 'San Francisco',
    organization: 'Global Research Institute',
    category: 'Research',
    description: 'Pioneering researcher requiring secure cloud records storage.'
  },
  exact: {
    name: 'Dr. Sarah Connor',
    email: 'sarah.connor@cyberdyne.io',
    phone: '4155550199',
    city: 'San Francisco',
    organization: 'Cyberdyne Systems',
    category: 'Cloud Engineering',
    description: 'Exact duplicate submission matching existing baseline record.'
  },
  similar: {
    name: 'Sara Connor', // Typo in name
    email: 'sarah.connor@cyberdyne.io', // Same email
    phone: '4155550199', // Same phone
    city: 'San Francisco',
    organization: 'Cyberdyne Systems',
    category: 'Cloud Engineering',
    description: 'Minor spelling variation (typo) for an existing entity.'
  },
  falsePositive: {
    name: 'Dr. Sarah Connor', // Identical name!
    email: 'sarah.c@medical-center.org', // Entirely distinct email
    phone: '2125559811', // Entirely distinct phone
    city: 'New York',
    organization: 'Manhattan Medical Institute',
    category: 'Healthcare',
    description: 'Different professional who shares the same name with an existing cloud entry.'
  },
  invalid: {
    name: 'J', // Less than 2 characters
    email: 'bad-email-format',
    phone: '123', // Less than 7 digits
    city: 'Unknown',
    organization: '',
    category: 'General',
    description: 'Malformed payload violating format constraints.'
  }
};

export default function DemoScenarioBar({ onSelectScenario }) {
  return (
    <div className="demo-bar">
      <div className="demo-bar-header">
        <div className="demo-bar-title">
          <PlayCircle size={18} />
          <span>Interactive Task 1 Demonstration Controls</span>
        </div>
        <div className="demo-bar-badge">
          Click any preset to auto-fill test data
        </div>
      </div>

      <div className="demo-buttons-grid">
        <button 
          className="demo-scenario-btn unique"
          onClick={() => onSelectScenario(DEMO_PRESETS.unique, 'Demo 1: Unique Record')}
        >
          <div className="demo-scenario-title">
            <CheckCircle size={14} />
            <span>Demo 1 — Unique Record</span>
          </div>
          <div className="demo-scenario-desc">
            New entity → UNIQUE (Inserted)
          </div>
        </button>

        <button 
          className="demo-scenario-btn exact"
          onClick={() => onSelectScenario(DEMO_PRESETS.exact, 'Demo 2: Exact Duplicate')}
        >
          <div className="demo-scenario-title">
            <Copy size={14} />
            <span>Demo 2 — Exact Duplicate</span>
          </div>
          <div className="demo-scenario-desc">
            Identical record → REDUNDANT_EXACT (Rejected)
          </div>
        </button>

        <button 
          className="demo-scenario-btn similar"
          onClick={() => onSelectScenario(DEMO_PRESETS.similar, 'Demo 3: Similar Typo')}
        >
          <div className="demo-scenario-title">
            <GitFork size={14} />
            <span>Demo 3 — Similar Duplicate</span>
          </div>
          <div className="demo-scenario-desc">
            Name typo ("Sara") → REDUNDANT_SIMILAR (Rejected)
          </div>
        </button>

        <button 
          className="demo-scenario-btn fp"
          onClick={() => onSelectScenario(DEMO_PRESETS.falsePositive, 'Demo 4: False Positive')}
        >
          <div className="demo-scenario-title">
            <UserCheck size={14} />
            <span>Demo 4 — False Positive</span>
          </div>
          <div className="demo-scenario-desc">
            Same name, unique credentials → FALSE_POSITIVE (Inserted)
          </div>
        </button>

        <button 
          className="demo-scenario-btn invalid"
          onClick={() => onSelectScenario(DEMO_PRESETS.invalid, 'Demo 5: Invalid Data')}
        >
          <div className="demo-scenario-title">
            <AlertOctagon size={14} />
            <span>Demo 5 — Invalid Data</span>
          </div>
          <div className="demo-scenario-desc">
            Malformed email/phone → INVALID (Rejected)
          </div>
        </button>
      </div>
    </div>
  );
}

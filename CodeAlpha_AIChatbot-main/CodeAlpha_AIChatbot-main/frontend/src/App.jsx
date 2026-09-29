import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import AboutSection from './components/AboutSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AnalyticsModal from './components/AnalyticsModal';
import ChatWidget from './components/ChatWidget/ChatWidget';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [promptTrigger, setPromptTrigger] = useState(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Trigger chatbot from anywhere on the landing page
  const handleSelectPrompt = (promptText) => {
    setPromptTrigger(null);
    // Allow state to reset if same prompt is clicked
    setTimeout(() => {
      setPromptTrigger(promptText);
      setIsChatOpen(true);
    }, 50);
  };

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <Navbar
        onOpenChat={() => setIsChatOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
      />

      {/* Main Website Content */}
      <main>
        <Hero
          onOpenChat={() => setIsChatOpen(true)}
          onSelectPrompt={handleSelectPrompt}
        />

        <ServicesSection onSelectPrompt={handleSelectPrompt} />

        <AboutSection onOpenAnalytics={() => setIsAnalyticsOpen(true)} />

        <PricingSection onSelectPrompt={handleSelectPrompt} />

        <FAQSection onSelectPrompt={handleSelectPrompt} />

        <ContactSection onSelectPrompt={handleSelectPrompt} />
      </main>

      {/* Website Footer */}
      <Footer onOpenChat={() => setIsChatOpen(true)} />

      {/* Live Analytics / Telemetry Inspection Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* Floating CloudBot Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        promptTrigger={promptTrigger}
      />
    </div>
  );
}

import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import { Menu, X, Smartphone, Globe, Zap, BarChart2, Smile, Shield } from "lucide-react";
import './App.css';
import auto from './assets/robotic.png'

const WizBotWebsite = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };
  const features = [
    {
      title: "24/7 Availability",
      description: "Your customers get instant responses anytime, anywhere.",
      icon: <Smartphone size={32} className="feature-icon" />
    },
    {
      title: "Multi-language Support",
      description: "Communicate in your customers' preferred language.",
      icon: <Globe size={32} className="feature-icon" />
    },
    {
      title: "Seamless Integration",
      description: "Connect with your existing CRM and e-commerce platforms.",
      icon: <Zap size={32} className="feature-icon" />
    },
    {
      title: "Analytics Dashboard",
      description: "Track performance and conversation trends.",
      icon: <BarChart2 size={32} className="feature-icon" />
    },
    {
      title: "Customizable Personality",
      description: "Tailor WizBot's tone to match your brand.",
      icon: <Smile size={32} className="feature-icon" />
    },
    {
      title: "Secure & Compliant",
      description: "Enterprise-grade security with compliance.",
      icon: <Shield size={32} className="feature-icon" />
    }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="wizbot-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <img src={auto} alt="" style={{height:'40px', width:'40px', borderRadius:'50%'}}/> <b>LexiAI</b>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-list">
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#features" className="nav-link">Features</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </nav>
        
        {/* Mobile Menu Button */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-nav">
            <ul className="mobile-nav-list">
              <li><a href="#about" className="mobile-nav-link" onClick={toggleMobileMenu}>About</a></li>
              <li><a href="#features" className="mobile-nav-link" onClick={toggleMobileMenu}>Features</a></li>
              <li><a href="#contact" className="mobile-nav-link" onClick={toggleMobileMenu}>Contact</a></li>
              <li>
                <button className="primary-button mobile-nav-button">Get Started</button>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Intelligent AI Chatbot for Your Business</h2>
          <p className="hero-description">
          LexiAI helps you automate customer support, generate leads, and provide 24/7 assistance with our advanced natural language processing technology.
          </p>
          <div className="hero-buttons">
          <button onClick={handleGetStarted} className="get-started-btn"style={{backgroundColor:'#6E48AA',border:'none',borderRadius:'6px',height:'50px',width:'120px',fontWeight:'bold'}}>
            Get Started
          </button>
            <button className="secondary-button">Live Demo</button>
          </div>
        </div>
        <div className="hero-image">
          <img src={auto} alt="" style={{height:'300px',borderRadius:'9px'}}/>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <h2 className="section-title">About LexiAI</h2>
        <div className="about-content">
          <div className="about-column">
            <h3 className="about-subtitle">Our Mission</h3>
            <p className="about-text">
            LexiAI was created to revolutionize how businesses interact with their customers. Our AI-powered chatbot provides instant, accurate responses while learning from every interaction to continuously improve.
            </p>
          </div>
          <div className="about-column">
            <h3 className="about-subtitle">The Technology</h3>
            <p className="about-text">
              Using cutting-edge natural language processing and machine learning, LexiAI understands context, remembers conversations, and provides human-like responses tailored to your business needs.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">LexiAI Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-container">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <div className="contact-info">
            <h2 className="contact-title">Contact Us</h2>
            <p className="contact-text">
              Have questions about LexiAI? Our team is ready to help you implement the perfect AI solution for your business needs.
            </p>
            <div className="contact-detail">
              <h3 className="contact-subtitle">Email</h3>
              <p>contact@LexiAI.ai</p>
            </div>
            <div className="contact-detail">
              <h3 className="contact-subtitle">Phone</h3>
              <p>+1 (800) 555-0199</p>
            </div>
            <div className="contact-detail">
              <h3 className="contact-subtitle">Office</h3>
              <p>123 AI Boulevard<br />San Francisco, CA 94107</p>
            </div>
          </div>
          <div className="contact-form-container">
            <form className="contact-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea"></textarea>
              </div>
              <button type="submit" className="primary-button form-submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="footer-links">
                <a href="/terms" className="footer-link">Terms of Service</a>
                <a href="/privacy" className="footer-link">Privacy Policy</a>
                <a href="/cookies" className="footer-link">Cookie Policy</a>
                <a href="/contact" className="footer-link">Contact Us</a>
              </div>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <p className="footer-text">
                © {currentYear} LexiAI Technologies. All rights reserved.
              </p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <small className="footer-trademark">LexiAI is a registered trademark of LexiAI Technologies LLC.</small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WizBotWebsite;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HomePage.css';
import {
  FiCheckCircle,
  FiDollarSign,
  FiSmile,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiMessageCircle,
  FiHelpCircle,
  FiX,
  FiSend,
  FiUser,
  FiCpu,
  FiLogOut
} from 'react-icons/fi';

// Chatbot component (unchanged)
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Nestor, your TaskNest assistant! 🐦✨ I'm here to help you organize tasks, manage budgets, and track your mood. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'welcome'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState(true);
  const [conversationContext, setConversationContext] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);
    setSuggestions(false);

    // Simulate bot response after a delay
    setTimeout(() => {
      generateBotResponse(inputText);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const isPositiveResponse = (text) => {
    const positiveWords = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'good', 'great', 'awesome', 'perfect', 'fine', 'excellent', 'wonderful', 'fantastic', 'love', 'like', 'cool', 'nice', 'alright', 'yes please', 'of course', 'definitely', 'absolutely'];
    return positiveWords.some(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(text);
    });
  };

  const isNegativeResponse = (text) => {
    const negativeWords = ['no', 'nope', 'nah', 'not', 'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'worse', 'poor', 'sucks', 'ugh', 'meh', 'boring', 'no thanks', 'not really', 'never', 'unfortunately'];
    return negativeWords.some(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(text);
    });
  };

  const isGreeting = (text) => {
    const greetings = ['hello', 'hi', 'hey', 'hola', 'howdy', 'greetings', 'sup', 'yo', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(text);
    });
  };

  const isGratitude = (text) => {
    const gratitudeWords = ['thanks', 'thank', 'appreciate', 'grateful', 'thx', 'ty', 'thank you'];
    return gratitudeWords.some(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(text);
    });
  };

  const isFarewell = (text) => {
    const farewellWords = ['bye', 'goodbye', 'see you', 'see ya', 'farewell', 'later', 'cya', 'have a good one'];
    return farewellWords.some(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(text);
    });
  };

  const isQuestion = (text) => {
    return text.includes('?') || 
           text.startsWith('what') || 
           text.startsWith('how') || 
           text.startsWith('why') || 
           text.startsWith('when') || 
           text.startsWith('where') || 
           text.startsWith('who') || 
           text.startsWith('which') || 
           text.startsWith('can') || 
           text.startsWith('could') || 
           text.startsWith('would') || 
           text.startsWith('should') || 
           text.startsWith('is') || 
           text.startsWith('are') || 
           text.startsWith('do') || 
           text.startsWith('does');
  };

  const generateBotResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    let response = '';
    let newContext = conversationContext;

    // Handle greetings
    if (isGreeting(lowerInput)) {
      const greetings = [
        "Hello there! 👋 I'm Nestor, your TaskNest assistant. It's lovely to meet you! How can I help you today?",
        "Hi! 😊 Welcome to TaskNest! I'm here to help you organize your life. What can I assist you with?",
        "Hey there! 🌟 Great to see you! I'm Nestor, ready to help with tasks, budgets, and mood tracking. How can I help?",
        "Greetings! 🐦 Wonderful to connect with you! I'm here to make your life more organized. What would you like to know?"
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // Handle gratitude
    else if (isGratitude(lowerInput)) {
      const gratitudeResponses = [
        "You're very welcome! 😊 It's my pleasure to help. Is there anything else you'd like to know about TaskNest?",
        "Happy to help! 🌟 Let me know if there's anything else I can assist you with!",
        "Anytime! 😊 I'm here whenever you need guidance with TaskNest!",
        "My pleasure! 🐦 Don't hesitate to ask if you have more questions!"
      ];
      response = gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)];
    }
    // Handle farewell
    else if (isFarewell(lowerInput)) {
      const farewellResponses = [
        "Goodbye! 👋 It was great chatting with you. Come back anytime you need help with TaskNest!",
        "See you later! 😊 Hope to chat again soon about your TaskNest journey!",
        "Farewell! 🌟 Remember I'm here whenever you need assistance with organizing your life!",
        "Take care! 🐦 Don't hesitate to return if you have more questions about TaskNest!"
      ];
      response = farewellResponses[Math.floor(Math.random() * farewellResponses.length)];
    }
    // Handle simple positive responses
    else if (isPositiveResponse(lowerInput) && lowerInput.split(' ').length <= 3) {
      const positiveResponses = [
        "That's wonderful! 😊 I'm so glad to hear that! What would you like to explore next in TaskNest?",
        "Excellent! 🎉 That makes me happy! How can I help you further today?",
        "Awesome! ✨ I'm thrilled you're enjoying TaskNest! What would you like to do next?",
        "Perfect! 🌟 I'm delighted to hear that! How can I assist you further?"
      ];
      response = positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    }
    // Handle simple negative responses
    else if (isNegativeResponse(lowerInput) && lowerInput.split(' ').length <= 3) {
      const negativeResponses = [
        "I'm sorry to hear that. 😔 How can I make your experience better?",
        "Oh no, I'm sorry things aren't going well. 😟 Please tell me what's wrong so I can help.",
        "I understand this might be frustrating. 💔 Let me know how I can improve things for you.",
        "I'm here to help make things better. 🤗 What's not working for you?"
      ];
      response = negativeResponses[Math.floor(Math.random() * negativeResponses.length)];
    }
    // Handle context-based responses
    else if (conversationContext) {
      switch (conversationContext.type) {
        case 'asked_about_help':
          if (isPositiveResponse(lowerInput)) {
            response = "Fantastic! 😊 I'd be delighted to help! What would you like assistance with?\n\n• Creating and managing tasks\n• Setting up your budget\n• Tracking your mood\n• Account settings\n• Or anything else!";
          } else {
            response = "No problem at all! 😊 I'm here whenever you need me. Is there anything else I can help you with today?";
            newContext = null;
          }
          break;
        
        case 'asked_about_features':
          if (isPositiveResponse(lowerInput)) {
            response = "Wonderful! 😄 Which feature excites you the most?\n\n📋 **Task Manager** - Organize your to-dos\n💰 **Budget Planner** - Track your finances\n😊 **Mood Tracker** - Monitor your wellbeing";
          } else {
            response = "That's completely okay! 😊 Maybe you'd like to know about our pricing, security features, or mobile apps instead?";
            newContext = null;
          }
          break;
        
        case 'asked_about_signup':
          if (isPositiveResponse(lowerInput)) {
            response = "Excellent choice! 🎉 I'm excited for you to get started! Click the 'Sign Up' button in the top right corner. You'll be organizing your life in no time! Need any help with the registration process?";
          } else {
            response = "No worries at all! 😊 Take your time. Would you like to know more about our features or see a demo first?";
            newContext = null;
          }
          break;
        
        default:
          response = handleGeneralResponse(lowerInput, userInput);
          newContext = null;
      }
    }
    // Handle questions and specific queries
    else if (isQuestion(lowerInput) || lowerInput.split(' ').length > 3) {
      response = handleGeneralResponse(lowerInput, userInput);
    }
    // Handle everything else with more engaging responses
    else {
      const engagingResponses = [
        "I'd love to help you with TaskNest! 😊 Could you tell me a bit more about what you're looking for?",
        "That's interesting! 🐦 How can I assist you with TaskNest today?",
        "I'm here to help! 🌟 What would you like to know about TaskNest features?",
        "Great to hear from you! 😊 How can I make your TaskNest experience better?"
      ];
      response = engagingResponses[Math.floor(Math.random() * engagingResponses.length)];
    }

    const botMessage = {
      id: messages.length + 2,
      text: response,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };

    setConversationContext(newContext);
    setMessages(prev => [...prev, botMessage]);
  };

  const handleGeneralResponse = (lowerInput, originalInput) => {
    // Task-related queries
    if (lowerInput.includes('task') || lowerInput.includes('todo') || lowerInput.includes('checklist') || 
        lowerInput.includes('to-do') || lowerInput.includes('reminder') || lowerInput.includes('deadline')) {
      return "Our Task Manager is perfect for organizing your work! 📋\n\nYou can:\n• Create tasks with titles, descriptions, and categories\n• Set priorities (High/Medium/Low) and due dates\n• Organize with drag-and-drop functionality\n• Receive smart reminders and notifications\n• Track completion progress with visual indicators\n\nWould you like help setting up your first task or learning more about task management?";
    }
    
    // Budget-related queries
    if (lowerInput.includes('budget') || lowerInput.includes('money') || lowerInput.includes('finance') || 
        lowerInput.includes('expense') || lowerInput.includes('income') || lowerInput.includes('saving') || 
        lowerInput.includes('bill') || lowerInput.includes('cost')) {
      return "The Budget Planner helps you take control of your finances! 💰\n\nFeatures include:\n• Income and expense tracking with customizable categories\n• Visual charts and spending breakdowns\n• Custom savings goals with progress tracking\n• Bill reminders and payment scheduling\n• Expense forecasting and budgeting tools\n• Exportable financial reports\n• Secure bank-grade encryption\n\nWould you like help setting up your budget or understanding specific features?";
    }
    
    // Mood-related queries
    if (lowerInput.includes('mood') || lowerInput.includes('emotion') || lowerInput.includes('feel') || 
        lowerInput.includes('wellbeing') || lowerInput.includes('mental health') || lowerInput.includes('journal')) {
      return "Our Mood Tracker helps you understand your emotional patterns! 😊\n\nYou can:\n• Record daily emotions with an intuitive emoji scale\n• Add journal entries for context and reflections\n• Identify patterns across time and activities\n• See correlations between mood and productivity\n• Export data for personal review or therapy\n• Keep everything private and secure\n\nWould you like to learn how to start tracking your mood or interpreting your patterns?";
    }
    
    // Account-related queries
    if (lowerInput.includes('sign up') || lowerInput.includes('register') || lowerInput.includes('account') || 
        lowerInput.includes('create account') || lowerInput.includes('join')) {
      setConversationContext({ type: 'asked_about_signup' });
      return "Getting started with TaskNest is easy and exciting! 🚀\n\nHere's how:\n1. Click 'Sign Up' in the top right corner\n2. Enter your email and create a secure password\n3. Verify your email address\n4. Complete your profile setup\n5. Start organizing your life!\n\nWe offer a 30-day free trial with all features included! Would you like to create an account now?";
    }
    
    if (lowerInput.includes('login') || lowerInput.includes('sign in') || lowerInput.includes('access') || 
        lowerInput.includes('password') || lowerInput.includes('forgot')) {
      return "Accessing your account is simple! 🔐\n\n1. Click 'Login' in the top right corner\n2. Enter your email and password\n3. Forgot your password? Use the 'Reset Password' link\n4. Enable two-factor authentication for extra security\n\nNeed help accessing your account or resetting your credentials?";
    }
    
    // Feature-related queries
    if (lowerInput.includes('feature') || lowerInput.includes('what can') || lowerInput.includes('capability') || 
        lowerInput.includes('how does') || lowerInput.includes('what does')) {
      setConversationContext({ type: 'asked_about_features' });
      return "TaskNest offers three powerful features to organize your life: 🌟\n\n📋 **Task Manager**: Comprehensive task organization with priorities, deadlines, and reminders\n💰 **Budget Planner**: Complete financial tracking with visual reports and goal setting\n😊 **Mood Tracker**: Emotional wellbeing monitoring with pattern analysis\n\nAll integrated into one beautiful, seamless dashboard! Would you like to know more about any of these specific features?";
    }
    
    // Help/support queries
    if (lowerInput.includes('help') || lowerInput.includes('support') || lowerInput.includes('problem') || 
        lowerInput.includes('issue') || lowerInput.includes('trouble') || lowerInput.includes('how to')) {
      setConversationContext({ type: 'asked_about_help' });
      return "I'd be happy to help! 🤝 What seems to be the challenge?\n\nI can assist with:\n• Technical issues or bugs\n• Feature explanations and how-to guides\n• Account and billing questions\n• Best practices for using TaskNest\n• Or anything else you're wondering about!\n\nAre you having trouble with a specific feature or something else?";
    }
    
    // Pricing queries
    if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('plan') || 
        lowerInput.includes('subscription') || lowerInput.includes('free') || lowerInput.includes('premium')) {
      return "**TaskNest Pricing Options:** 💜\n\n🎯 **Free Plan**: Basic task management, simple budgeting, and mood tracking (perfect for getting started!)\n💜 **Premium Plan** ($5/month): Unlimited tasks, advanced budgeting, detailed analytics, and premium support\n🏢 **Team Plan** ($8/user/month): Collaboration features, shared projects, admin controls, and priority support\n\nAll plans include: Bank-level security, cross-device sync, and regular updates! Which plan interests you most?";
    }
    
    // Security queries
    if (lowerInput.includes('security') || lowerInput.includes('privacy') || lowerInput.includes('data') || 
        lowerInput.includes('safe') || lowerInput.includes('encryption')) {
      return "Your security is our top priority! 🔒\n\nWe implement:\n• End-to-end encryption for all your data\n• GDPR and CCPA compliance\n• Regular security audits and penetration testing\n• Two-factor authentication option\n• Data never sold to third parties\n• Secure AWS infrastructure with regular backups\n\nYour data belongs to you, and we protect it with industry-best practices!";
    }
    
    // Mobile app queries
    if (lowerInput.includes('mobile') || lowerInput.includes('app') || lowerInput.includes('ios') || 
        lowerInput.includes('android') || lowerInput.includes('phone') || lowerInput.includes('tablet')) {
      return "Yes! TaskNest is available on all your devices: 📱\n\n• **iOS App Store**: Fully native iPhone/iPad app\n• **Google Play Store**: Android app with all features\n• **Progressive Web App**: Works offline on any device\n• **Desktop Apps**: Windows and macOS applications\n\nAll apps sync seamlessly in real-time! Do you need help with mobile setup?";
    }
    
    // Default engaging response
    return "I'd love to help you get the most out of TaskNest! 😊 Could you tell me what you'd like to accomplish? For example, are you looking to organize tasks, track expenses, monitor your mood, or something else?";
  };

  const quickQuestions = [
    "How do I create my first task?",
    "Can I set budget limits?",
    "How does mood tracking work?",
    "Is my data secure?",
    "What's the pricing?",
    "How do I sign up?"
  ];

  const handleQuickQuestion = (question) => {
    setInputText(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.includes('**') ? (
          <strong>{line.replace(/\*\*/g, '')}</strong>
        ) : (
          line
        )}
        <br />
      </span>
    ));
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot toggle button */}
      {!isOpen && (
        <button className="chatbot-toggle" onClick={handleOpen}>
          <FiMessageCircle size={24} />
          <span className="chatbot-pulse"></span>
        </button>
      )}

      {/* Chatbot window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <div className="chatbot-avatar">
                <FiCpu size={20} />
              </div>
              <div>
                <div className="chatbot-name">Nestor</div>
                <div className="chatbot-status">TaskNest Assistant • Online</div>
              </div>
            </div>
            <button className="chatbot-close" onClick={handleOpen}>
              <FiX size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender} ${message.type}`}>
                <div className="message-avatar">
                  {message.sender === 'user' ? <FiUser size={16} /> : <FiCpu size={16} />}
                </div>
                <div className="message-content">
                  <p>{formatMessage(message.text)}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">
                  <FiCpu size={16} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {suggestions && (
            <div className="quick-questions">
              <div className="suggestions-header">
                <FiHelpCircle size={16} />
                <span>Quick questions to get started:</span>
              </div>
              <div className="question-buttons">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="question-btn"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask me about TaskNest..."
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <button className="send-button" onClick={handleSendMessage}>
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);

  // Check if we should show the back button
  const showBackButton = location.state?.showBackButton;

  // Check authentication status on component mount and when location changes
  useEffect(() => {
    checkAuthenticationStatus();
  }, [location]);

  // Function to check if user is logged in
  const checkAuthenticationStatus = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check if this is a redirect after login
        const isRedirectAfterLogin = location.state?.fromLogin;
        if (isRedirectAfterLogin) {
          // Show welcome message
          alert(`Welcome back, ${parsedUser.name || parsedUser.email}!`);
          // Clear the state to avoid showing the message again on refresh
          window.history.replaceState({}, document.title);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      setUser(null);
    }
  };

  // Images for the carousel
  const carouselImages = [
    'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80'
  ];

  // Auto-rotate carousel images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const featureDescriptions = {
    "Task Manager": "Plan your day with detailed to-do lists, recurring reminders, and intelligent suggestions that adapt to your workflow. Stay on top of your tasks effortlessly and boost your daily productivity.",
    "Budget Planner": "Gain full control over your finances. Visualize your income, categorize expenses, and set custom savings goals—all within an intuitive, interactive planner.",
    "Mood Tracker": "Understand your emotional patterns. Record daily moods with context, review trends over time, and identify what activities or times of day affect your well-being."
  };

  const featureDetails = {
    "All-in-One Dashboard": "TaskNest offers a unified platform to manage tasks, finances, and moods—all from one place.",
    "Cloud Synced & Secure": "Your data is always safe and accessible from any device with our secure cloud integration.",
    "Easy to Use, Mobile Friendly": "With a clean UI and responsive design, TaskNest works smoothly on desktops and mobile devices.",
    "Designed for Students & Professionals": "Tailored for productivity, whether you're managing assignments or work projects."
  };

  const handleCardToggle = (cardTitle) => {
    setExpandedCard(prev => (prev === cardTitle ? null : cardTitle));
  };

  const handleFeatureToggle = (feature) => {
    setActiveFeature(prev => (prev === feature ? null : feature));
  };

  const handleLogin = () => navigate('/login');
  const handleSignup = () => navigate('/signup');
  
  // Updated handleGetStarted function
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard'); // Redirect to dashboard if logged in
    } else {
      navigate('/login'); // Redirect to login if not logged in
    }
  };

  // Navigation functions
  const navigateToFeatures = () => {
    navigate('/features', { state: { showBackButton: true } });
  };

  const navigateToAbout = () => {
    navigate('/about', { state: { showBackButton: true } });
  };

  const navigateToContact = () => {
    navigate('/contact', { state: { showBackButton: true } });
  };

  // Logout function
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Clear user state
    setUser(null);
    // Show logout success message
    alert('You have been logged out successfully!');
    // Refresh the page to update the UI
    window.location.reload();
  };

  // Function to get user's full name
  const getUserFullName = () => {
    if (user && user.name) {
      return user.name;
    }
    return 'User';
  };

  // Function to get user's first name for welcome message
  const getUserFirstName = () => {
    if (user && user.name) {
      return user.name.split(' ')[0];
    }
    return 'User';
  };

  return (
    <div className="homepage">
      {/* Back Button (conditionally rendered) */}
      {showBackButton && (
        <button className="back-button" onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to Home
        </button>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">TaskNest</div>
        <ul className="nav-links">
          <li><a onClick={() => navigate('/')} className="nav-link">Home</a></li>
          <li><a onClick={navigateToFeatures} className="nav-link">Features</a></li>
          <li><a onClick={navigateToAbout} className="nav-link">About</a></li>
          <li><a onClick={navigateToContact} className="nav-link">Contact</a></li>
        </ul>
        <div className="auth-buttons">
          {user ? (
            // Show welcome message and logout button when user is logged in
            <div className="user-welcome">
              <span className="welcome-text">Welcome, {getUserFullName()}!</span>
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            // Show login/signup buttons when user is not logged in
            <>
              <button className="login-btn" onClick={handleLogin}>Login</button> 
              <button className="signup-btn" onClick={handleSignup}>Sign up</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section with Image Carousel */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            {user ? `Welcome back, ${getUserFirstName()}!` : 'Organize Your Life the Smart Way'}
          </h1>
          <p>
            {user 
              ? 'Ready to continue organizing your tasks, budget, and mood?' 
              : 'Manage tasks, track budgets, and reflect on your emotions—all in one powerful platform.'
            }
          </p>
          <div className="hero-buttons">
            <button className="get-started start-btn" onClick={handleGetStarted}>
              {user ? 'Continue to Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
        
        <div className="image-carousel">
          {carouselImages.map((image, index) => (
            <div 
              key={index}
              className={`carousel-image ${index === currentImageIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            ></div>
          ))}
          <div className="carousel-dots">
            {carouselImages.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Expandable Cards */}
      <section className="features">
        {Object.entries(featureDescriptions).map(([title, description], index) => {
          const Icon = title === "Task Manager" ? FiCheckCircle
                     : title === "Budget Planner" ? FiDollarSign
                     : FiSmile;

          return (
            <div className="feature-card" key={index} onClick={() => handleCardToggle(title)}>
              <Icon size={40} color="#6a0dad" />
              <h3>{title}</h3>
              {expandedCard === title ? (
                <>
                  <p>{description}</p>
                  <FiChevronUp className="icon" color="#6a0dad" />
                </>
              ) : (
                <>
                  <p>{description.slice(0, 60)}...</p>
                  <FiChevronDown className="icon" color="#6a0dad" />
                </>
              )}
            </div>
          );
        })}
      </section>

      {/* Why TaskNest Section */}
      <section className="why-tasknest">
        <h2>Why Choose TaskNest?</h2>
        <ul>
          {Object.entries(featureDetails).map(([feature, description], index) => (
            <li key={index}>
              <button className="dropdown-btn" onClick={() => handleFeatureToggle(feature)}>
                {feature}
                {activeFeature === feature ? <FiChevronUp className="icon" /> : <FiChevronDown className="icon" />}
              </button>
              <div className={`dropdown-content ${activeFeature === feature ? 'show' : ''}`}>
                {description}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a onClick={() => navigate('/')}>Home</a></li>
            <li><a onClick={navigateToFeatures}>Features</a></li>
            <li><a onClick={navigateToAbout}>About</a></li>
            <li><a onClick={handleLogin}>Login</a></li>
            <li><a onClick={handleSignup}>Sign Up</a></li>
            <li><a onClick={navigateToContact}>Contact Us</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: support@tasknest.com</p>
          <p>Phone: +91-9876543210</p>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#"><FiFacebook size={20} /></a>
            <a href="#"><FiTwitter size={20} /></a>
            <a href="#"><FiInstagram size={20} /></a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 TaskNest. All rights reserved.
        </div>
      </footer>

      {/* Chatbot Component */}
      <Chatbot />
    </div>
  );
};

export default HomePage;
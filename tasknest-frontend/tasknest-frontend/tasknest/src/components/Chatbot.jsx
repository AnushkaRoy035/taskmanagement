import React, { useState, useEffect, useRef } from 'react';
import { 
  FiMessageCircle, 
  FiX, 
  FiUser, 
  FiCpu, 
  FiHelpCircle, 
  FiSend,
  FiStar,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiSmile,
  FiSettings,
  FiDatabase,
  FiCheck,
  FiClock,
  FiTarget,
  FiPieChart,
  FiShoppingBag,
  FiHome,
  FiCoffee,
  FiHeart,
  FiMic,
  FiMicOff,
  FiVolume2,
  FiVolumeX,
  FiDownload,
  FiShare2,
  FiCopy
} from 'react-icons/fi';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Nestor, your intelligent TaskNest assistant! 🐦✨ I can help you with tasks, mood tracking, budget management, and much more. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'welcome'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationContext, setConversationContext] = useState({
    currentTopic: '',
    lastAction: '',
    userPreferences: {},
    followUpQuestions: [],
    budgetAmount: null,
    budgetCategory: ''
  });

  const messagesEndRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition) {
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = false;
      speechRecognitionRef.current.interimResults = false;
      speechRecognitionRef.current.lang = 'en-US';

      speechRecognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      speechRecognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        addSystemMessage(`Voice input error: ${event.error}. Please try again.`);
      };

      speechRecognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if (SpeechSynthesis) {
      synthesisRef.current = SpeechSynthesis;
    } else {
      setSpeechEnabled(false);
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save conversation history
  useEffect(() => {
    if (messages.length > 1) {
      setConversationHistory(messages);
    }
  }, [messages]);

  // Speech synthesis function
  const speakText = (text) => {
    if (!speechEnabled || !synthesisRef.current) return;

    // Clean text for speech (remove emojis and special formatting)
    const cleanText = text.replace(/[🐦✨🎯📊💰📅😊⚡🎉🤔🔧🌟🎪📝🔄🧩🛡️🎯🏆📈⏰📋✅🔄🚨📝📅📊⏱️⚡]/g, '')
                         .replace(/\n/g, '. ')
                         .replace(/[•\-]/g, ', ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    synthesisRef.current.speak(utterance);
  };

  // Toggle speech synthesis
  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (!speechEnabled && synthesisRef.current) {
      synthesisRef.current.cancel();
    }
  };

  // Voice input handler
  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
      addSystemMessage('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        addSystemMessage('Error starting voice input. Please check microphone permissions.');
      }
    }
  };

  // Add system messages
  const addSystemMessage = (text) => {
    const systemMessage = {
      id: messages.length + 1,
      text: text,
      sender: 'system',
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  // Export conversation
  const exportConversation = () => {
    const conversationText = messages.map(msg => 
      `${msg.sender === 'user' ? 'You' : 'Nestor'}: ${msg.text}\n${msg.timestamp.toLocaleString()}`
    ).join('\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nestor-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addSystemMessage('Conversation exported successfully!');
  };

  // Share conversation
  const shareConversation = async () => {
    const conversationText = messages.map(msg => 
      `${msg.sender === 'user' ? 'You' : 'Nestor'}: ${msg.text}`
    ).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Nestor Conversation',
          text: conversationText
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(conversationText).then(() => {
        addSystemMessage('Conversation copied to clipboard!');
      });
    }
  };

  // Extract budget amount from user input - supports rupees
  const extractBudgetAmount = (text) => {
    const budgetRegex = /(₹?|rs\.?|inr\s?)(\d+([,.]\d+)?)/gi;
    const matches = text.match(budgetRegex);
    
    if (matches) {
      // Get the largest number mentioned (likely the budget)
      const amounts = matches.map(match => {
        const cleanAmount = match.replace(/[₹,rs\.\s]/gi, '');
        return parseFloat(cleanAmount);
      });
      
      const maxAmount = Math.max(...amounts);
      return maxAmount > 0 ? maxAmount : null;
    }
    
    // Also check for numbers without currency symbols
    const numberRegex = /\b(\d{3,})\b/g;
    const numberMatches = text.match(numberRegex);
    if (numberMatches) {
      const amounts = numberMatches.map(match => parseInt(match.replace(/,/g, '')));
      const maxAmount = Math.max(...amounts);
      return maxAmount > 999 ? maxAmount : null; // Assume amounts over 999 are budgets
    }
    
    return null;
  };

  // Detect budget category from text with Indian context
  const detectBudgetCategory = (text) => {
    const categories = {
      monthly: ['monthly', 'month', 'per month', 'monthly budget', 'mahine ka'],
      weekly: ['weekly', 'week', 'per week', 'weekly budget', 'haftе ka'],
      daily: ['daily', 'day', 'per day', 'daily budget', 'roz ka'],
      grocery: ['grocery', 'food', 'groceries', 'eating', 'meal', 'kirana', 'ration', 'sabji'],
      entertainment: ['entertainment', 'fun', 'movies', 'games', 'hobbies', 'movie', 'outing', 'party'],
      travel: ['travel', 'vacation', 'trip', 'holiday', 'yatra', 'safar'],
      shopping: ['shopping', 'clothes', 'retail', 'purchase', 'kapde', 'samaan'],
      savings: ['savings', 'save', 'investment', 'invest', 'bachat', 'nivesh'],
      rent: ['rent', 'house rent', 'ghar ka kiraya', 'rental'],
      bills: ['bills', 'utilities', 'electricity', 'mobile', 'internet', 'bill'],
      emergency: ['emergency', 'unexpected', 'rainy day', 'aapatkal'],
      general: ['budget', 'money', 'spending', 'finance', 'paisa']
    };

    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  };

  // Generate personalized budget recommendations for Indian context
  const generateBudgetRecommendations = (amount, category = 'general') => {
    const budgetTemplates = {
      monthly: {
        low: { // Under ₹20,000
          essentials: '55-65%',
          savings: '10-15%', 
          discretionary: '20-30%',
          tips: [
            'Track every expense in a notebook or app',
            'Cook meals at home to save on food costs',
            'Use public transport or carpool when possible',
            'Buy groceries in bulk from local markets'
          ]
        },
        medium: { // ₹20,000-₹50,000
          essentials: '50-60%',
          savings: '15-20%',
          discretionary: '20-30%',
          tips: [
            'Automate your savings transfers',
            'Review OTT subscriptions monthly',
            'Plan weekly meals to reduce food waste',
            'Use UPI for tracking all transactions'
          ]
        },
        high: { // Over ₹50,000
          essentials: '45-55%',
          savings: '20-30%',
          discretionary: '15-25%',
          tips: [
            'Maximize PPF and NPS contributions',
            'Consider mutual fund SIPs for long-term growth',
            'Create specific funds for goals like vacation',
            'Invest in health insurance and term insurance'
          ]
        }
      },
      grocery: {
        low: { 
          essentials: '80%', 
          savings: '10%', 
          discretionary: '10%',
          tips: ['Buy seasonal vegetables', 'Purchase staples in bulk', 'Cook traditional meals at home']
        },
        medium: { 
          essentials: '70%', 
          savings: '15%', 
          discretionary: '15%',
          tips: ['Mix local and branded products', 'Plan weekly menu', 'Use loyalty programs']
        },
        high: { 
          essentials: '60%', 
          savings: '25%', 
          discretionary: '15%',
          tips: ['Include organic options', 'Try meal prep services', 'Balance nutrition with taste']
        }
      },
      general: {
        low: { 
          essentials: '60%', 
          savings: '15%', 
          discretionary: '25%',
          tips: ['Use cash envelope system', 'Track daily expenses', 'Avoid impulse purchases']
        },
        medium: { 
          essentials: '50%', 
          savings: '20%', 
          discretionary: '30%',
          tips: ['Use budgeting apps', 'Set financial goals', 'Review spending weekly']
        },
        high: { 
          essentials: '40%', 
          savings: '30%', 
          discretionary: '30%',
          tips: ['Diversify investments', 'Plan for taxes', 'Create emergency fund']
        }
      }
    };

    // Determine budget level for Indian context
    let level = 'medium';
    if (amount < 20000) level = 'low';
    if (amount > 50000) level = 'high';

    const template = budgetTemplates[category]?.[level] || budgetTemplates.general[level];
    
    const essentialsAmount = Math.round(amount * (parseInt(template.essentials) / 100));
    const savingsAmount = Math.round(amount * (parseInt(template.savings) / 100));
    const discretionaryAmount = Math.round(amount * (parseInt(template.discretionary) / 100));

    return {
      essentials: essentialsAmount,
      savings: savingsAmount,
      discretionary: discretionaryAmount,
      percentages: template,
      tips: template.tips || [
        'Track your spending daily using apps like MoneyView',
        'Review budget every Sunday',
        'Adjust allocations based on actual expenses'
      ]
    };
  };

  // Format currency in Indian style with commas
  const formatIndianCurrency = (amount) => {
    return '₹' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Enhanced budget response generation for Indian context
  const generateBudgetResponse = (userInput, amount, category) => {
    const budgetData = generateBudgetRecommendations(amount, category);
    const formattedAmount = formatIndianCurrency(amount);
    
    const budgetResponses = [
      `💰 Smart Budget Breakdown for ${formattedAmount}\n\n` +
      `Yeh hai aapke ${category} budget ki recommended allocation:\n\n` +
      `🏠 Essentials & Needs: ${formatIndianCurrency(budgetData.essentials)} (${budgetData.percentages.essentials})\n` +
      `💾 Savings & Investments: ${formatIndianCurrency(budgetData.savings)} (${budgetData.percentages.savings})\n` +
      `🎯 Wants & Lifestyle: ${formatIndianCurrency(budgetData.discretionary)} (${budgetData.percentages.discretionary})\n\n` +
      `Pro Tips:\n• ${budgetData.tips.join('\n• ')}`,

      `🎯 Personalized Budget Plan: ${formattedAmount}\n\n` +
      `Aapke ${category} budget ke liye optimized allocation:\n\n` +
      `📊 Necessities: ${formatIndianCurrency(budgetData.essentials)} - Rent, bills, groceries, transport\n` +
      `🚀 Future You: ${formatIndianCurrency(budgetData.savings)} - Emergency fund, investments, goals\n` +
      `✨ Quality of Life: ${formatIndianCurrency(budgetData.discretionary)} - Dining, entertainment, personal care\n\n` +
      `Success Strategies:\n• ${budgetData.tips.join('\n• ')}`,

      `📈 Financial Mastery: ${formattedAmount} Budget\n\n` +
      `Har rupee ka sahi istemal! Recommended allocation:\n\n` +
      `🔐 Must-Pay Items: ${formatIndianCurrency(budgetData.essentials)} (${budgetData.percentages.essentials})\n` +
      `🌱 Wealth Building: ${formatIndianCurrency(budgetData.savings)} (${budgetData.percentages.savings})\n` +
      `🎪 Life Enjoyment: ${formatIndianCurrency(budgetData.discretionary)} (${budgetData.percentages.discretionary})\n\n` +
      `Expert Advice:\n• ${budgetData.tips.join('\n• ')}`
    ];

    return budgetResponses[Math.floor(Math.random() * budgetResponses.length)];
  };

  // Task management advice generator
  const generateTaskManagementAdvice = (userInput) => {
    const taskCountMatch = userInput.match(/(\d+)\s*task/);
    const taskCount = taskCountMatch ? parseInt(taskCountMatch[1]) : 5;
    const timeFrame = userInput.includes('week') ? 'week' : 'month';
    
    const taskAdvice = {
      week: [
        `📅 Managing ${taskCount} Tasks This Week:\n\n` +
        `Monday: Start with 1-2 high-priority tasks to build momentum\n` +
        `Tuesday: Tackle the most challenging task\n` +
        `Wednesday: Balance with medium-priority tasks\n` +
        `Thursday: Complete remaining tasks and review progress\n` +
        `Friday: Finish any pending tasks and plan for next week\n\n` +
        `Pro Tip: Use time blocking - assign specific 2-hour slots for focused work!`,

        `🎯 Weekly Task Strategy for ${taskCount} Tasks:\n\n` +
        `• Prioritize: Identify 2 critical tasks that will make the biggest impact\n` +
        `• Schedule: Spread tasks evenly across the week\n` +
        `• Batch: Group similar tasks together\n` +
        `• Review: Daily 10-minute planning session\n` +
        `• Buffer: Keep 1-2 slots open for unexpected tasks\n\n` +
        `Success Rate: This approach increases completion by 72%!`,

        `⚡ Efficient Weekly Plan for ${taskCount} Tasks:\n\n` +
        `Morning Focus (3-4 tasks):\n• Deep work sessions 9-11 AM\n• Creative tasks when fresh\n\n` +
        `Afternoon Execution (1-2 tasks):\n• Administrative work\n• Meetings and follow-ups\n\n` +
        `Weekly Review: Sunday planning session to set up the week`
      ],
      month: [
        `📊 Monthly Task Management for ${taskCount} Tasks:\n\n` +
        `Week 1: Foundation & Planning (1-2 tasks)\n` +
        `Week 2: Execution Phase (2-3 tasks)\n` +
        `Week 3: Progress Review & Adjustment (1-2 tasks)\n` +
        `Week 4: Completion & Preparation (remaining tasks)\n\n` +
        `Monthly Tip: Break large tasks into weekly milestones!`,

        `🗓️ ${taskCount} Tasks Monthly Roadmap:\n\n` +
        `• First 10 days: Complete 40% of tasks\n` +
        `• Mid-month: Review and adjust priorities\n` +
        `• Last 10 days: Finish all tasks with buffer time\n` +
        `• Month-end: Plan for next month\n\n` +
        `Strategy: Use the 1-3-5 rule: 1 big, 3 medium, 1 small task per week`,

        `🌙 Monthly Productivity System:\n\n` +
        `For ${taskCount} tasks over a month:\n` +
        `• Weekly goals instead of daily pressure\n` +
        `• Progress tracking every Friday\n` +
        `• Flexible scheduling for unexpected events\n` +
        `• Celebration of small wins each week\n\n` +
        `Result: Sustainable progress without burnout!`
      ]
    };

    return taskAdvice[timeFrame][Math.floor(Math.random() * taskAdvice[timeFrame].length)];
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSuggestions(true);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

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

    setTimeout(() => {
      generateBotResponse(inputText);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Advanced mood detection
  const detectMoodFromText = (text) => {
    const moodPatterns = {
      happy: ['happy', 'good', 'great', 'awesome', 'excited', 'joy', 'fantastic', 'amazing', 'wonderful', 'delighted', 'khush'],
      sad: ['sad', 'bad', 'terrible', 'awful', 'upset', 'depressed', 'miserable', 'down', 'unhappy', 'udaas'],
      stressed: ['stressed', 'anxious', 'overwhelmed', 'pressure', 'busy', 'hectic', 'worried', 'tense', 'tanaav'],
      tired: ['tired', 'exhausted', 'sleepy', 'fatigued', 'burned out', 'drained', 'weary', 'thaka hua'],
      neutral: ['okay', 'fine', 'alright', 'normal', 'regular', 'average', 'theek'],
      productive: ['productive', 'focused', 'efficient', 'accomplished', 'achieved', 'motivated'],
      creative: ['creative', 'inspired', 'innovative', 'artistic', 'imaginative'],
      relaxed: ['relaxed', 'calm', 'peaceful', 'chill', 'serene', 'aaraam']
    };

    for (const [mood, words] of Object.entries(moodPatterns)) {
      if (words.some(word => text.toLowerCase().includes(word))) {
        return mood;
      }
    }
    return 'neutral';
  };

  // Enhanced response generation with conversation handling
  const generateBotResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    let response = '';
    let responseType = 'text';
    let actions = [];
    let followUpQuestions = [];

    // Handle voice input acknowledgement
    if (isListening) {
      response = "I heard you! Let me process that...";
    }

    // Handle thank you responses - UPDATED
    else if (/(thank you|thanks|thankyou|dhanyavad|shukriya)/i.test(lowerInput)) {
      const thankYouResponses = [
        "Welcome! 😊",
        "Welcome! 🎉",
        "Welcome! 🌟",
        "Welcome! 🐦"
      ];
      response = thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
      setConversationContext(prev => ({ ...prev, currentTopic: 'gratitude' }));
    }
    // Handle bye responses - UPDATED
    else if (/(bye|goodbye|see you|take care|bye bye)/i.test(lowerInput)) {
      const byeResponses = [
        "Bye bye! 👋",
        "Bye bye! 😊",
        "Bye bye! 🐦",
        "Bye bye! 🌟"
      ];
      response = byeResponses[Math.floor(Math.random() * byeResponses.length)];
      setConversationContext(prev => ({ ...prev, currentTopic: 'farewell' }));
    }
    // Handle yes responses
    else if (/(yes|yeah|yep|sure|ok|okay|haan|ji haan)/i.test(lowerInput)) {
      const yesResponses = [
        "Great! Let's continue. What would you like to do next?",
        "Perfect! I'm ready when you are. What's our next step?",
        "Awesome! What would you like to explore now?",
        "Excellent! How can I assist you further?"
      ];
      response = yesResponses[Math.floor(Math.random() * yesResponses.length)];
    }
    // Handle no responses
    else if (/(no|nope|nah|not really|ji nahi|nahi)/i.test(lowerInput)) {
      const noResponses = [
        "No problem! Let me know if you change your mind or need help with something else.",
        "Understood! I'm here whenever you need assistance.",
        "That's alright! Feel free to ask if you need anything later.",
        "Okay! Remember, I can help with tasks, budgets, mood tracking, and productivity."
      ];
      response = noResponses[Math.floor(Math.random() * noResponses.length)];
    }
    // Voice command recognition
    else if (/(voice|speak|talk|mic|microphone)/i.test(lowerInput)) {
      response = "I support voice input! Click the microphone icon 🎤 to speak your message. For voice output, use the speaker icon 🔈 to toggle text-to-speech.";
      actions = ['Start voice input', 'Toggle speech output', 'Voice commands help'];
    }
    // Task management queries - handle multiple tasks
    else if (/(manage|handle|organize|plan|schedule).*(\d+).*(task|work|project)/i.test(lowerInput) || 
             /(\d+).*(task|work).*(week|month)/i.test(lowerInput) ||
             /how to.*(\d+).*task/i.test(lowerInput)) {
      response = generateTaskManagementAdvice(userInput);
      actions = [
        'Create task schedule',
        'Set priority levels',
        'Break into subtasks',
        'Set reminders'
      ];
      setConversationContext(prev => ({ 
        ...prev, 
        currentTopic: 'task_management',
        lastAction: 'task_planning'
      }));
    }
    // Budget and finance queries with amount extraction
    else if (/(budget|money|expense|spending|save|cost|finance|financial|₹|rs|inr|\d+)/i.test(lowerInput)) {
      const budgetAmount = extractBudgetAmount(userInput);
      const budgetCategory = detectBudgetCategory(userInput);
      
      if (budgetAmount) {
        // User provided a specific budget amount
        response = generateBudgetResponse(userInput, budgetAmount, budgetCategory);
        actions = [
          'Create budget tracker', 
          'Set savings goal', 
          'Track expenses', 
          'Adjust allocation'
        ];
        
        setConversationContext(prev => ({ 
          ...prev, 
          currentTopic: 'budget_planning',
          budgetAmount: budgetAmount,
          budgetCategory: budgetCategory
        }));
      } else {
        // General budget discussion without specific amount
        const budgetResponses = [
          "💰 Financial wellness is crucial! I'd love to help you create a personalized budget. Could you tell me your budget amount? For example: 'Mera budget ₹2000 hai' or 'Mere paas ₹5000 monthly budget hai'",
          "💸 Let's create a budget that works for you! To give you the best recommendations, please share your budget amount. Something like: 'I want to budget ₹1500' or 'My monthly budget is ₹30000'",
          "📊 Ready to optimize your finances! To provide specific advice, I need to know your budget amount. Try: 'Budget: ₹8000' or 'I have ₹25000 to allocate'"
        ];
        response = budgetResponses[Math.floor(Math.random() * budgetResponses.length)];
        actions = ['View budget templates', 'Learn budgeting methods', 'Track spending patterns'];
        
        setConversationContext(prev => ({ ...prev, currentTopic: 'budget_management' }));
      }
    }
    // Greeting patterns
    else if (/(hello|hi|hey|greetings|good morning|good afternoon|namaste)/i.test(lowerInput)) {
      const greetings = [
        "Hello there! 🐦 I'm Nestor, ready to help you organize your day. What would you like to tackle first?",
        "Hi! 👋 Nestor here. I see you're ready to be productive today. Where shall we start?",
        "Good day! 🌟 I'm Nestor, your productivity companion. What's on your mind today?",
        "Namaste! 🙏 Nestor at your service. Ready to make today amazing? What can I help you with?"
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];
      setConversationContext(prev => ({ ...prev, currentTopic: 'greeting' }));
    }
    // Task creation queries
    else if (/(add|create|new|schedule|remind|set up|make).*(task|todo|reminder|event)/i.test(lowerInput) || 
             /(need to|want to|should).*(do|complete|finish)/i.test(lowerInput)) {
      const taskTemplates = [
        {
          response: "📝 Perfect! Let's create that task. Based on your message, I suggest setting it as a medium priority task. Would you like me to add it to your 'Work' category or would you prefer a different category?",
          actions: ['Add to Work category', 'Choose different category', 'Set high priority', 'Add detailed description']
        },
        {
          response: "🎯 Great initiative! Creating this task is the first step toward accomplishment. I recommend breaking it down into smaller steps if it's complex. Want me to help you create subtasks?",
          actions: ['Create main task', 'Break into subtasks', 'Set deadline', 'Add to calendar']
        }
      ];
      const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
      response = template.response;
      actions = template.actions;
      
      setConversationContext(prev => ({ 
        ...prev, 
        currentTopic: 'task_creation',
        lastAction: 'task_extraction'
      }));
    }
    // Mood-related queries
    else if (/(feel|feeling|mood|emotion|happy|sad|stressed|anxious|tired|excited)/i.test(lowerInput)) {
      const detectedMood = detectMoodFromText(userInput);
      const moodResponses = {
        happy: [
          "That's wonderful to hear! 😊 Positive emotions like this are perfect for tackling challenging tasks. Research shows we're 12% more productive when we're happy!",
          "Fantastic! 🎉 Happiness boosts creativity and problem-solving. This is a great time to work on that project you've been putting off!"
        ],
        sad: [
          "I'm sorry you're feeling this way. 😔 Remember, it's completely normal to have down days. Even the most successful people experience them.",
          "Thank you for sharing that. 🤗 Difficult emotions are part of being human. Sometimes just acknowledging them can be helpful."
        ],
        stressed: [
          "I sense the pressure. 🌀 Stress affects 83% of workers, so you're not alone. Let's break things down into manageable pieces.",
          "That sounds overwhelming. 🎯 When I feel stressed, I find the 'one thing at a time' approach really helps. What's the most pressing item?"
        ],
        tired: [
          "Rest is productivity! 😴 Even top CEOs prioritize sleep. A 20-minute power nap could boost your performance by 34%.",
          "Your body is telling you something important. 🌙 Fatigue is often our system's way of asking for recharge. Hydration helps too!"
        ]
      };
      const moodResponseArray = moodResponses[detectedMood] || ["Thanks for sharing how you're feeling. Self-awareness is the first step toward improvement."];
      response = moodResponseArray[Math.floor(Math.random() * moodResponseArray.length)];
      actions = ['Log this mood', 'See mood insights', 'Get activity suggestions', 'Set wellness reminder'];
      
      setConversationContext(prev => ({ 
        ...prev, 
        currentTopic: 'mood_tracking',
        detectedMood: detectedMood
      }));
    }
    // Productivity and analytics
    else if (/(productivity|efficient|stats|analytics|report|progress|performance)/i.test(lowerInput)) {
      const productivityResponses = [
        "📊 Productivity insights coming up! The most productive people work in 90-minute focused blocks with 20-minute breaks. How does your schedule compare?",
        "⚡ Efficiency analysis time! Did you know multitasking can reduce productivity by 40%? Let's optimize your workflow.",
        "🎪 Productivity unlocked! The average worker is only productive for 2 hours and 53 minutes daily. Let's beat that average!"
      ];
      response = productivityResponses[Math.floor(Math.random() * productivityResponses.length)];
      actions = ['View weekly report', 'Analyze time usage', 'Set focus goals', 'Get optimization tips'];
      
      setConversationContext(prev => ({ ...prev, currentTopic: 'productivity_analytics' }));
    }
    // Calendar and scheduling
    else if (/(calendar|schedule|appointment|meeting|event|availability)/i.test(lowerInput)) {
      const schedulingResponses = [
        "📅 Time management expert here! The most effective schedulers leave 25% of their time open for unexpected tasks. How's your buffer time?",
        "🕐 Scheduling mode activated! Back-to-back meetings can reduce creative thinking by 60%. Let's space things out strategically."
      ];
      response = schedulingResponses[Math.floor(Math.random() * schedulingResponses.length)];
      actions = ['View weekly calendar', 'Find focus time', 'Schedule deep work', 'Optimize meetings'];
      
      setConversationContext(prev => ({ ...prev, currentTopic: 'calendar_management' }));
    }
    // Help and features
    else if (/(help|what can you do|features|capabilities|how to|tutorial)/i.test(lowerInput)) {
      const helpResponses = [
        `🔧 Nestor's Superpowers! 🦸

• 📝 Task Mastery - Smart task creation with AI-powered suggestions
• 😊 Mood Intelligence - Emotional tracking with science-backed insights  
• 💰 Financial Wizardry - Budget planning that actually works
• 📅 Time Alchemy - Schedule optimization using productivity science
• 📊 Analytics Engine - Personal performance metrics and trends
• 🎯 Goal Crusher - Achievement system with milestone tracking
• 🎤 Voice Control - Speak your messages and hear responses
• 💾 Export & Share - Save and share conversations

What would you like to master first?`,

        `🌟 Your Productivity Companion! 

I'm like having a personal coach, financial advisor, and project manager all in one! Here's what we can do together:

• Turn overwhelming projects into manageable steps
• Transform financial anxiety into clear action plans
• Convert chaotic schedules into organized systems
• Change mood tracking into self-awareness growth
• Turn goals into achieved accomplishments
• Use voice commands for hands-free operation
• Export your progress and insights

Which area needs the most attention right now?`
      ];
      response = helpResponses[Math.floor(Math.random() * helpResponses.length)];
      actions = ['Task system tutorial', 'Mood tracking guide', 'Budget setup walkthrough', 'Voice commands help'];
      
      setConversationContext(prev => ({ ...prev, currentTopic: 'help_features' }));
    }
    // Goal setting and planning
    else if (/(goal|plan|objective|target|achieve|accomplish)/i.test(lowerInput)) {
      const goalResponses = [
        `🎯 Goal Achievement Engine Activated!

People who write down their goals are 42% more likely to achieve them. Let's make yours concrete:

1. Specific - Crystal clear what success looks like
2. Measurable - Track progress with numbers
3. Achievable - Challenging but realistic  
4. Relevant - Aligns with your values
5. Time-bound - Clear deadline for urgency

Which goal shall we craft together?`,

        `🏆 Goal-Setting Mastery Time!

Did you know breaking big goals into small tasks increases completion rates by 76%? 

Example: Instead of "Get fit" → "Walk 30 minutes 4x this week"

What big dream can we break down into achievable steps today?`
      ];
      response = goalResponses[Math.floor(Math.random() * goalResponses.length)];
      actions = ['Set SMART goal', 'Break down big goal', 'Track existing goal', 'Get motivation system'];
      
      setConversationContext(prev => ({ ...prev, currentTopic: 'goal_setting' }));
    }
    // Subtasks and project management
    else if (/(subtask|break down|steps|project|phase)/i.test(lowerInput)) {
      const subtaskResponses = [
        "🔄 Task Deconstruction Mode! Breaking complex tasks into smaller steps reduces procrastination by 65%. Let's slice and dice your project!",
        "🧩 Project Puzzle Master! Every big project is just a series of small tasks. The key is identifying the right 20% that delivers 80% of results."
      ];
      response = subtaskResponses[Math.floor(Math.random() * subtaskResponses.length)];
      actions = ['Break into 3 steps', 'Create detailed checklist', 'Set milestone dates', 'Assign priorities'];
      
      setConversationContext(prev => ({ ...prev, currentTopic: 'subtask_creation' }));
    }
    // Time management and focus
    else if (/(focus|concentrate|distract|procrastinate|time management)/i.test(lowerInput)) {
      const focusResponses = [
        "🎯 Deep Focus Protocol! The average person gets interrupted every 11 minutes. It takes 25 minutes to regain deep focus. Let's protect your concentration!",
        "🛡️ Focus Shield Activated! Digital distractions cost the economy $650 billion annually. Let's reclaim your attention with these strategies..."
      ];
      response = focusResponses[Math.floor(Math.random() * focusResponses.length)];
      actions = ['Schedule focus blocks', 'Set up Pomodoro timer', 'Create distraction-free zone', 'Get concentration tips'];
      
      setConversationContext(prev => ({ ...prev, currentTopic: 'focus_management' }));
    }
    // Fallback with contextual help
    else {
      const fallbackResponses = [
        "🤔 Interesting question! While I process that, I'm really good at helping with task management, mood tracking, budget planning, and productivity optimization. Which area interests you most?",
        "🎪 Let me think about that! In the meantime, I specialize in turning chaos into order - whether it's your schedule, tasks, finances, or goals. What's most pressing right now?",
        "🔍 Processing your query! I'm designed to be your productivity partner - helping you achieve more with less stress. What would make the biggest difference in your week?"
      ];
      response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      actions = ['Task management', 'Mood tracking', 'Budget help', 'Voice commands'];
    }

    const botMessage = {
      id: messages.length + 2,
      text: response,
      sender: 'bot',
      timestamp: new Date(),
      type: responseType,
      actions: actions,
      followUpQuestions: followUpQuestions,
      context: { 
        lastInput: userInput, 
        detectedMood: detectMoodFromText(userInput),
        currentTopic: conversationContext.currentTopic,
        budgetAmount: conversationContext.budgetAmount,
        budgetCategory: conversationContext.budgetCategory
      }
    };

    setMessages(prev => [...prev, botMessage]);

    // Speak the response if speech is enabled
    if (speechEnabled) {
      speakText(response);
    }
  };

  const handleActionClick = (action, context) => {
    const formattedAmount = context?.budgetAmount ? formatIndianCurrency(context.budgetAmount) : 'current';
    
    const actionResponses = {
      'Log this mood': "📊 Mood logged successfully! I've recorded your current emotional state. Would you like to add any notes about what's contributing to this mood?",
      'See mood insights': "📈 Mood insights ready! Your mood patterns show that you're most productive 2 hours after positive entries. Want to see your weekly mood trends?",
      'Get activity suggestions': "🎯 Activity suggestions based on your mood:\n\n• Gentle walk in nature (15 mins)\n• Listen to uplifting music\n• Practice deep breathing (5 mins)\n• Write in a gratitude journal\n\nWhich activity would you like to try first?",
      'Set wellness reminder': "⏰ Wellness reminder set! I'll check in with you tomorrow to see how you're feeling. Would you like daily or weekly wellness check-ins?",
      'Create budget tracker': `📊 Budget tracker created! I've set up categories based on your ${formattedAmount} budget. Want to customize the categories or set up automatic tracking?`,
      'Track expenses': "📈 Expense tracking activated! I'll help you monitor spending patterns. Would you like daily, weekly, or monthly reports?",
      'Adjust allocation': "🔄 Let's optimize your budget allocation! Which category would you like to adjust: Essentials, Savings, or Discretionary spending?",
      'Set savings goal': `💰 Excellent! Setting specific savings goals increases success rates. For your ${formattedAmount} budget, what's your target?`,
      'Create task schedule': "📅 Task schedule created! I've optimized your timeline based on priority and deadlines. Want to add specific time blocks?",
      'Set priority levels': "🎯 Priority levels set! I've categorized your tasks as High, Medium, and Low priority. Ready to start with the most important ones?",
      'Break into subtasks': "🧩 Perfect! Let's break your tasks into manageable steps. Most tasks work well with 3-5 subtasks. Want me to suggest the breakdown?",
      'Set reminders': "⏰ Reminders configured! I'll notify you before deadlines and help you stay on track. Want to customize the notification times?",
      'Add to Work category': "✅ Added to Work category! I've set a default reminder for 2 days before the deadline. Want to add specific project tags or team members?",
      'Choose different category': "🔄 Let's choose the perfect category! Available options: Personal, Work, Shopping, Health. Which one fits best?",
      'Set high priority': "🚨 High priority set! This task will now appear at the top of your list with urgent notifications. Want to set a specific deadline?",
      'Add detailed description': "📝 Ready for details! Please describe what exactly needs to be done, any specific requirements, or context for this task.",
      'Create main task': "📋 Main task created! I've set it up with medium priority. Would you like to add subtasks or set a specific deadline?",
      'Add to calendar': "📅 Added to your calendar! I've scheduled it for the most productive time slot. Want to set up preparation reminders too?",
      'View weekly report': "📊 Your weekly insights are ready! You completed 78% of planned tasks (above the 65% average). Biggest win: 92% completion on high-priority items!",
      'Analyze time usage': "⏱️ Time analysis complete! You spent 42% on deep work, 28% on meetings, and 30% on administrative tasks. Want optimization tips?",
      'Set focus goals': "🎯 Focus goals configured! I recommend 3 hours of deep work daily. Want to schedule specific focus blocks in your calendar?",
      'Get optimization tips': "⚡ Optimization tips ready! Based on your patterns:\n• Batch similar tasks together\n• Use Pomodoro technique (25min work/5min break)\n• Schedule creative work in mornings\n\nWhich tip would you like to implement first?",
      'Start voice input': "🎤 Click the microphone button to start speaking. I'll convert your speech to text. Make sure to allow microphone permissions when prompted.",
      'Toggle speech output': speechEnabled ? "🔈 Speech output disabled. I'll only show text responses now." : "🔊 Speech output enabled! I'll read my responses aloud.",
      'Voice commands help': `🎤 Voice Commands Guide:\n\n• Speak naturally about tasks, budgets, or mood\n• Use numbers like "₹5000 budget" or "5 tasks this week"\n• Say "thank you", "yes", "no" for quick responses\n• Click the mic icon and speak clearly\n• Available in Chrome, Edge, and Safari`
    };

    const response = actionResponses[action] || `I've set up "${action}" with optimized settings. Would you like to customize any details?`;

    // Handle special actions
    if (action === 'Toggle speech output') {
      toggleSpeech();
    }
    if (action === 'Start voice input') {
      toggleListening();
    }

    const botMessage = {
      id: messages.length + 1,
      text: response,
      sender: 'bot',
      timestamp: new Date(),
      type: 'action_response'
    };

    setMessages(prev => [...prev, botMessage]);

    // Speak the response if speech is enabled
    if (speechEnabled && action !== 'Toggle speech output') {
      speakText(response);
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const quickQuestions = [
    "How to manage 5-6 tasks this week?",
    "My budget is ₹2000 - how should I spend it?",
    "I have ₹15000 monthly budget",
    "Help me budget ₹5000 for groceries",
    "How to allocate ₹30000 savings?",
    "Create ₹8000 entertainment budget",
    "Budget planning for ₹25000 income",
    "How do I create effective tasks?",
    "I'm feeling overwhelmed today",
    "What's my productivity pattern?",
    "How to use voice commands?",
    "Export this conversation"
  ];

  const handleQuickQuestion = (question) => {
    if (question === "Export this conversation") {
      exportConversation();
    } else if (question === "How to use voice commands?") {
      handleActionClick('Voice commands help');
    } else {
      setInputText(question);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle" onClick={handleOpen}>
          <FiMessageCircle size={24} />
          <span className="chatbot-pulse"></span>
          <div className="chatbot-tooltip">Chat with Nestor</div>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <div className="chatbot-avatar">
                <FiCpu size={20} />
              </div>
              <div>
                <div className="chatbot-name">Nestor AI</div>
                <div className="chatbot-status">
                  <span className="status-dot"></span>
                  Productivity & Budget Expert • Online
                </div>
              </div>
            </div>
            <div className="chatbot-controls">
              <button 
                className={`control-btn ${speechEnabled ? 'active' : ''}`}
                onClick={toggleSpeech}
                title={speechEnabled ? "Disable speech" : "Enable speech"}
              >
                {speechEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
              </button>
              <button 
                className="control-btn"
                onClick={exportConversation}
                title="Export conversation"
              >
                <FiDownload size={16} />
              </button>
              <button 
                className="control-btn"
                onClick={shareConversation}
                title="Share conversation"
              >
                <FiShare2 size={16} />
              </button>
              <button className="chatbot-close" onClick={handleOpen}>
                <FiX size={20} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender} ${message.type}`}>
                <div className="message-avatar">
                  {message.sender === 'user' ? 
                    <FiUser size={16} /> : 
                    message.sender === 'system' ?
                    <FiSettings size={16} /> :
                    <div className="bot-avatar">
                      <FiCpu size={14} />
                    </div>
                  }
                </div>
                <div className="message-content">
                  <p>{formatMessage(message.text)}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {message.actions && message.actions.length > 0 && (
                    <div className="action-buttons">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          className="action-btn"
                          onClick={() => handleActionClick(action, message.context)}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">
                  <div className="bot-avatar">
                    <FiCpu size={14} />
                  </div>
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

          {suggestions && (
            <div className="quick-questions">
              <div className="suggestions-header">
                <FiHelpCircle size={16} />
                <span>Quick actions & questions:</span>
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
            <button 
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title="Voice input"
            >
              {isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}
            </button>
            <input
              type="text"
              placeholder="Ask Nestor about budgets in ₹, tasks, mood, productivity... or click mic to speak"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="send-button" 
              onClick={handleSendMessage}
              disabled={inputText.trim() === ''}
            >
              <FiSend size={18} />
            </button>
          </div>

          <div className="chatbot-footer">
            <div className="capabilities">
              <FiStar size={12} />
              <span>Nestor can help with: Budgets • Tasks • Mood • Schedule • Analytics • Goals • Voice</span>
            </div>
            <div className="voice-status">
              {isListening && <span className="pulse-dot"></span>}
              {isListening ? 'Listening...' : speechEnabled ? 'Voice enabled' : 'Text only'}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chatbot-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chatbot-toggle {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .chatbot-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
        }

        .chatbot-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(102, 126, 234, 0.4);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .chatbot-tooltip {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: #333;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          margin-bottom: 10px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .chatbot-toggle:hover .chatbot-tooltip {
          opacity: 1;
          transform: translateY(0);
        }

        .chatbot-window {
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chatbot-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chatbot-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chatbot-avatar {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatbot-name {
          font-weight: 600;
          font-size: 16px;
        }

        .chatbot-status {
          font-size: 11px;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .chatbot-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .control-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 6px;
          color: white;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .control-btn.active {
          background: rgba(255, 255, 255, 0.3);
        }

        .chatbot-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 6px;
          color: white;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chatbot-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .chatbot-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f8fafc;
        }

        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: #667eea;
          color: white;
        }

        .message.bot .message-avatar {
          background: #e2e8f0;
          color: #64748b;
        }

        .message.system .message-avatar {
          background: #f59e0b;
          color: white;
        }

        .bot-avatar {
          background: #e2e8f0;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-content {
          max-width: 70%;
          background: white;
          padding: 12px 16px;
          border-radius: 18px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .message.user .message-content {
          background: #667eea;
          color: white;
          border-bottom-right-radius: 6px;
        }

        .message.bot .message-content {
          border-bottom-left-radius: 6px;
          background: white;
        }

        .message.system .message-content {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #92400e;
          border-bottom-left-radius: 6px;
        }

        .message-content p {
          margin: 0;
          font-size: 14px;
          line-height: 1.4;
          white-space: pre-line;
        }

        .message-time {
          font-size: 10px;
          opacity: 0.6;
          margin-top: 4px;
          display: block;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .action-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 6px 12px;
          font-size: 11px;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #cbd5e1;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .quick-questions {
          padding: 16px 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .suggestions-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .question-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .question-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 8px 12px;
          font-size: 11px;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .question-btn:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .chatbot-input {
          padding: 16px 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .voice-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .voice-btn:hover {
          background: #e2e8f0;
          transform: scale(1.05);
        }

        .voice-btn.listening {
          background: #fee2e2;
          border-color: #fecaca;
          color: #dc2626;
          animation: pulse 1s infinite;
        }

        .chatbot-input input {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 12px 16px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .chatbot-input input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .send-button {
          background: #667eea;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          background: #5a6fd8;
          transform: scale(1.05);
        }

        .send-button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
        }

        .chatbot-footer {
          padding: 12px 20px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #64748b;
        }

        .capabilities {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .voice-status {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: #dc2626;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        /* Scrollbar styling */
        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
import React, { useState, useEffect, useRef } from 'react';
import './MoodTracker.css';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const MoodTracker = ({ onMoodUpdate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [moodData, setMoodData] = useState({
    date: new Date().toISOString().split('T')[0],
    overallMood: '',
    happinessLevel: 0,
    sadnessLevel: 0,
    energyLevel: 0,
    stressLevel: 0,
    sleepQuality: '',
    sleepHours: 7,
    exercise: false,
    exerciseDuration: 0,
    socialInteraction: '',
    productivity: '',
    meals: 0,
    waterIntake: 0,
    positiveEvents: [],
    challenges: [],
    moodTriggers: [],
    copingStrategies: [],
    gratitude: [],
    goalsAchieved: [],
    notes: ''
  });

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'table'
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', '3months', 'all'
  const [moodTrend, setMoodTrend] = useState({ trend: 'neutral', direction: 0, average: 0 });
  const chartContainerRef = useRef(null);

  const moodQuestions = [
    {
      type: 'overall',
      question: "How are you feeling overall today?",
      options: [
        { value: 'excellent', emoji: '🤩', label: 'Excellent' },
        { value: 'good', emoji: '😊', label: 'Good' },
        { value: 'neutral', emoji: '😐', label: 'Neutral' },
        { value: 'poor', emoji: '😔', label: 'Poor' },
        { value: 'terrible', emoji: '😢', label: 'Terrible' }
      ]
    },
    {
      type: 'scale',
      question: "On a scale of 1-10, how happy do you feel?",
      field: 'happinessLevel',
      min: 1,
      max: 10
    },
    {
      type: 'scale',
      question: "On a scale of 1-10, how sad do you feel?",
      field: 'sadnessLevel',
      min: 1,
      max: 10
    },
    {
      type: 'scale',
      question: "What's your energy level today?",
      field: 'energyLevel',
      min: 1,
      max: 10
    },
    {
      type: 'scale',
      question: "How stressed do you feel?",
      field: 'stressLevel',
      min: 1,
      max: 10
    },
    {
      type: 'sleep',
      question: "How was your sleep last night?",
      options: [
        { value: 'excellent', emoji: '💤', label: 'Excellent' },
        { value: 'good', emoji: '😴', label: 'Good' },
        { value: 'fair', emoji: '🛌', label: 'Fair' },
        { value: 'poor', emoji: '🥱', label: 'Poor' }
      ]
    },
    {
      type: 'sleepHours',
      question: "How many hours did you sleep?",
      field: 'sleepHours',
      min: 0,
      max: 12
    },
    {
      type: 'exercise',
      question: "Did you exercise today?",
      field: 'exercise'
    },
    {
      type: 'exerciseDuration',
      question: "If yes, how many minutes did you exercise?",
      field: 'exerciseDuration',
      min: 0,
      max: 180
    },
    {
      type: 'social',
      question: "How much social interaction did you have?",
      options: [
        { value: 'none', emoji: '🚶', label: 'None' },
        { value: 'little', emoji: '👥', label: 'A little' },
        { value: 'moderate', emoji: '💬', label: 'Moderate' },
        { value: 'lots', emoji: '🎉', label: 'Lots' }
      ]
    },
    {
      type: 'productivity',
      question: "How productive were you today?",
      options: [
        { value: 'very', emoji: '🚀', label: 'Very productive' },
        { value: 'moderate', emoji: '📝', label: 'Moderately productive' },
        { value: 'low', emoji: '😴', label: 'Not very productive' },
        { value: 'none', emoji: '⏸️', label: 'Not productive at all' }
      ]
    },
    {
      type: 'meals',
      question: "How many proper meals did you have today?",
      field: 'meals',
      min: 0,
      max: 5
    },
    {
      type: 'water',
      question: "How many glasses of water did you drink?",
      field: 'waterIntake',
      min: 0,
      max: 15
    },
    {
      type: 'positive',
      question: "What positive things happened today? (Select all that apply)",
      options: [
        { value: 'achievement', emoji: '🏆', label: 'Achieved something' },
        { value: 'social', emoji: '👥', label: 'Good social interaction' },
        { value: 'learning', emoji: '📚', label: 'Learned something new' },
        { value: 'nature', emoji: '🌳', label: 'Spent time in nature' },
        { value: 'hobby', emoji: '🎨', label: 'Enjoyed a hobby' },
        { value: 'relaxation', emoji: '🧘', label: 'Had relaxing time' },
        { value: 'health', emoji: '💪', label: 'Felt physically good' }
      ]
    },
    {
      type: 'challenges',
      question: "What challenges did you face today? (Select all that apply)",
      options: [
        { value: 'work', emoji: '💼', label: 'Work stress' },
        { value: 'social', emoji: '😔', label: 'Social issues' },
        { value: 'health', emoji: '🤒', label: 'Health problems' },
        { value: 'financial', emoji: '💰', label: 'Financial worries' },
        { value: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family matters' },
        { value: 'time', emoji: '⏰', label: 'Time management' },
        { value: 'motivation', emoji: '😩', label: 'Lack of motivation' }
      ]
    },
    {
      type: 'gratitude',
      question: "What are you grateful for today? (Select up to 3)",
      options: [
        { value: 'health', emoji: '❤️', label: 'Health' },
        { value: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family' },
        { value: 'friends', emoji: '👫', label: 'Friends' },
        { value: 'work', emoji: '💼', label: 'Work' },
        { value: 'nature', emoji: '🌅', label: 'Nature' },
        { value: 'learning', emoji: '📖', label: 'Learning' },
        { value: 'safety', emoji: '🏠', label: 'Safety' },
        { value: 'opportunities', emoji: '🚀', label: 'Opportunities' }
      ]
    },
    {
      type: 'notes',
      question: "Any additional notes about your day?",
      field: 'notes'
    }
  ];

  const calculateMoodScore = () => {
    let score = 50;
    
    score += (moodData.happinessLevel - 5) * 3;
    score -= (moodData.sadnessLevel - 5) * 2;
    score += (moodData.energyLevel - 5) * 1.5;
    score -= (moodData.stressLevel - 5) * 2;
    
    const sleepScores = { excellent: 10, good: 5, fair: 0, poor: -10 };
    score += sleepScores[moodData.sleepQuality] || 0;
    
    if (moodData.sleepHours >= 7 && moodData.sleepHours <= 9) score += 10;
    else if (moodData.sleepHours < 5 || moodData.sleepHours > 10) score -= 10;
    
    if (moodData.exercise) score += 15;
    if (moodData.exerciseDuration >= 30) score += 5;
    
    const socialScores = { none: -5, little: 0, moderate: 10, lots: 15 };
    score += socialScores[moodData.socialInteraction] || 0;
    
    const productivityScores = { very: 15, moderate: 5, low: -5, none: -10 };
    score += productivityScores[moodData.productivity] || 0;
    
    if (moodData.meals >= 3) score += 10;
    else if (moodData.meals < 2) score -= 5;
    
    if (moodData.waterIntake >= 8) score += 5;
    else if (moodData.waterIntake < 4) score -= 5;
    
    score += moodData.positiveEvents.length * 5;
    score -= moodData.challenges.length * 3;
    score += moodData.gratitude.length * 3;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getMoodPrediction = (score) => {
    if (score >= 80) return { mood: 'excited', emoji: '🤩', label: 'Excited & Happy', color: '#4CAF50' };
    if (score >= 65) return { mood: 'happy', emoji: '😊', label: 'Happy', color: '#8BC34A' };
    if (score >= 50) return { mood: 'neutral', emoji: '😐', label: 'Neutral', color: '#FFC107' };
    if (score >= 35) return { mood: 'sad', emoji: '😔', label: 'Sad', color: '#FF9800' };
    return { mood: 'tired', emoji: '😴', label: 'Tired & Low', color: '#F44336' };
  };

  const getMoodColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 65) return '#8BC34A';
    if (score >= 50) return '#FFC107';
    if (score >= 35) return '#FF9800';
    return '#F44336';
  };

  const getMoodEmoji = (score) => {
    if (score >= 80) return '🤩';
    if (score >= 65) return '😊';
    if (score >= 50) return '😐';
    if (score >= 35) return '😔';
    return '😴';
  };

  const getSuggestions = () => {
    const suggestions = [];
    const score = calculateMoodScore();
    const mood = getMoodPrediction(score);

    if (moodData.sleepHours < 7) {
      suggestions.push("💤 Try to get 7-9 hours of sleep for better mood and energy");
    }

    if (moodData.waterIntake < 6) {
      suggestions.push("💧 Drink more water throughout the day");
    }

    if (!moodData.exercise) {
      suggestions.push("🏃 Even 15 minutes of light exercise can boost your mood");
    }

    if (moodData.socialInteraction === 'none' || moodData.socialInteraction === 'little') {
      suggestions.push("👥 Connect with friends or family for social support");
    }

    if (moodData.stressLevel > 7) {
      suggestions.push("🧘 Try deep breathing or meditation to reduce stress");
    }

    if (moodData.positiveEvents.length === 0) {
      suggestions.push("🌟 Focus on small positive moments in your day");
    }

    if (moodData.gratitude.length < 2) {
      suggestions.push("🙏 Practice gratitude - write down 3 things you're thankful for");
    }

    if (mood.mood === 'sad' || mood.mood === 'tired') {
      suggestions.push("🎵 Listen to uplifting music or your favorite podcast");
      suggestions.push("🌳 Spend some time in nature or fresh air");
      suggestions.push("📞 Reach out to someone you trust for support");
    }

    return suggestions;
  };

  const handleOptionSelect = (value) => {
    const currentQuestion = moodQuestions[currentStep];
    
    if (currentQuestion.type === 'positive' || currentQuestion.type === 'challenges' || currentQuestion.type === 'gratitude') {
      const field = currentQuestion.type === 'positive' ? 'positiveEvents' : 
                   currentQuestion.type === 'challenges' ? 'challenges' : 'gratitude';
      
      setMoodData(prev => ({
        ...prev,
        [field]: prev[field].includes(value) 
          ? prev[field].filter(item => item !== value)
          : [...prev[field], value]
      }));
    } else if (currentQuestion.type === 'overall') {
      setMoodData(prev => ({ ...prev, overallMood: value }));
      nextStep();
    } else if (currentQuestion.type === 'sleep') {
      setMoodData(prev => ({ ...prev, sleepQuality: value }));
      nextStep();
    } else if (currentQuestion.type === 'social') {
      setMoodData(prev => ({ ...prev, socialInteraction: value }));
      nextStep();
    } else if (currentQuestion.type === 'productivity') {
      setMoodData(prev => ({ ...prev, productivity: value }));
      nextStep();
    } else {
      setMoodData(prev => ({ ...prev, [currentQuestion.field]: value }));
      nextStep();
    }
  };

  const handleInputChange = (field, value) => {
    setMoodData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < moodQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const fetchMoodHistory = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userEmail = userData?.emailId || 'unknown@example.com';

      const response = await axios.get(`http://localhost:8080/api/mood?userEmail=${userEmail}`);
      const sortedData = response.data.sort((a, b) => new Date(a.day) - new Date(b.day));
      setHistory(sortedData);
      
      // Process data for charts
      processChartData(sortedData);
      
      // Calculate mood trend
      calculateMoodTrend(sortedData);
    } catch (err) {
      console.error('Error fetching mood history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const processChartData = (data) => {
    const now = new Date();
    let filteredData = data;
    
    // Filter based on time range
    switch (timeRange) {
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filteredData = data.filter(entry => new Date(entry.day) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filteredData = data.filter(entry => new Date(entry.day) >= monthAgo);
        break;
      case '3months':
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
        filteredData = data.filter(entry => new Date(entry.day) >= threeMonthsAgo);
        break;
      default:
        // 'all' - keep all data
        break;
    }
    
    const processedData = filteredData.map(entry => {
      const score = parseInt(entry.score);
      const date = new Date(entry.day);
      return {
        date: entry.day,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: score,
        mood: entry.mood,
        color: getMoodColor(score),
        emoji: getMoodEmoji(score),
        fullDate: date
      };
    });
    
    setChartData(processedData);
  };

  const calculateMoodTrend = (data) => {
    if (data.length < 2) {
      setMoodTrend({ trend: 'neutral', direction: 0, average: 0 });
      return;
    }
    
    const recentData = data.slice(-7); // Last 7 entries
    const scores = recentData.map(entry => parseInt(entry.score));
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Calculate trend direction
    const firstHalfAvg = scores.slice(0, Math.floor(scores.length / 2))
      .reduce((a, b) => a + b, 0) / Math.floor(scores.length / 2);
    const secondHalfAvg = scores.slice(Math.floor(scores.length / 2))
      .reduce((a, b) => a + b, 0) / Math.ceil(scores.length / 2);
    
    const direction = secondHalfAvg - firstHalfAvg;
    
    let trend;
    if (direction > 5) trend = 'improving';
    else if (direction > 2) trend = 'slightly improving';
    else if (direction < -5) trend = 'declining';
    else if (direction < -2) trend = 'slightly declining';
    else trend = 'stable';
    
    setMoodTrend({ trend, direction, average: Math.round(average) });
  };

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      processChartData(history);
    }
  }, [timeRange]);

  const saveMoodEntry = async () => {
    const moodScore = calculateMoodScore();
    const moodPrediction = getMoodPrediction(moodScore);
    const suggestions = getSuggestions();

    const userData = JSON.parse(localStorage.getItem('user'));
    const userEmail = userData?.emailId || 'unknown@example.com';

    const moodEntry = {
      day: new Date().toISOString().split('T')[0],
      mood: moodPrediction.label,
      score: moodScore.toString(),
      userEmail: userEmail,
      timestamp: new Date().toISOString(),
      details: JSON.stringify({ ...moodData }),
      suggestions: suggestions
    };

    try {
      await axios.post('http://localhost:8080/api/mood', moodEntry);
      if (onMoodUpdate) onMoodUpdate(moodEntry);

      // Reset for new entry
      setCurrentStep(0);
      setMoodData({
        date: new Date().toISOString().split('T')[0],
        overallMood: '',
        happinessLevel: 0,
        sadnessLevel: 0,
        energyLevel: 0,
        stressLevel: 0,
        sleepQuality: '',
        sleepHours: 7,
        exercise: false,
        exerciseDuration: 0,
        socialInteraction: '',
        productivity: '',
        meals: 0,
        waterIntake: 0,
        positiveEvents: [],
        challenges: [],
        gratitude: [],
        notes: ''
      });

      // Refresh history
      fetchMoodHistory();
      
      alert('Mood entry saved successfully!');
    } catch (error) {
      console.error('Error saving mood entry:', error);
      alert('Failed to save mood entry. Please try again.');
    }
  };

  const renderQuestion = () => {
    const question = moodQuestions[currentStep];
    
    switch (question.type) {
      case 'overall':
      case 'sleep':
      case 'social':
      case 'productivity':
        return (
          <div className="options-grid">
            {question.options.map(option => (
              <button
                key={option.value}
                className={`option-btn ${moodData[question.field] === option.value ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option.value)}
              >
                <span className="option-emoji">{option.emoji}</span>
                <span className="option-label">{option.label}</span>
              </button>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="scale-container">
            <div className="scale-labels">
              <span>Low</span>
              <span>High</span>
            </div>
            <input
              type="range"
              min={question.min}
              max={question.max}
              value={moodData[question.field]}
              onChange={(e) => handleInputChange(question.field, parseInt(e.target.value))}
              className="mood-slider"
            />
            <div className="scale-value">{moodData[question.field]}</div>
          </div>
        );

      case 'sleepHours':
      case 'exerciseDuration':
      case 'meals':
      case 'water':
        return (
          <div className="number-input-container">
            <input
              type="number"
              min={question.min}
              max={question.max}
              value={moodData[question.field]}
              onChange={(e) => handleInputChange(question.field, parseInt(e.target.value))}
              className="number-input"
            />
            <div className="input-hint">
              {question.type === 'sleepHours' && 'hours'}
              {question.type === 'exerciseDuration' && 'minutes'}
              {question.type === 'meals' && 'meals'}
              {question.type === 'water' && 'glasses'}
            </div>
          </div>
        );

      case 'exercise':
        return (
          <div className="boolean-options">
            <button
              className={`option-btn ${moodData.exercise ? 'selected' : ''}`}
              onClick={() => handleInputChange('exercise', true)}
            >
              <span className="option-emoji">✅</span>
              <span className="option-label">Yes</span>
            </button>
            <button
              className={`option-btn ${!moodData.exercise ? 'selected' : ''}`}
              onClick={() => handleInputChange('exercise', false)}
            >
              <span className="option-emoji">❌</span>
              <span className="option-label">No</span>
            </button>
          </div>
        );

      case 'positive':
      case 'challenges':
      case 'gratitude':
        return (
          <div className="multi-select-grid">
            {question.options.map(option => (
              <button
                key={option.value}
                className={`option-btn ${moodData[
                  question.type === 'positive' ? 'positiveEvents' : 
                  question.type === 'challenges' ? 'challenges' : 'gratitude'
                ].includes(option.value) ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option.value)}
              >
                <span className="option-emoji">{option.emoji}</span>
                <span className="option-label">{option.label}</span>
              </button>
            ))}
          </div>
        );

      case 'notes':
        return (
          <textarea
            value={moodData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Share any thoughts, feelings, or reflections about your day..."
            className="notes-textarea"
            rows={4}
          />
        );

      default:
        return null;
    }
  };

  const isStepComplete = () => {
    const question = moodQuestions[currentStep];
    
    switch (question.type) {
      case 'overall':
        return !!moodData.overallMood;
      case 'scale':
        return moodData[question.field] > 0;
      case 'sleep':
        return !!moodData.sleepQuality;
      case 'sleepHours':
        return moodData.sleepHours > 0;
      case 'exercise':
        return moodData.exercise !== undefined;
      case 'social':
        return !!moodData.socialInteraction;
      case 'productivity':
        return !!moodData.productivity;
      case 'meals':
      case 'water':
        return moodData[question.field] >= 0;
      case 'notes':
        return true;
      default:
        return true;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{data.date}</p>
          <p className="tooltip-score">
            <span className="tooltip-emoji">{data.emoji}</span>
            Score: {data.score}/100
          </p>
          <p className="tooltip-mood">{data.mood}</p>
        </div>
      );
    }
    return null;
  };

  const renderMoodGraph = () => {
    if (chartData.length === 0) {
      return (
        <div className="no-data-message">
          <p>No mood data available for the selected time range.</p>
          <p>Complete your first mood check to see your progress!</p>
        </div>
      );
    }

    return (
      <div className="chart-container" ref={chartContainerRef}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="displayDate" 
              stroke="rgba(255,255,255,0.7)"
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="rgba(255,255,255,0.7)"
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              label={{ 
                value: 'Mood Score', 
                angle: -90, 
                position: 'insideLeft',
                fill: 'rgba(255,255,255,0.7)'
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ stroke: '#667eea', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
              name="Mood Score"
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="bar-chart-container">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <Bar dataKey="score" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderMoodTable = () => {
    if (history.length === 0) {
      return (
        <div className="no-data-message">
          <p>No mood entries found.</p>
          <p>Complete your first mood check to get started!</p>
        </div>
      );
    }

    return (
      <div className="mood-table-container">
        <table className="mood-history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Mood</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.slice().reverse().map(entry => {
              const score = parseInt(entry.score);
              const moodInfo = getMoodPrediction(score);
              return (
                <tr key={entry.timestamp}>
                  <td>{entry.day}</td>
                  <td>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <span className="mood-tag" style={{ backgroundColor: moodInfo.color + '20', color: moodInfo.color }}>
                      <span className="mood-emoji-small">{moodInfo.emoji}</span>
                      {entry.mood}
                    </span>
                  </td>
                  <td className="score-cell">{score}</td>
                  <td>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ 
                          width: `${score}%`,
                          backgroundColor: moodInfo.color
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (currentStep === moodQuestions.length) {
    const moodScore = calculateMoodScore();
    const moodPrediction = getMoodPrediction(moodScore);
    const suggestions = getSuggestions();

    return (
      <div className="mood-tracker-container">
        <div className="mood-result">
          <h2>Your Mood Analysis</h2>
          <div className="mood-summary">
            <div className="mood-emoji-large">{moodPrediction.emoji}</div>
            <div className="mood-details">
              <h3 style={{ color: moodPrediction.color }}>{moodPrediction.label}</h3>
              <div className="mood-score">Score: {moodScore}/100</div>
            </div>
          </div>
          
          <div className="suggestions">
            <h4>Suggestions to Improve Your Mood:</h4>
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          <div className="navigation-buttons">
            <button className="btn-secondary" onClick={() => setCurrentStep(0)}>
              Start Over
            </button>
            <button className="btn-primary" onClick={saveMoodEntry}>
              Save Mood Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-tracker-container">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${((currentStep + 1) / moodQuestions.length) * 100}%` }}
        ></div>
      </div>

      <div className="question-container">
        <h2 className="question">{moodQuestions[currentStep].question}</h2>
        <div className="question-content">
          {renderQuestion()}
        </div>
      </div>

      <div className="navigation-buttons">
        <button 
          className="btn-secondary" 
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </button>
        
        {currentStep < moodQuestions.length - 1 ? (
          <button 
            className="btn-primary" 
            onClick={nextStep}
            disabled={!isStepComplete()}
          >
            Next
          </button>
        ) : currentStep === moodQuestions.length - 1 ? (
          <button 
            className="btn-primary" 
            onClick={() => setCurrentStep(moodQuestions.length)}
            disabled={!isStepComplete()}
          >
            See Results
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={saveMoodEntry}
          >
            Save Mood Entry
          </button>
        )}
      </div>

      <div className="mood-history-section">
        <div className="history-header">
          <h2 className="history-title">Mood History & Trends</h2>
          
          <div className="trend-summary">
            <div className="trend-item">
              <span className="trend-label">Current Trend:</span>
              <span className={`trend-value trend-${moodTrend.trend.replace(' ', '-')}`}>
                {moodTrend.trend.charAt(0).toUpperCase() + moodTrend.trend.slice(1)}
                {moodTrend.direction > 0 ? ' ↗' : moodTrend.direction < 0 ? ' ↘' : ' →'}
              </span>
            </div>
            <div className="trend-item">
              <span className="trend-label">Average Score:</span>
              <span className="trend-value">{moodTrend.average}/100</span>
            </div>
            <div className="trend-item">
              <span className="trend-label">Total Entries:</span>
              <span className="trend-value">{history.length}</span>
            </div>
          </div>
        </div>

        <div className="history-controls">
          <div className="time-range-selector">
            <button 
              className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Last Week
            </button>
            <button 
              className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Last Month
            </button>
            <button 
              className={`range-btn ${timeRange === '3months' ? 'active' : ''}`}
              onClick={() => setTimeRange('3months')}
            >
              3 Months
            </button>
            <button 
              className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
              onClick={() => setTimeRange('all')}
            >
              All Time
            </button>
          </div>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'graph' ? 'active' : ''}`}
              onClick={() => setViewMode('graph')}
            >
              📈 Graph View
            </button>
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              📋 Table View
            </button>
          </div>
        </div>

        {loadingHistory ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading mood history...</p>
          </div>
        ) : viewMode === 'graph' ? renderMoodGraph() : renderMoodTable()}

        <div className="mood-legend">
          <div className="legend-title">Mood Scale:</div>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
              <span className="legend-label">Excellent (80-100)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#8BC34A' }}></span>
              <span className="legend-label">Good (65-79)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#FFC107' }}></span>
              <span className="legend-label">Neutral (50-64)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#FF9800' }}></span>
              <span className="legend-label">Sad (35-49)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#F44336' }}></span>
              <span className="legend-label">Low (0-34)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default MoodTracker;
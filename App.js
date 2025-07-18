// src/App.js
import React, { useState } from 'react';

function App() {
  // Initial state values
  const initialFormState = {
    name: '',
    age: '',
    gender: 'male',
    interests: [],
    personalityTraits: [],
    learningStyle: '',
    values: []
  };

  // Form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const { name, age, gender, interests, personalityTraits, learningStyle, values } = formData;
  
  // Result state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  // Interest options
  const interestOptions = [
    'Technology', 'Art', 'Science', 'Business', 
    'Healthcare', 'Environment', 'Education', 
    'Engineering', 'Design', 'Writing', 
    'Mathematics', 'History', 'Psychology'
  ];
  
  // Personality trait options
  const traitOptions = [
    'Analytical', 'Creative', 'Practical', 'Empathetic',
    'Leadership', 'Detail-oriented', 'Adventurous',
    'Structured', 'Innovative', 'Patient'
  ];
  
  // Value options
  const valueOptions = [
    'Helping others', 'Financial security', 'Creativity',
    'Independence', 'Recognition', 'Work-life balance',
    'Social impact', 'Continuous learning', 'Challenge'
  ];

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Reset form completely
  const resetForm = () => {
    setFormData(initialFormState);
    setStep(1);
    setRecommendations(null);
    setError(null);
    setLoading(false);
  };

  // Toggle functions
  const handleInterestToggle = (interest) => {
    updateFormData('interests', 
      interests.includes(interest)
        ? interests.filter(i => i !== interest)
        : [...interests, interest]
    );
  };

  const handleTraitToggle = (trait) => {
    updateFormData('personalityTraits',
      personalityTraits.includes(trait)
        ? personalityTraits.filter(t => t !== trait)
        : [...personalityTraits, trait]
    );
  };

  const handleValueToggle = (value) => {
    updateFormData('values',
      values.includes(value)
        ? values.filter(v => v !== value)
        : [...values, value]
    );
  };

  // Validation for each step
  const validateStep = () => {
    switch(step) {
      case 1:
        if (!name.trim() || !age) {
          setError('Please fill in your name and age');
          return false;
        }
        return true;
      case 2:
        if (interests.length === 0) {
          setError('Please select at least one interest');
          return false;
        }
        return true;
      case 3:
        if (personalityTraits.length === 0) {
          setError('Please select at least one personality trait');
          return false;
        }
        return true;
      case 4:
        if (!learningStyle || values.length === 0) {
          setError('Please select your learning style and at least one value');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate final step before submitting
    if (!validateStep()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare data to send to API
      const requestData = { ...formData };
      
      // Send request to your Flask backend
 const response = await fetch('https://career-path-backend-0tyo.onrender.com/recommend-career', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestData)
});

      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle API response
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error("No recommendations found in response");
      }
      
    } catch (err) {
      setError(err.message || "An error occurred while processing your request. Please try again.");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError(null);
  };

  const renderFormStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-700">About You</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                  placeholder="Your name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-1">Age *</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => updateFormData('age', e.target.value)}
                    required
                    min="15"
                    max="25"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                    placeholder="Your age"
                  />
                </div>
                
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => updateFormData('gender', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-700">Your Interests *</h2>
            <p className="text-gray-600">Select topics that genuinely interest you</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {interestOptions.map((interest, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    interests.includes(interest)
                      ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {interests.length === 0 && (
              <p className="text-red-500 text-sm">Please select at least one interest</p>
            )}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-700">Your Personality *</h2>
            <p className="text-gray-600">Select traits that describe you best</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {traitOptions.map((trait, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleTraitToggle(trait)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    personalityTraits.includes(trait)
                      ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
            {personalityTraits.length === 0 && (
              <p className="text-red-500 text-sm">Please select at least one personality trait</p>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-700">Learning Style & Values *</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Preferred Learning Style *</label>
                <select
                  value={learningStyle}
                  onChange={(e) => updateFormData('learningStyle', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                >
                  <option value="">Select your preferred learning style</option>
                  <option value="visual">Visual (learn by seeing)</option>
                  <option value="auditory">Auditory (learn by hearing)</option>
                  <option value="kinesthetic">Kinesthetic (learn by doing)</option>
                  <option value="reading">Reading/Writing</option>
                </select>
                {!learningStyle && (
                  <p className="text-red-500 text-sm mt-1">Please select a learning style</p>
                )}
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Core Values *</label>
                <p className="text-gray-600 mb-2">What matters most to you in a career?</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {valueOptions.map((value, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleValueToggle(value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        values.includes(value)
                          ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {values.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">Please select at least one value</p>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Career Path Advisor for Lebanese Students</h1>
          <p className="text-gray-600 mt-2">Discover the perfect university major based on your interests and personality</p>
        </div>
        
        {!recommendations ? (
          <form onSubmit={handleSubmit}>
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Step {step} of 4</span>
                <span className="text-sm font-medium text-gray-500">{Math.round((step / 4) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Form content */}
            {renderFormStep()}
            
            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  ← Back
                </button>
              ) : (
                <div></div>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg font-medium text-white transition ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Finding your perfect major...
                    </div>
                  ) : 'Get Recommendations'}
                </button>
              )}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
           
          </form>
          
          
        ) : (
          <div className="mt-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-blue-700">Career Path Recommendations</h2>
              <p className="text-gray-600 mt-2">Based on your interests and personality traits</p>
            </div>
            

            
            {recommendations && recommendations.length > 0 ? (
              <div className="space-y-8">
                {recommendations.map((major, index) => (
                  <div key={index} className="p-6 border border-blue-200 rounded-xl bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-blue-800">{major.major}</h3>
                        <div className="mt-1 flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-3">
                            <div 
                              className="bg-green-500 h-2.5 rounded-full" 
                              style={{ width: `${major.matchScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Match Score: {major.matchScore}%</span>
                        </div>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Recommendation #{index + 1}
                      </div>
                    </div>
                    
                    <p className="mt-4 text-gray-700">{major.description}</p>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800">Why this matches you:</h4>
                      <p className="text-gray-700">{major.whyMatch}</p>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Potential Careers:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          {major.careers.map((career, i) => (
                            <li key={i}>{career}</li>
                          ))}
                        </ul>
                      </div>
                      
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Career Development Advice:</h4>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                               <p className="text-gray-700 whitespace-pre-line">{major.advice}</p>
                             </div>
                         </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-yellow-50 rounded-xl border border-yellow-200">
                <h3 className="text-xl font-medium text-yellow-800">No Recommendations Found</h3>
                <p className="mt-2 text-yellow-700">
                  We couldn't find career recommendations based on your inputs. 
                  Please try again with different selections.
                </p>
              </div>
            )}
        
            <div className="mt-8 text-center">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Recommendations are based on common career paths and may not reflect all opportunities. Consult with a career counselor for personalized advice.</p>
        </div>
        {/* Bold copyright footer */}
        <div className="text-center text-sm font-semibold text-gray-500 mt-10">
            © 2025 Mahmoud Mahdi. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default App;
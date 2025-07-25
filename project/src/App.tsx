import React, { useState } from 'react';
import { Send, MapPin, FileCheck2, FileText, Loader2, Globe } from 'lucide-react';

interface FormData {
  fullName: string;
  degree: string;
  workExperience: string;
  targetCountry: string;
  goal: string;
}

interface RoadmapResponse {
  roadmap: string;
  checklist: string[];
  sop: string;
  opportunities?: {
    title: string;
    url: string;
    type: 'scholarship' | 'university' | 'visa' | 'other';
  }[];
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    degree: '',
    workExperience: '',
    targetCountry: '',
    goal: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [requirements, setRequirements] = useState<any | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to generate roadmap. Please check your connection and try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">JAPA Pathway Advisor</h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Get your personalized AI-powered roadmap to study or work abroad. Made for ambitious Nigerians ready to take the next step.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Form Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Tell Us About Yourself</h2>
            <p className="text-gray-600">Fill in your details below and we'll create a customized pathway for your international journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g., Adebayo Ogundimu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-2">
                  Educational Background
                </label>
                <input
                  type="text"
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  placeholder="e.g., BSc in Computer Science"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Experience
                </label>
                <input
                  type="text"
                  id="workExperience"
                  name="workExperience"
                  value={formData.workExperience}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 years backend developer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="targetCountry" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Country
                </label>
                <input
                  type="text"
                  id="targetCountry"
                  name="targetCountry"
                  value={formData.targetCountry}
                  onChange={handleInputChange}
                  placeholder="e.g., Canada, UK, Germany"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                Your Goal
              </label>
              <textarea
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                placeholder="e.g., Get MSc in AI, become a researcher, get permanent residency"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Your Roadmap...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Generate My Roadmap
                </>
              )}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!formData.targetCountry) return;
                setLoading(true);
                try {
                  const res = await fetch('http://localhost:8000/api/requirements', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      country: formData.targetCountry,
                      nationality: 'Nigeria' // or add a nationality input if you want
                    }),
                  });
                  const data = await res.json();
                  setRequirements(data);
                } catch (err) {
                  console.error('Visa fetch error:', err);
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Globe className="w-5 h-5" />
              Get Visa Requirements
            </button>

          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Your Personalized Pathway</h2>
              <p className="text-gray-600">Here's your customized roadmap to achieve your international goals</p>
            </div>

            {/* Roadmap */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Your Roadmap</h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-sans">
                    {result.roadmap}
                  </pre>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Document Checklist</h3>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {Array.isArray(result.checklist) ? (
                    result.checklist.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>{result.checklist}</li>
                  )}
                </ul>
              </div>
            </div>

            {/* SOP */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Statement of Purpose</h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-sans">
                    {result.sop}
                  </pre>
                </div>
              </div>
            </div>
            {/* Opportunities Section */}
            {result?.opportunities && result.opportunities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Opportunities & Resources</h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  {result.opportunities.map((item, idx) => (
                    <li key={idx}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        [{item.type.toUpperCase()}] {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {requirements && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Visa Requirements for {requirements.country}
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Visa Type:</strong> {requirements.visa_type}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Language Requirements:</strong> {requirements.language_requirements}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Timeline:</strong> {requirements.timeline}
                </p>
                <div className="mb-2">
                  <strong className="text-sm text-gray-700">Required Documents:</strong>
                  <ul className="list-disc pl-5 text-sm text-gray-700 mt-1">
                    {requirements.documents.map((doc: string, idx: number) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <strong className="text-sm text-gray-700">Official Links:</strong>
                  <ul className="list-disc pl-5 text-sm text-blue-600 mt-1">
                    {requirements.official_links.map((link: string, idx: number) => (
                      <li key={idx}>
                        <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 md:p-8 text-white text-center">
              <h3 className="text-xl font-semibold mb-2">Ready to Start Your Journey?</h3>
              <p className="text-blue-100 mb-4">
                Take the first step today and begin preparing your documents and applications.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                Generate Another Roadmap
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            JAPA Pathway Advisor - Empowering Nigerians to achieve their international dreams
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
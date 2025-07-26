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
  const [feedbackText, setFeedbackText] = useState('');
  const [requirements, setRequirements] = useState<any | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setRequirements(null);

    try {
      // First, get the roadmap
      const response = await fetch('https://japaavisorai.onrender.com/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Roadmap error: ${response.status}`);
      const data = await response.json();
      setResult(data);

      // Then, try to get visa requirements
      const visaRes = await fetch('https://japaavisorai.onrender.com/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: formData.targetCountry,
          nationality: 'Nigeria'
        }),
      });

      if (visaRes.ok) {
        const visaData = await visaRes.json();
        setRequirements(visaData);
      } else {
        console.warn('Visa requirements not available');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to generate roadmap. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">JAPA Pathway Advisor</h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Get your personalized AI-powered roadmap to study or work abroad.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Form */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Tell Us About Yourself</h2>
          <p className="text-gray-600 mb-6">Fill in your details to get a customized pathway for your international journey.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 px-4 py-2 rounded-lg mb-4">
              📌 <strong>Note:</strong> For now, we only cover <strong>UK</strong>, <strong>Canada</strong>, <strong>USA</strong>, and <strong>Germany</strong>. More countries will be added soon!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g., Adebayo Ogundimu"
                  className="w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-2">Educational Background</label>
                <input
                  type="text"
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  placeholder="e.g., BSc in Computer Science"
                  className="w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700 mb-2">Work Experience</label>
                <input
                  type="text"
                  id="workExperience"
                  name="workExperience"
                  value={formData.workExperience}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 years backend developer"
                  className="w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="targetCountry" className="block text-sm font-medium text-gray-700 mb-2">Target Country</label>
                <input
                  type="text"
                  id="targetCountry"
                  name="targetCountry"
                  value={formData.targetCountry}
                  onChange={handleInputChange}
                  placeholder="e.g., Canada, UK, Germany"
                  className="w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">Your Goal</label>
              <textarea
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                placeholder="e.g., Get MSc in AI, become a researcher, get permanent residency"
                rows={3}
                className="w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 resize-none"
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
          </form>
        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <section className="space-y-6">
            {/* Roadmap */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" /> Your Roadmap
              </h3>
              <pre className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 text-sm whitespace-pre-wrap">{result.roadmap}</pre>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3 mb-4">
                <FileCheck2 className="w-5 h-5 text-green-600" /> Document Checklist
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {result.checklist.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* SOP */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-orange-600" /> Statement of Purpose
              </h3>
              <pre className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500 text-sm whitespace-pre-wrap">{result.sop}</pre>
            </div>

            {/* Opportunities */}
            {result.opportunities && result.opportunities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-purple-600" /> Opportunities & Resources
                </h3>
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

            {/* Visa Requirements */}
            {requirements && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Visa Requirements for {requirements.country}</h3>
                <p className="text-sm text-gray-700 mb-2"><strong>Visa Type:</strong> {requirements.visa_type}</p>
                <p className="text-sm text-gray-700 mb-2"><strong>Language Requirements:</strong> {requirements.language_requirements}</p>
                <p className="text-sm text-gray-700 mb-2"><strong>Timeline:</strong> {requirements.timeline}</p>
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
                        <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 md:p-8 text-white text-center">
              <h3 className="text-xl font-semibold mb-2">Ready to Start Your Journey?</h3>
              <p className="text-blue-100 mb-4">Take the first step today and begin preparing your documents.</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition"
              >
                Generate Another Roadmap
              </button>
            </div>
          </section>
        )}
        {/* Feedback Section */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">We’d Love Your Feedback</h3>
            <p className="text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 px-4 py-2 rounded-lg mb-4">
              📌 <strong>Note:</strong> For now, we only cover <strong>UK</strong>, <strong>Canada</strong>, <strong>USA</strong>, and <strong>Germany</strong>. More countries will be added soon!
            </p>

            <p className="text-gray-600 mb-4">
              Tell us what’s working, what’s confusing, or what could be better.
            </p>
            <textarea
              id="feedbackMessage"
              placeholder="Type your feedback or challenges here..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none mb-4"
              onChange={(e) => setFeedbackText(e.target.value)}
              value={feedbackText}
            />
            <a
              href={`https://wa.me/2347040082577?text=${encodeURIComponent(
                `Hello JapaAdvisor! I’ve been using the app and I have some feedback or a challenge I’d like to share:\n\n${feedbackText || ''}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Send via WhatsApp
            </a>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">JAPA Pathway Advisor - Empowering Nigerians to achieve their international dreams</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

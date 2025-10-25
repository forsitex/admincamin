'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { Bot, Send, Loader2, User } from 'lucide-react';

export default function AiChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [userCamine, setUserCamine] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll când se actualizează chat history
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      setUser(currentUser);
      
      // Încarcă căminele utilizatorului
      try {
        const locationsRef = collection(db, 'organizations', currentUser.uid, 'locations');
        const locationsSnap = await getDocs(locationsRef);
        const locationsData = locationsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserCamine(locationsData);
      } catch (error) {
        console.error('Error loading locations:', error);
        // Încercăm structura veche
        try {
          const camineRef = collection(db, 'companies', currentUser.uid, 'camine');
          const camineSnap = await getDocs(camineRef);
          const camineData = camineSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserCamine(camineData);
        } catch (oldError) {
          console.error('Error loading old camine:', oldError);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedLocation) return;

    setLoading(true);
    setAnswer('');
    
    // Adăugăm întrebarea în istoric
    const newHistory = [...chatHistory, {role: 'user', content: question}];
    setChatHistory(newHistory);

    try {
      // Obține token-ul Firebase pentru autentificare
      const token = await getIdToken(user);
      console.log('📤 Sending request with token:', token.substring(0, 20) + '...');
      console.log('🏘️ Selected location:', selectedLocation);
      
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          caminId: selectedLocation
        }),
      });
      
      console.log('📥 Response status:', response.status);

      const data = await response.json();
      
      if (data.success) {
        setAnswer(data.answer);
        // Adăugăm răspunsul AI în istoric
        setChatHistory([...newHistory, {role: 'ai', content: data.answer}]);
      } else {
        setAnswer(`Eroare: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setAnswer('Eroare la comunicarea cu AI-ul. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🤖 AI Asistent Cămin</h1>
          <p className="text-gray-600">
            Întreabă despre starea rezidenților, medicamente, comportament sau alte detalii
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Selectează Căminul:
            </label>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Alege un cămin --</option>
              {userCamine.map((camin) => (
                <option key={camin.id} value={camin.id}>
                  {camin.name || camin.denumire || `Cămin ${camin.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div ref={chatContainerRef} className="h-96 overflow-y-auto mb-4 space-y-4 scroll-smooth">
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <div className="flex items-center mb-1">
                      <Bot className="w-4 h-4 mr-2" />
                      <span className="text-xs font-semibold">AI Asistent</span>
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div className="flex items-center mb-1">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-xs font-semibold">Tu</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex items-center">
                    <Bot className="w-4 h-4 mr-2" />
                    <span className="text-xs font-semibold">AI Asistent</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm">Gândesc...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: Care este starea generală a rezidenților din căminul Fortunei?"
              disabled={loading || !selectedLocation}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !question.trim() || !selectedLocation}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          
          {!selectedLocation && (
            <p className="text-sm text-gray-500 mt-2">
              * Selectează un cămin pentru a începe conversația
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload, Trash2, Eye, CheckCircle, XCircle, Plus, AlertCircle } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ContractTemplate } from '@/types/template';

export default function TemplatesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      loadTemplates(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadTemplates = async (userId: string) => {
    try {
      setLoading(true);
      const templatesRef = collection(db, 'organizations', userId, 'templates');
      const q = query(templatesRef);
      const querySnapshot = await getDocs(q);
      
      const loadedTemplates: ContractTemplate[] = [];
      querySnapshot.forEach((doc) => {
        loadedTemplates.push({ id: doc.id, ...doc.data() } as ContractTemplate);
      });
      
      loadedTemplates.sort((a, b) => b.createdAt - a.createdAt);
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Eroare:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!user) return;
    const confirmed = confirm('Sigur vrei să ștergi acest template?');
    if (!confirmed) return;
    
    try {
      await deleteDoc(doc(db, 'organizations', user.uid, 'templates', templateId));
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (error) {
      alert('Eroare la ștergere');
    }
  };

  const handleToggleActive = async (templateId: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'organizations', user.uid, 'templates', templateId), {
        isActive: !currentStatus,
        updatedAt: Date.now(),
      });
      setTemplates(templates.map(t => t.id === templateId ? { ...t, isActive: !currentStatus } : t));
    } catch (error) {
      alert('Eroare la actualizare');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ro-RO');
  };

  const getTypeColor = (type: string) => {
    const colors = {
      camin: 'bg-purple-100 text-purple-800',
      gradinita: 'bg-blue-100 text-blue-800',
      spital: 'bg-red-100 text-red-800',
      hotel: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Template-uri Custom</h1>
          <p className="text-gray-600">Gestionează contractele tale cu AI</p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => router.push('/settings/templates/upload')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Upload Template Nou
          </button>
        </div>

        {templates.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Niciun template încă</h3>
            <p className="text-blue-800">Uploadează primul tău contract custom!</p>
          </div>
        )}

        {templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                    {template.type}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.fieldMapping.length} câmpuri</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/settings/templates/${template.id}`)}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Vezi
                  </button>
                  
                  <button
                    onClick={() => handleToggleActive(template.id, template.isActive)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    {template.isActive ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

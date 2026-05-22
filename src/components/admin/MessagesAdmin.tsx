import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Trash2 } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export function MessagesAdmin() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      alert('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le message de "${name}" ?`)) return;
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-teal-500 pb-2 inline-block">Messages de Contact</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{msg.name}</h3>
                <div className="text-sm text-gray-600 flex flex-col mt-1">
                  <a href={`mailto:${msg.email}`} className="text-teal-600 hover:underline">{msg.email}</a>
                  {msg.phone && <a href={`tel:${msg.phone}`} className="text-gray-500 hover:text-teal-600">{msg.phone}</a>}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(msg.id, msg.name)} 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 flex-1 text-gray-700 text-sm whitespace-pre-wrap">
              {msg.message}
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-right">
              Reçu le {new Date(msg.created_at).toLocaleString('fr-FR')}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-gray-100 text-gray-500">
            Aucun message de contact.
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../hooks/useApi';
import type { Client } from '../types/api';

interface Props {
  client?: Client | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClientForm({ client, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    firstName: client?.firstName ?? '',
    lastName: client?.lastName ?? '',
    phone: client?.phone ?? '',
    email: client?.email ?? '',
    gender: client?.gender ?? '',
    birthDate: client?.birthDate ? client.birthDate.split('T')[0] : '',
    address: client?.address ?? '',
    notes: client?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Prénom et nom obligatoires');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, birthDate: form.birthDate || undefined };
      if (client) {
        await apiClient.updateClient(client.id, payload);
        toast.success('Client modifié');
      } else {
        await apiClient.createClient(payload);
        toast.success('Client créé');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <h2 className="text-lg font-semibold">{client ? 'Modifier le client' : 'Nouveau client'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Prénom *</label>
              <input className="input" value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Nom *</label>
              <input className="input" value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Téléphone</label>
              <input className="input" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Genre</label>
              <select className="input" value={form.gender} onChange={set('gender')}>
                <option value="">—</option>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Date de naissance</label>
            <input className="input" type="date" value={form.birthDate} onChange={set('birthDate')} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Adresse</label>
            <input className="input" value={form.address} onChange={set('address')} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
            <textarea className="input" rows={3} value={form.notes} onChange={set('notes')} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

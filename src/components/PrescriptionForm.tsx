import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../hooks/useApi';
import type { Prescription, PaginatedResponse, Client } from '../types/api';

interface Props {
  prescription?: Prescription | null;
  defaultClientId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PrescriptionForm({ prescription, defaultClientId, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    clientId: prescription?.clientId ?? defaultClientId ?? '',
    date: prescription?.date ? prescription.date.split('T')[0] : new Date().toISOString().split('T')[0],
    doctor: prescription?.doctor ?? '',
    odSphere: prescription?.odSphere ?? '',
    odCylinder: prescription?.odCylinder ?? '',
    odAxis: prescription?.odAxis ?? '',
    odAddition: prescription?.odAddition ?? '',
    ogSphere: prescription?.ogSphere ?? '',
    ogCylinder: prescription?.ogCylinder ?? '',
    ogAxis: prescription?.ogAxis ?? '',
    ogAddition: prescription?.ogAddition ?? '',
    pd: prescription?.pd ?? '',
    notes: prescription?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);

  const { data: clientsData } = useQuery<PaginatedResponse<Client>>({
    queryKey: ['clients-select'],
    queryFn: () => apiClient.getClients({ limit: 100 }).then(r => r.data),
    enabled: !defaultClientId,
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const numFields = (label: string, keys: (keyof typeof form)[]) => (
    <div className="grid grid-cols-4 gap-2">
      {keys.map((k, i) => (
        <div key={k}>
          <label className="text-xs text-gray-500 block mb-1">
            {['Sphère', 'Cylindre', 'Axe', 'Addition'][i]}
          </label>
          <input className="input text-sm" type="number" step="0.25" value={form[k] as any} onChange={set(k)} placeholder="0" />
        </div>
      ))}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: any = { ...form };
    ['odSphere','odCylinder','odAxis','odAddition','ogSphere','ogCylinder','ogAxis','ogAddition','pd'].forEach(k => {
      payload[k] = payload[k] !== '' ? Number(payload[k]) : undefined;
    });
    payload.clientId = Number(payload.clientId);

    try {
      if (prescription) {
        await apiClient.updatePrescription(prescription.id, payload);
        toast.success('Ordonnance modifiée');
      } else {
        await apiClient.createPrescription(payload);
        toast.success('Ordonnance créée');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <h2 className="text-lg font-semibold">{prescription ? 'Modifier l\'ordonnance' : 'Nouvelle ordonnance'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {!defaultClientId && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Client *</label>
                <select className="input" value={form.clientId} onChange={set('clientId')} required>
                  <option value="">Sélectionner un client</option>
                  {clientsData?.data.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date *</label>
              <input className="input" type="date" value={form.date} onChange={set('date')} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Médecin</label>
              <input className="input" value={form.doctor} onChange={set('doctor')} />
            </div>
          </div>

          <div className="border rounded-lg p-3 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Œil droit (OD)</p>
            {numFields('OD', ['odSphere', 'odCylinder', 'odAxis', 'odAddition'])}
          </div>

          <div className="border rounded-lg p-3 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Œil gauche (OG)</p>
            {numFields('OG', ['ogSphere', 'ogCylinder', 'ogAxis', 'ogAddition'])}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Écart pupillaire (PD)</label>
            <input className="input" type="number" step="0.5" value={form.pd as any} onChange={set('pd')} placeholder="Ex: 63" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={set('notes')} />
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

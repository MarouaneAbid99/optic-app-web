import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../hooks/useApi';
import type { PaginatedResponse, Client } from '../types/api';

interface Item {
  label: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderForm({ onClose, onSuccess }: Props) {
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<Item[]>([{ label: '', quantity: 1, unitPrice: 0 }]);
  const [paidAmount, setPaidAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [deliveryAt, setDeliveryAt] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: clientsData } = useQuery<PaginatedResponse<Client>>({
    queryKey: ['clients-select'],
    queryFn: () => apiClient.getClients({ limit: 100 }).then(r => r.data),
  });

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const updateItem = (idx: number, key: keyof Item, val: string) =>
    setItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, [key]: key === 'label' ? val : Number(val) } : it
    ));

  const addItem = () => setItems(p => [...p, { label: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx: number) => setItems(p => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { toast.error('Sélectionner un client'); return; }
    if (items.some(i => !i.label.trim())) { toast.error('Remplir le libellé de chaque article'); return; }

    setLoading(true);
    try {
      await apiClient.createOrder({
        clientId: Number(clientId),
        items,
        paidAmount: Number(paidAmount),
        notes: notes || undefined,
        deliveryAt: deliveryAt || undefined,
      });
      toast.success('Commande créée');
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
          <h2 className="text-lg font-semibold">Nouvelle commande</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Client *</label>
              <select className="input" value={clientId} onChange={e => setClientId(e.target.value)} required>
                <option value="">Sélectionner un client</option>
                {clientsData?.data.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.phone ? `— ${c.phone}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Acompte versé (MAD)</label>
              <input className="input" type="number" min="0" step="0.01" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date de livraison prévue</label>
              <input className="input" type="date" value={deliveryAt} onChange={e => setDeliveryAt(e.target.value)} />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Articles</label>
              <button type="button" onClick={addItem} className="text-blue-600 text-xs flex items-center gap-1 hover:text-blue-700">
                <Plus size={14} /> Ajouter une ligne
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-1">
                <span className="col-span-5">Libellé</span>
                <span className="col-span-2">Qté</span>
                <span className="col-span-3">Prix unit.</span>
                <span className="col-span-2">Total</span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className="input col-span-5 text-sm"
                    placeholder="Ex: Monture SILHOUETTE"
                    value={item.label}
                    onChange={e => updateItem(idx, 'label', e.target.value)}
                    required
                  />
                  <input
                    className="input col-span-2 text-sm"
                    type="number" min="1" value={item.quantity}
                    onChange={e => updateItem(idx, 'quantity', e.target.value)}
                  />
                  <input
                    className="input col-span-3 text-sm"
                    type="number" min="0" step="0.01" value={item.unitPrice}
                    onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                  />
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {(item.quantity * item.unitPrice).toFixed(0)}
                    </span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-end border-t pt-2">
                <span className="text-sm font-semibold text-gray-900">Total : {total.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
            <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Création...' : 'Créer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

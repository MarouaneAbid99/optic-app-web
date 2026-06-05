import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../hooks/useApi';
import type { PaymentMethod } from '../types/api';

interface Props {
  orderId: number;
  orderReference: string;
  remaining: number;
  onClose: () => void;
  onSuccess: () => void;
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'ESPECE', label: 'Espèces' },
  { value: 'CARTE', label: 'Carte bancaire' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'VIREMENT', label: 'Virement' },
];

export default function PaymentForm({ orderId, orderReference, remaining, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState(remaining > 0 ? String(remaining) : '');
  const [method, setMethod] = useState<PaymentMethod>('ESPECE');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) <= 0) { toast.error('Montant invalide'); return; }

    setLoading(true);
    try {
      await apiClient.createPayment({ orderId, amount: Number(amount), method, paidAt });
      toast.success('Paiement enregistré');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">Ajouter un paiement</h2>
            <p className="text-sm text-gray-500">Commande {orderReference}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {remaining > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
              Reste à payer : <strong>{remaining.toFixed(2)} MAD</strong>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Montant (MAD) *</label>
            <input
              className="input"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Moyen de paiement *</label>
            <select className="input" value={method} onChange={e => setMethod(e.target.value as PaymentMethod)}>
              {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Date du paiement</label>
            <input className="input" type="date" value={paidAt} onChange={e => setPaidAt(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Enregistrement...' : 'Valider le paiement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

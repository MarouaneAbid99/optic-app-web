import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, CreditCard, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrder } from '../hooks/useQuery';
import apiClient from '../hooks/useApi';
import PaymentForm from '../components/PaymentForm';
import type { OrderStatus } from '../types/api';

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'EN_COURS', label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  { value: 'PRETE', label: 'Prête', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'LIVREE', label: 'Livrée', color: 'bg-green-100 text-green-700' },
  { value: 'ANNULEE', label: 'Annulée', color: 'bg-red-100 text-red-700' },
];

const METHOD_LABEL: Record<string, string> = {
  ESPECE: 'Espèces', CARTE: 'Carte', CHEQUE: 'Chèque', VIREMENT: 'Virement',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const { data: order, isLoading } = useOrder(Number(id));

  const updateStatus = useMutation({
    mutationFn: (status: OrderStatus) => apiClient.updateOrder(Number(id), { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', Number(id)] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Statut mis à jour');
      setStatusUpdating(false);
    },
    onError: () => { toast.error('Erreur'); setStatusUpdating(false); },
  });

  if (isLoading) return <div className="p-12 text-center text-gray-400">Chargement...</div>;
  if (!order) return <div className="p-12 text-center text-gray-400">Commande introuvable</div>;

  const remaining = order.remaining ?? (order.totalAmount - order.paidAmount);
  const statusEntry = STATUS_OPTIONS.find(s => s.value === order.status);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/orders')} className="p-2 rounded-lg hover:bg-gray-200 text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.reference}</h1>
            <span className={`badge ${statusEntry?.color || 'bg-gray-100 text-gray-700'}`}>
              {statusEntry?.label || order.status}
            </span>
          </div>
          {order.client && (
            <p className="text-gray-500 text-sm mt-0.5">
              {order.client.firstName} {order.client.lastName}
              {order.client.phone && <span className="ml-2 text-gray-400">{order.client.phone}</span>}
            </p>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-xl font-bold text-gray-900">{order.totalAmount.toLocaleString('fr-MA')} MAD</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Payé</p>
          <p className="text-xl font-bold text-green-600">{order.paidAmount.toLocaleString('fr-MA')} MAD</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Reste</p>
          <p className={`text-xl font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {remaining > 0 ? `${remaining.toLocaleString('fr-MA')} MAD` : 'Soldé'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b">
              <Package size={16} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Articles</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-2.5 text-gray-500 font-medium">Désignation</th>
                  <th className="text-right px-5 py-2.5 text-gray-500 font-medium">Qté</th>
                  <th className="text-right px-5 py-2.5 text-gray-500 font-medium">P.U.</th>
                  <th className="text-right px-5 py-2.5 text-gray-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 font-medium text-gray-900">{item.label}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{item.unitPrice.toLocaleString('fr-MA')} MAD</td>
                    <td className="px-5 py-3 text-right font-semibold">
                      {(item.quantity * item.unitPrice).toLocaleString('fr-MA')} MAD
                    </td>
                  </tr>
                ))}
                {!order.items?.length && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Aucun article</td></tr>
                )}
              </tbody>
              {order.items && order.items.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-5 py-3 text-right font-semibold text-gray-700">Total</td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900">
                      {order.totalAmount.toLocaleString('fr-MA')} MAD
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Payments */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-gray-500" />
                <h2 className="font-semibold text-gray-900">Paiements</h2>
              </div>
              {remaining > 0 && (
                <button
                  onClick={() => setPaymentOpen(true)}
                  className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
                >
                  <Plus size={14} /> Ajouter un paiement
                </button>
              )}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-2.5 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-5 py-2.5 text-gray-500 font-medium">Moyen</th>
                  <th className="text-right px-5 py-2.5 text-gray-500 font-medium">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.payments?.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(p.paidAt).toLocaleDateString('fr-MA')}
                    </td>
                    <td className="px-5 py-3">
                      <span className="badge bg-gray-100 text-gray-700">{METHOD_LABEL[p.method] || p.method}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-green-700">
                      {p.amount.toLocaleString('fr-MA')} MAD
                    </td>
                  </tr>
                ))}
                {!order.payments?.length && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">Aucun paiement</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Statut de la commande</h3>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  disabled={order.status === s.value || statusUpdating}
                  onClick={() => { setStatusUpdating(true); updateStatus.mutate(s.value); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    order.status === s.value
                      ? `${s.color} border-current cursor-default`
                      : 'text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  <span className={`w-2 h-2 rounded-full ${order.status === s.value ? 'bg-current' : 'bg-gray-300'}`} />
                  {s.label}
                  {order.status === s.value && <span className="ml-auto text-xs">Actuel</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="card p-4 text-sm space-y-3">
            <h3 className="font-semibold text-gray-700">Informations</h3>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Date de création</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('fr-MA')}</p>
            </div>
            {order.deliveryAt && (
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Date de livraison prévue</p>
                <p className="font-medium">{new Date(order.deliveryAt).toLocaleDateString('fr-MA')}</p>
              </div>
            )}
            {order.notes && (
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Notes</p>
                <p className="text-gray-700 italic">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {paymentOpen && (
        <PaymentForm
          orderId={order.id}
          orderReference={order.reference}
          remaining={remaining}
          onClose={() => setPaymentOpen(false)}
          onSuccess={() => {
            setPaymentOpen(false);
            qc.invalidateQueries({ queryKey: ['order', Number(id)] });
            qc.invalidateQueries({ queryKey: ['orders'] });
          }}
        />
      )}
    </div>
  );
}

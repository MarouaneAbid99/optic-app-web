import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useOrders } from '../hooks/useQuery';
import OrderForm from '../components/OrderForm';
import type { Order, OrderStatus, PaginatedResponse } from '../types/api';

const STATUSES: { value: OrderStatus | ''; label: string; color: string }[] = [
  { value: '', label: 'Toutes', color: '' },
  { value: 'EN_COURS', label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  { value: 'PRETE', label: 'Prêtes', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'LIVREE', label: 'Livrées', color: 'bg-green-100 text-green-700' },
  { value: 'ANNULEE', label: 'Annulées', color: 'bg-red-100 text-red-700' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const params = { status: status || undefined, page, limit: 20 };
  const { data, isLoading } = useOrders(params);
  const paginated = data as PaginatedResponse<Order> | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={22} className="text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          {paginated?.total !== undefined && <span className="badge bg-gray-100 text-gray-600">{paginated.total}</span>}
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouvelle commande
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatus(s.value as OrderStatus | ''); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              status === s.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Chargement...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Réf.</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Client</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Total</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Payé</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium hidden md:table-cell">Reste</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Statut</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium hidden lg:table-cell">Date</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated?.data.map((order: Order) => {
                    const remaining = order.totalAmount - order.paidAmount;
                    const statusEntry = STATUSES.find(s => s.value === order.status);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 cursor-pointer group"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold">{order.reference}</td>
                        <td className="px-5 py-3.5 font-medium text-gray-900">
                          {order.client?.firstName} {order.client?.lastName}
                        </td>
                        <td className="px-5 py-3.5 text-right">{order.totalAmount.toLocaleString('fr-MA')} MAD</td>
                        <td className="px-5 py-3.5 text-right text-green-700 font-medium">{order.paidAmount.toLocaleString('fr-MA')} MAD</td>
                        <td className="px-5 py-3.5 text-right hidden md:table-cell">
                          {remaining > 0 ? (
                            <span className="text-red-600 font-medium">{remaining.toLocaleString('fr-MA')} MAD</span>
                          ) : (
                            <span className="text-green-600">Soldé</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`badge ${statusEntry?.color || 'bg-gray-100 text-gray-700'}`}>
                            {statusEntry?.label || order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 hidden lg:table-cell">
                          {new Date(order.createdAt).toLocaleDateString('fr-MA')}
                        </td>
                        <td className="px-3 py-3.5">
                          <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </td>
                      </tr>
                    );
                  })}
                  {paginated?.data.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">Aucune commande trouvée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {paginated && paginated.total > 20 && (
              <div className="flex items-center justify-between px-5 py-3 border-t text-sm">
                <span className="text-gray-500">{paginated.total} commandes</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1 border rounded-lg disabled:opacity-40">←</button>
                  <span>Page {page}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= paginated.total} className="px-3 py-1 border rounded-lg disabled:opacity-40">→</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {formOpen && (
        <OrderForm
          onClose={() => setFormOpen(false)}
          onSuccess={() => { setFormOpen(false); qc.invalidateQueries({ queryKey: ['orders'] }); }}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProducts } from '../hooks/useQuery';
import apiClient from '../hooks/useApi';
import type { Product, ProductType, PaginatedResponse } from '../types/api';

const TYPES: { value: ProductType | ''; label: string }[] = [
  { value: '', label: 'Tous les types' },
  { value: 'MONTURE', label: 'Montures' },
  { value: 'VERRE', label: 'Verres' },
  { value: 'ACCESSOIRE', label: 'Accessoires' },
];

const TYPE_COLOR: Record<string, string> = {
  MONTURE: 'bg-purple-100 text-purple-700',
  VERRE: 'bg-blue-100 text-blue-700',
  ACCESSOIRE: 'bg-gray-100 text-gray-700',
};

function ProductModal({ product, onClose, onSuccess }: { product?: Product | null; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    type: product?.type ?? 'MONTURE',
    name: product?.name ?? '',
    brand: product?.brand ?? '',
    description: product?.description ?? '',
    costPrice: product?.costPrice ?? '',
    sellPrice: product?.sellPrice ?? '',
    stockQuantity: product?.stockQuantity ?? 0,
    minStock: product?.minStock ?? 5,
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      costPrice: Number(form.costPrice),
      sellPrice: Number(form.sellPrice),
      stockQuantity: Number(form.stockQuantity),
      minStock: Number(form.minStock),
    };
    try {
      if (product) {
        await apiClient.updateProduct(product.id, payload);
        toast.success('Produit modifié');
      } else {
        await apiClient.createProduct(payload);
        toast.success('Produit créé');
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <h2 className="font-semibold text-lg">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Type *</label>
              <select className="input" value={form.type} onChange={set('type')} required>
                <option value="MONTURE">Monture</option>
                <option value="VERRE">Verre</option>
                <option value="ACCESSOIRE">Accessoire</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Marque</label>
              <input className="input" value={form.brand} onChange={set('brand')} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nom *</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Prix coût (MAD) *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.costPrice} onChange={set('costPrice')} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Prix vente (MAD) *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.sellPrice} onChange={set('sellPrice')} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Stock actuel</label>
              <input className="input" type="number" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Stock minimum</label>
              <input className="input" type="number" min="0" value={form.minStock} onChange={set('minStock')} />
            </div>
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

export default function ProductsPage() {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<ProductType | ''>('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const params = { type: typeFilter || undefined, page, limit: 20 };
  const { data, isLoading } = useProducts(params);
  const paginated = data as PaginatedResponse<Product> | undefined;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produit supprimé'); },
    onError: () => toast.error('Impossible de supprimer'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={22} className="text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          {paginated?.total !== undefined && <span className="badge bg-gray-100 text-gray-600">{paginated.total}</span>}
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTypeFilter(t.value as ProductType | ''); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              typeFilter === t.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {t.label}
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
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Produit</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Type</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Prix vente</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Stock</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated?.data.map((p) => {
                    const lowStock = p.stockQuantity < p.minStock;
                    return (
                      <tr key={p.id} className={lowStock ? 'bg-red-50/50' : 'hover:bg-gray-50/50'}>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900">{p.name}</p>
                          {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`badge ${TYPE_COLOR[p.type]}`}>{p.type}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium">{p.sellPrice.toLocaleString('fr-MA')} MAD</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {lowStock && <AlertTriangle size={14} className="text-red-500" />}
                            <span className={lowStock ? 'font-bold text-red-600' : 'font-medium'}>
                              {p.stockQuantity}
                            </span>
                            <span className="text-gray-400 text-xs">/ {p.minStock}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditing(p); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => confirm('Supprimer ?') && deleteMutation.mutate(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginated?.data.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Aucun produit trouvé</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {paginated && paginated.total > 20 && (
              <div className="flex items-center justify-between px-5 py-3 border-t text-sm">
                <span className="text-gray-500">{paginated.total} produits</span>
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
        <ProductModal
          product={editing}
          onClose={() => setFormOpen(false)}
          onSuccess={() => { setFormOpen(false); qc.invalidateQueries({ queryKey: ['products'] }); }}
        />
      )}
    </div>
  );
}

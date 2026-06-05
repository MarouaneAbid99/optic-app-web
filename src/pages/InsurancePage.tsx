import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Plus, Shield, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInsuranceFiles } from '../hooks/useQuery';
import apiClient from '../hooks/useApi';
import type { InsuranceFile, InsuranceProvider, InsuranceStatus, PaginatedResponse, Client } from '../types/api';

const PROVIDERS: InsuranceProvider[] = ['AMO', 'CNSS', 'CNOPS', 'MUTUELLE'];
const STATUSES: { value: InsuranceStatus; label: string; color: string }[] = [
  { value: 'EN_ATTENTE', label: 'En attente', color: 'bg-gray-100 text-gray-700' },
  { value: 'DEPOSE', label: 'Déposé', color: 'bg-blue-100 text-blue-700' },
  { value: 'REMBOURSE', label: 'Remboursé', color: 'bg-green-100 text-green-700' },
  { value: 'REFUSE', label: 'Refusé', color: 'bg-red-100 text-red-700' },
];

function InsuranceModal({ file, onClose, onSuccess }: { file?: InsuranceFile | null; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    clientId: file?.clientId ? String(file.clientId) : '',
    provider: file?.provider ?? 'AMO' as InsuranceProvider,
    status: file?.status ?? 'EN_ATTENTE' as InsuranceStatus,
    reference: file?.reference ?? '',
    claimedAmount: file?.claimedAmount ? String(file.claimedAmount) : '',
    reimbursedAmount: file?.reimbursedAmount ? String(file.reimbursedAmount) : '',
    submittedAt: file?.submittedAt ? file.submittedAt.split('T')[0] : '',
    reimbursedAt: file?.reimbursedAt ? file.reimbursedAt.split('T')[0] : '',
    notes: file?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);

  const { data: clientsData } = useQuery<PaginatedResponse<Client>>({
    queryKey: ['clients-select'],
    queryFn: () => apiClient.getClients({ limit: 200 }).then(r => r.data),
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId) { toast.error('Sélectionner un client'); return; }
    setLoading(true);
    const payload: Record<string, unknown> = {
      clientId: Number(form.clientId),
      provider: form.provider,
      status: form.status,
      reference: form.reference || undefined,
      claimedAmount: form.claimedAmount ? Number(form.claimedAmount) : undefined,
      reimbursedAmount: form.reimbursedAmount ? Number(form.reimbursedAmount) : undefined,
      submittedAt: form.submittedAt || undefined,
      reimbursedAt: form.reimbursedAt || undefined,
      notes: form.notes || undefined,
    };
    try {
      if (file) {
        await apiClient.updateInsuranceFile(file.id, payload);
        toast.success('Dossier mis à jour');
      } else {
        await apiClient.createInsuranceFile(payload);
        toast.success('Dossier créé');
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
          <h2 className="font-semibold text-lg">{file ? 'Modifier le dossier' : 'Nouveau dossier assurance'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Client *</label>
            <select className="input" value={form.clientId} onChange={set('clientId')} required disabled={!!file}>
              <option value="">— Sélectionner —</option>
              {clientsData?.data.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Organisme *</label>
              <select className="input" value={form.provider} onChange={set('provider')}>
                {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Statut *</label>
              <select className="input" value={form.status} onChange={set('status')}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Référence dossier</label>
            <input className="input" placeholder="N° de référence" value={form.reference} onChange={set('reference')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Montant réclamé (MAD)</label>
              <input className="input" type="number" min="0" step="0.01" value={form.claimedAmount} onChange={set('claimedAmount')} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Montant remboursé (MAD)</label>
              <input className="input" type="number" min="0" step="0.01" value={form.reimbursedAmount} onChange={set('reimbursedAmount')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date de dépôt</label>
              <input className="input" type="date" value={form.submittedAt} onChange={set('submittedAt')} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date de remboursement</label>
              <input className="input" type="date" value={form.reimbursedAt} onChange={set('reimbursedAt')} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={set('notes')} />
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

export default function InsurancePage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<InsuranceStatus | ''>('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InsuranceFile | null>(null);

  const params = { status: statusFilter || undefined, page, limit: 20 };
  const { data, isLoading } = useInsuranceFiles(params);
  const paginated = data as PaginatedResponse<InsuranceFile> | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={22} className="text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Assurances</h1>
          {paginated?.total !== undefined && <span className="badge bg-gray-100 text-gray-600">{paginated.total}</span>}
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouveau dossier
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            statusFilter === '' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
          }`}
        >
          Tous
        </button>
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === s.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
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
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Client</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Organisme</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Statut</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium hidden md:table-cell">Réclamé</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium hidden md:table-cell">Remboursé</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium hidden lg:table-cell">Référence</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated?.data.map((f) => {
                    const statusEntry = STATUSES.find(s => s.value === f.status);
                    return (
                      <tr key={f.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3.5 font-medium text-gray-900">
                          {f.client ? `${f.client.firstName} ${f.client.lastName}` : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="badge bg-indigo-100 text-indigo-700">{f.provider}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`badge ${statusEntry?.color || 'bg-gray-100 text-gray-700'}`}>
                            {statusEntry?.label || f.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right hidden md:table-cell">
                          {f.claimedAmount ? `${f.claimedAmount.toLocaleString('fr-MA')} MAD` : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right hidden md:table-cell text-green-700 font-medium">
                          {f.reimbursedAmount ? `${f.reimbursedAmount.toLocaleString('fr-MA')} MAD` : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs hidden lg:table-cell">{f.reference || '—'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => { setEditing(f); setFormOpen(true); }}
                            className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50 text-gray-600"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {paginated?.data.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Aucun dossier trouvé</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {paginated && paginated.total > 20 && (
              <div className="flex items-center justify-between px-5 py-3 border-t text-sm">
                <span className="text-gray-500">{paginated.total} dossiers</span>
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
        <InsuranceModal
          file={editing}
          onClose={() => setFormOpen(false)}
          onSuccess={() => { setFormOpen(false); qc.invalidateQueries({ queryKey: ['insurance'] }); }}
        />
      )}
    </div>
  );
}

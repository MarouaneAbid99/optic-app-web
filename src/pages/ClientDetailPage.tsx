import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClient } from '../hooks/useQuery';
import apiClient from '../hooks/useApi';
import ClientForm from '../components/ClientForm';
import PrescriptionForm from '../components/PrescriptionForm';
import type { Prescription, Order, InsuranceFile } from '../types/api';

const TABS = ['Infos', 'Ordonnances', 'Commandes', 'Assurances'] as const;
type Tab = typeof TABS[number];

const STATUS_COLOR: Record<string, string> = {
  EN_COURS: 'bg-blue-100 text-blue-700', PRETE: 'bg-yellow-100 text-yellow-700',
  LIVREE: 'bg-green-100 text-green-700', ANNULEE: 'bg-red-100 text-red-700',
};
const STATUS_LABEL: Record<string, string> = {
  EN_COURS: 'En cours', PRETE: 'Prête', LIVREE: 'Livrée', ANNULEE: 'Annulée',
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('Infos');
  const [editOpen, setEditOpen] = useState(false);
  const [prescFormOpen, setPrescFormOpen] = useState(false);
  const [editingPresc, setEditingPresc] = useState<Prescription | null>(null);

  const { data: client, isLoading } = useClient(Number(id));

  const deletePresc = useMutation({
    mutationFn: (pid: number) => apiClient.deletePrescription(pid),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['client', Number(id)] }); toast.success('Ordonnance supprimée'); },
    onError: () => toast.error('Erreur'),
  });

  if (isLoading) return <div className="p-12 text-center text-gray-400">Chargement...</div>;
  if (!client) return <div className="p-12 text-center text-gray-400">Client introuvable</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/clients')} className="p-2 rounded-lg hover:bg-gray-200 text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{client.firstName} {client.lastName}</h1>
          {client.phone && <p className="text-gray-500 text-sm">{client.phone}</p>}
        </div>
        <button onClick={() => setEditOpen(true)} className="btn-secondary flex items-center gap-2">
          <Pencil size={15} /> Modifier
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'Ordonnances' && client.prescriptions?.length ? (
              <span className="ml-1.5 badge bg-gray-100 text-gray-600">{client.prescriptions.length}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Infos' && (
        <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            ['Prénom', client.firstName],
            ['Nom', client.lastName],
            ['Téléphone', client.phone || '—'],
            ['Email', client.email || '—'],
            ['Genre', client.gender === 'M' ? 'Homme' : client.gender === 'F' ? 'Femme' : '—'],
            ['Date de naissance', client.birthDate ? new Date(client.birthDate).toLocaleDateString('fr-MA') : '—'],
            ['Adresse', client.address || '—'],
            ['Notes', client.notes || '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-gray-400 text-xs mb-0.5">{label}</p>
              <p className="font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'Ordonnances' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => { setEditingPresc(null); setPrescFormOpen(true); }} className="btn-primary flex items-center gap-2">
              <Plus size={15} /> Nouvelle ordonnance
            </button>
          </div>
          {client.prescriptions?.length === 0 && (
            <div className="card p-10 text-center text-gray-400">Aucune ordonnance enregistrée</div>
          )}
          {client.prescriptions?.map((p: Prescription) => (
            <div key={p.id} className="card p-4 text-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{new Date(p.date).toLocaleDateString('fr-MA')}</p>
                  {p.doctor && <p className="text-gray-500 text-xs">Dr. {p.doctor}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingPresc(p); setPrescFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => confirm('Supprimer cette ordonnance ?') && deletePresc.mutate(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Œil droit (OD)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {[['Sphère', p.odSphere], ['Cylindre', p.odCylinder], ['Axe', p.odAxis], ['Addition', p.odAddition]].map(([l, v]) => (
                      <div key={l as string}><span className="text-gray-400">{l} : </span><span className="font-medium">{v ?? '—'}</span></div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Œil gauche (OG)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {[['Sphère', p.ogSphere], ['Cylindre', p.ogCylinder], ['Axe', p.ogAxis], ['Addition', p.ogAddition]].map(([l, v]) => (
                      <div key={l as string}><span className="text-gray-400">{l} : </span><span className="font-medium">{v ?? '—'}</span></div>
                    ))}
                  </div>
                </div>
              </div>
              {p.pd && <p className="mt-2 text-xs text-gray-500">PD : <strong>{p.pd} mm</strong></p>}
              {p.notes && <p className="mt-2 text-xs text-gray-500 italic">{p.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'Commandes' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Réf.</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Total</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Payé</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {client.orders?.map((o: Order) => (
                <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-5 py-3 font-mono text-xs font-medium">{o.reference}</td>
                  <td className="px-5 py-3 text-right">{o.totalAmount.toLocaleString('fr-MA')} MAD</td>
                  <td className="px-5 py-3 text-right">{o.paidAmount.toLocaleString('fr-MA')} MAD</td>
                  <td className="px-5 py-3"><span className={`badge ${STATUS_COLOR[o.status]}`}>{STATUS_LABEL[o.status]}</span></td>
                  <td className="px-5 py-3 hidden md:table-cell text-gray-500">{new Date(o.createdAt).toLocaleDateString('fr-MA')}</td>
                </tr>
              ))}
              {!client.orders?.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Aucune commande</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Assurances' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Organisme</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Montant réclamé</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Remboursé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {client.insuranceFiles?.map((f: InsuranceFile) => (
                <tr key={f.id}>
                  <td className="px-5 py-3 font-medium">{f.provider}</td>
                  <td className="px-5 py-3">{f.status}</td>
                  <td className="px-5 py-3 text-right">{f.claimedAmount ? `${f.claimedAmount} MAD` : '—'}</td>
                  <td className="px-5 py-3 text-right">{f.reimbursedAmount ? `${f.reimbursedAmount} MAD` : '—'}</td>
                </tr>
              ))}
              {!client.insuranceFiles?.length && <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Aucun dossier assurance</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editOpen && (
        <ClientForm
          client={client}
          onClose={() => setEditOpen(false)}
          onSuccess={() => { setEditOpen(false); qc.invalidateQueries({ queryKey: ['client', Number(id)] }); }}
        />
      )}
      {prescFormOpen && (
        <PrescriptionForm
          prescription={editingPresc}
          defaultClientId={client.id}
          onClose={() => setPrescFormOpen(false)}
          onSuccess={() => { setPrescFormOpen(false); qc.invalidateQueries({ queryKey: ['client', Number(id)] }); }}
        />
      )}
    </div>
  );
}

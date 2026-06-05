import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../hooks/useApi';
import PrescriptionForm from '../components/PrescriptionForm';
import type { Prescription, PaginatedResponse, Client } from '../types/api';

export default function PrescriptionsPage() {
  const qc = useQueryClient();
  const [clientId, setClientId] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Prescription | null>(null);

  const { data: clientsData } = useQuery<PaginatedResponse<Client>>({
    queryKey: ['clients-select'],
    queryFn: () => apiClient.getClients({ limit: 100 }).then(r => r.data),
  });

  const { data: prescData, isLoading } = useQuery<PaginatedResponse<Prescription>>({
    queryKey: ['prescriptions', { clientId }],
    queryFn: () => apiClient.getPrescriptions({ clientId: Number(clientId) }).then(r => r.data),
    enabled: !!clientId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deletePrescription(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prescriptions'] }); toast.success('Ordonnance supprimée'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={22} className="text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Ordonnances</h1>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="btn-primary flex items-center gap-2"
          disabled={!clientId}
          title={!clientId ? 'Sélectionner un client d\'abord' : ''}
        >
          <Plus size={16} /> Nouvelle ordonnance
        </button>
      </div>

      {/* Client filter */}
      <div className="card p-4">
        <label className="text-sm font-medium text-gray-700 block mb-2">Filtrer par client</label>
        <select
          className="input max-w-sm"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="">— Sélectionner un client —</option>
          {clientsData?.data.map((c) => (
            <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.phone ? `(${c.phone})` : ''}</option>
          ))}
        </select>
      </div>

      {!clientId && (
        <div className="card p-12 text-center text-gray-400">
          <Eye size={40} className="mx-auto mb-3 opacity-30" />
          <p>Sélectionnez un client pour voir ses ordonnances</p>
        </div>
      )}

      {clientId && (
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Chargement...</div>
          ) : (
            <>
              {prescData?.data.length === 0 && (
                <div className="p-12 text-center text-gray-400">Aucune ordonnance pour ce client</div>
              )}
              <div className="divide-y">
                {prescData?.data.map((p: Prescription) => (
                  <div key={p.id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{new Date(p.date).toLocaleDateString('fr-MA')}</p>
                        {p.doctor && <p className="text-xs text-gray-500">Dr. {p.doctor}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(p); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => confirm('Supprimer ?') && deleteMutation.mutate(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[['OD', [p.odSphere, p.odCylinder, p.odAxis, p.odAddition]], ['OG', [p.ogSphere, p.ogCylinder, p.ogAxis, p.ogAddition]]].map(([eye, vals]) => (
                        <div key={eye as string} className="bg-gray-50 rounded-lg p-3">
                          <p className="font-semibold text-gray-600 mb-2">{eye}</p>
                          <div className="grid grid-cols-2 gap-1">
                            {(['Sph', 'Cyl', 'Axe', 'Add'] as string[]).map((lbl, i) => (
                              <div key={lbl}><span className="text-gray-400">{lbl}: </span><strong>{(vals as any[])[i] ?? '—'}</strong></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {p.pd && <p className="mt-2 text-xs text-gray-500">PD : <strong>{p.pd} mm</strong></p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {formOpen && (
        <PrescriptionForm
          prescription={editing}
          defaultClientId={clientId ? Number(clientId) : undefined}
          onClose={() => setFormOpen(false)}
          onSuccess={() => {
            setFormOpen(false);
            qc.invalidateQueries({ queryKey: ['prescriptions'] });
          }}
        />
      )}
    </div>
  );
}

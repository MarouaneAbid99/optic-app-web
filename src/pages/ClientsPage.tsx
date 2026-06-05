import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Eye, Pencil, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClients } from '../hooks/useQuery';
import apiClient from '../hooks/useApi';
import ClientForm from '../components/ClientForm';
import type { Client, PaginatedResponse } from '../types/api';

export default function ClientsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const params = { search: search || undefined, page, limit: 20 };
  const { data, isLoading } = useClients(params);
  const paginated = data as PaginatedResponse<Client> | undefined;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteClient(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); toast.success('Client supprimé'); },
    onError: () => toast.error('Impossible de supprimer (commandes ou ordonnances liées ?)'),
  });

  const handleDelete = (client: Client) => {
    if (confirm(`Supprimer ${client.firstName} ${client.lastName} ?`)) {
      deleteMutation.mutate(client.id);
    }
  };

  const openEdit = (client: Client) => { setEditing(client); setFormOpen(true); };
  const openNew = () => { setEditing(null); setFormOpen(true); };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={22} className="text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          {paginated?.total !== undefined && (
            <span className="badge bg-gray-100 text-gray-600">{paginated.total}</span>
          )}
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Nom, téléphone, email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Chargement...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Nom</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Téléphone</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium hidden md:table-cell">Email</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium hidden lg:table-cell">Genre</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated?.data.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50/50 group">
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{client.phone || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">{client.email || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell">
                        {client.gender === 'M' ? 'Homme' : client.gender === 'F' ? 'Femme' : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEdit(client)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated?.data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                        {search ? `Aucun résultat pour "${search}"` : 'Aucun client enregistré'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paginated && paginated.total > 20 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">
                  {(page - 1) * 20 + 1}–{Math.min(page * 20, paginated.total)} sur {paginated.total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    ←
                  </button>
                  <span className="px-2">Page {page}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 20 >= paginated.total}
                    className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {formOpen && (
        <ClientForm
          client={editing}
          onClose={() => setFormOpen(false)}
          onSuccess={() => {
            setFormOpen(false);
            qc.invalidateQueries({ queryKey: ['clients'] });
          }}
        />
      )}
    </div>
  );
}

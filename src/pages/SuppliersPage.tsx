import { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../hooks/useApi';

type Supplier = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  contact?: string;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', contact: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Nom et email requis');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await apiClient.updateSupplier(editingId, formData);
        setSuppliers(suppliers.map(s => s.id === editingId ? { ...s, ...formData } : s));
        toast.success('Fournisseur mis à jour');
      } else {
        const { data } = await apiClient.createSupplier(formData);
        setSuppliers([...suppliers, data]);
        toast.success('Fournisseur créé');
      }
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', address: '', contact: '' });
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr?')) return;
    try {
      await apiClient.deleteSupplier(id);
      setSuppliers(suppliers.filter(s => s.id !== id));
      toast.success('Fournisseur supprimé');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData(supplier);
    setEditingId(supplier.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestion des fournisseurs produits</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', phone: '', address: '', contact: '' });
            setEditingId(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nouveau fournisseur
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher par nom ou email..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="input w-full"
      />

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Nom</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Téléphone</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Contact</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Adresse</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedSuppliers.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Aucun fournisseur</td></tr>
              ) : (
                paginatedSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">{supplier.name}</td>
                    <td className="px-5 py-4 text-gray-600">{supplier.email}</td>
                    <td className="px-5 py-4 text-gray-600">{supplier.phone}</td>
                    <td className="px-5 py-4 text-gray-600">{supplier.contact || '-'}</td>
                    <td className="px-5 py-4 text-gray-600 text-sm">{supplier.address}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages} ({filteredSuppliers.length} fournisseurs)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
              >
                Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Modifier' : 'Nouveau'} fournisseur
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full"
                  placeholder="email@fournisseur.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input w-full"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="input w-full"
                  placeholder="Personne de contact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input w-full"
                  placeholder="Adresse complète"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

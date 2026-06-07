import { useState } from 'react';
import { AlertTriangle, Edit, Trash2, Plus } from 'lucide-react';
import { useProducts } from '../hooks/useQuery';
import toast from 'react-hot-toast';
import apiClient from '../hooks/useApi';

type Product = {
  id: number;
  name: string;
  type: string;
  brand?: string;
  stockQuantity: number;
  minStock: number;
  sellPrice: number;
};

export default function InventoryPage() {
  const { data: products = [], isLoading, refetch } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const lowStockProducts = products.filter((p: Product) => p.stockQuantity <= p.minStock);
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { label: 'Rupture de stock', color: 'bg-red-100 text-red-700', icon: '❌' };
    if (quantity <= minStock) return { label: 'Stock faible', color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' };
    return { label: 'En stock', color: 'bg-green-100 text-green-700', icon: '✅' };
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr?')) return;
    try {
      await apiClient.deleteProduct(id);
      toast.success('Produit supprimé');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des stocks</h1>
          <p className="text-gray-500 text-sm mt-0.5">Inventaire des produits et niveaux de stock</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nouveau produit
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">⚠️ Alerte Stock Faible</h3>
            <p className="text-sm text-red-800 mt-1">
              {lowStockProducts.length} produit{lowStockProducts.length > 1 ? 's' : ''} en dessous du niveau minimum
            </p>
            <ul className="text-sm text-red-700 mt-2 space-y-1">
              {lowStockProducts.slice(0, 3).map((p: Product) => (
                <li key={p.id}>• {p.name}: {p.stockQuantity} / {p.minStock}</li>
              ))}
              {lowStockProducts.length > 3 && <li>• ... et {lowStockProducts.length - 3} autres</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Tous les produits ({products.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Produit</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Type</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Stock</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Min.</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Prix</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Chargement...</td></tr>
              ) : paginatedProducts.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Aucun produit</td></tr>
              ) : (
                paginatedProducts.map((product: Product) => {
                  const status = getStockStatus(product.stockQuantity, product.minStock);
                  const isLowStock = product.stockQuantity <= product.minStock;
                  return (
                    <tr key={product.id} className={isLowStock ? 'bg-yellow-50' : ''}>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.brand && <p className="text-xs text-gray-400">{product.brand}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{product.type}</td>
                      <td className="px-5 py-4 text-center font-semibold">{product.stockQuantity}</td>
                      <td className="px-5 py-4 text-center text-gray-500">{product.minStock}</td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium">{product.sellPrice.toLocaleString('fr-MA')} MAD</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 hover:bg-blue-50 text-blue-600 rounded">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages} ({products.length} produits)
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
    </div>
  );
}

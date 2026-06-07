import { useState } from 'react';
import { Download, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProducts } from '../hooks/useQuery';
import toast from 'react-hot-toast';

type Product = {
  id: number;
  name: string;
  type: string;
  stockQuantity: number;
  minStock: number;
  sellPrice: number;
};

export default function InventoryReportsPage() {
  const { data: products = [] } = useProducts();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { label: 'Critique', color: 'bg-red-100 text-red-700', icon: '❌' };
    if (quantity <= minStock) return { label: 'Faible', color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' };
    return { label: 'OK', color: 'bg-green-100 text-green-700', icon: '✅' };
  };

  const getDaysToReorder = (quantity: number, minStock: number) => {
    const dailyUsage = 2; // Assume 2 units per day average
    if (quantity <= minStock) return 0;
    return Math.ceil((quantity - minStock) / dailyUsage);
  };

  const lowStockProducts = products.filter((p: Product) => p.stockQuantity <= p.minStock);

  const exportToCSV = () => {
    const headers = ['Produit', 'Type', 'Stock Actuel', 'Stock Min', 'Pourcentage', 'Jours à Réapprovisionner', 'Statut', 'Prix Unitaire'];
    const rows = products.map((p: Product) => {
      const status = getStockStatus(p.stockQuantity, p.minStock);
      const stockPercent = p.minStock > 0 ? Math.round((p.stockQuantity / p.minStock) * 100) : 0;
      const daysToReorder = getDaysToReorder(p.stockQuantity, p.minStock);
      return [
        p.name,
        p.type,
        p.stockQuantity,
        p.minStock,
        `${stockPercent}%`,
        daysToReorder,
        status.label,
        p.sellPrice.toLocaleString('fr-MA'),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-report-${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rapport téléchargé');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports d'Inventaire</h1>
          <p className="text-gray-500 text-sm mt-0.5">Analyse et suivi des stocks</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-primary flex items-center gap-2 w-full md:w-auto"
        >
          <Download size={18} />
          Exporter en CSV
        </button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Stock Faible - {lowStockProducts.length} Produit(s)</h3>
              <p className="text-sm text-red-800 mt-2">
                Les produits suivants sont en dessous de leur niveau minimum de stock:
              </p>
              <ul className="mt-3 space-y-2">
                {lowStockProducts.slice(0, 5).map((p: Product) => (
                  <li key={p.id} className="text-sm text-red-700">
                    • {p.name}: {p.stockQuantity} / {p.minStock}
                  </li>
                ))}
                {lowStockProducts.length > 5 && (
                  <li className="text-sm text-red-700">• ... et {lowStockProducts.length - 5} autres</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stock Level Report */}
      <div className="card">
        <h2 className="px-5 py-4 font-semibold text-gray-900 border-b">Rapport de Stock</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 md:px-5 py-3 text-gray-500 font-medium">Produit</th>
                <th className="text-center px-4 md:px-5 py-3 text-gray-500 font-medium text-xs md:text-sm">Stock</th>
                <th className="text-center px-4 md:px-5 py-3 text-gray-500 font-medium text-xs md:text-sm">Min</th>
                <th className="text-center px-4 md:px-5 py-3 text-gray-500 font-medium text-xs md:text-sm">%</th>
                <th className="text-center px-4 md:px-5 py-3 text-gray-500 font-medium text-xs md:text-sm">Jours</th>
                <th className="text-center px-4 md:px-5 py-3 text-gray-500 font-medium text-xs md:text-sm">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 md:px-5 py-8 text-center text-gray-400">Aucun produit</td></tr>
              ) : (
                products.map((product: Product) => {
                  const status = getStockStatus(product.stockQuantity, product.minStock);
                  const stockPercent = product.minStock > 0 ? Math.round((product.stockQuantity / product.minStock) * 100) : 0;
                  const daysToReorder = getDaysToReorder(product.stockQuantity, product.minStock);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 md:px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm md:text-base">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.type}</p>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 py-4 text-center font-semibold text-sm">{product.stockQuantity}</td>
                      <td className="px-4 md:px-5 py-4 text-center text-gray-600 text-sm">{product.minStock}</td>
                      <td className="px-4 md:px-5 py-4 text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stockPercent >= 100 ? 'bg-green-500' : stockPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(stockPercent, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{stockPercent}%</p>
                      </td>
                      <td className="px-4 md:px-5 py-4 text-center text-sm font-medium">{daysToReorder}</td>
                      <td className="px-4 md:px-5 py-4 text-center">
                        <span className={`badge text-xs ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Produits</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Stock Faible</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
            </div>
            <AlertTriangle className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Taux de Conformité</p>
              <p className="text-2xl font-bold text-blue-600">
                {products.length > 0 ? Math.round(((products.length - lowStockProducts.length) / products.length) * 100) : 0}%
              </p>
            </div>
            <TrendingDown className="text-blue-500" size={40} />
          </div>
        </div>
      </div>
    </div>
  );
}

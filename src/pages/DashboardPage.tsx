import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, AlertTriangle, Clock } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useDashboardStats } from '../hooks/useQuery';
import StatsCard from '../components/StatsCard';
import type { Order } from '../types/api';

const STATUS_LABEL: Record<string, string> = {
  EN_COURS: 'En cours', PRETE: 'Prête', LIVREE: 'Livrée', ANNULEE: 'Annulée',
};
const STATUS_COLOR: Record<string, string> = {
  EN_COURS: 'bg-blue-100 text-blue-700',
  PRETE: 'bg-yellow-100 text-yellow-700',
  LIVREE: 'bg-green-100 text-green-700',
  ANNULEE: 'bg-red-100 text-red-700',
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => <div key={i} className="card h-28" />)}
      </div>
    );
  }

  const revenueData = stats?.revenueByDay || [];
  const topProducts = stats?.topProducts || [];
  const topClients = stats?.topClients || [];
  const ordersByStatus = stats?.ordersByStatus || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-0.5">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Chiffre d'affaires"
          value={`${(stats?.totalRevenue ?? 0).toLocaleString('fr-MA')} MAD`}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard title="Total commandes" value={stats?.ordersCount ?? 0} icon={ShoppingCart} color="green" />
        <StatsCard title="Commandes ouvertes" value={stats?.openOrders ?? 0} icon={Clock} color="orange" />
        <StatsCard title="Clients" value={stats?.clientsCount ?? 0} icon={Users} color="purple" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="px-5 py-4 font-semibold text-gray-900 border-b">Chiffre d'affaires (30 derniers jours)</h3>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="card">
          <h3 className="px-5 py-4 font-semibold text-gray-900 border-b">Top 5 Produits</h3>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="quantity" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients Chart */}
        <div className="card">
          <h3 className="px-5 py-4 font-semibold text-gray-900 border-b">Top 5 Clients</h3>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topClients.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="totalSpent" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status Chart */}
        <div className="card">
          <h3 className="px-5 py-4 font-semibold text-gray-900 border-b">Commandes par statut</h3>
          <div className="p-4 flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ordersByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Commandes récentes</h2>
            <button onClick={() => navigate('/orders')} className="text-blue-600 text-sm hover:underline">
              Voir tout
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Réf.</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Client</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Total</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentOrders?.map((order: Order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td className="px-5 py-3 font-mono text-xs font-medium">{order.reference}</td>
                    <td className="px-5 py-3">
                      {order.client?.firstName} {order.client?.lastName}
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{order.totalAmount.toLocaleString('fr-MA')} MAD</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${STATUS_COLOR[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
                {!stats?.recentOrders?.length && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Aucune commande</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900">Stock faible</h2>
            {stats?.lowStockProducts?.length > 0 && (
              <span className="ml-auto badge bg-amber-100 text-amber-700">
                {stats.lowStockProducts.length}
              </span>
            )}
          </div>
          <div className="divide-y">
            {stats?.lowStockProducts?.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Aucun produit en rupture</p>
            )}
            {stats?.lowStockProducts?.map((p: any) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{p.stockQuantity}</p>
                  <p className="text-xs text-gray-400">min {p.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

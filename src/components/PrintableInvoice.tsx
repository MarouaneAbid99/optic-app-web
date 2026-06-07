import { forwardRef } from 'react';
import type { Order } from '../types/api';

interface PrintableInvoiceProps {
  order: Order;
}

const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ order }, ref) => {
    const currentDate = new Date().toLocaleDateString('fr-MA');
    const totalAmount = order.items?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || order.totalAmount;

    return (
      <div
        ref={ref}
        className="w-full bg-white p-8"
        style={{ maxWidth: '210mm', margin: '0 auto' }}
      >
        {/* Header */}
        <div className="border-b-2 pb-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">OpticApp</h1>
              <p className="text-gray-600 text-sm mt-1">Gestion Optique Professionnelle</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">FACTURE</p>
              <p className="text-gray-600">Ref: {order.reference}</p>
              <p className="text-gray-600 text-sm mt-1">Date: {currentDate}</p>
            </div>
          </div>
        </div>

        {/* Company & Client Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">NOTRE ENTREPRISE:</p>
            <p className="text-sm text-gray-600">OpticApp</p>
            <p className="text-sm text-gray-600">Casablanca, Morocco</p>
            <p className="text-sm text-gray-600">Tel: +212 5XX XXX XXX</p>
            <p className="text-sm text-gray-600">Email: contact@opticapp.ma</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">FACTURÉ À:</p>
            <p className="text-sm font-medium text-gray-900">{order.client?.firstName} {order.client?.lastName}</p>
            {order.client?.email && <p className="text-sm text-gray-600">{order.client.email}</p>}
            {order.client?.phone && <p className="text-sm text-gray-600">{order.client.phone}</p>}
            {order.client?.address && <p className="text-sm text-gray-600">{order.client.address}</p>}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-3 gap-8 mb-8 text-sm">
          <div>
            <p className="text-gray-600">Ref. Commande:</p>
            <p className="font-semibold text-gray-900">{order.reference}</p>
          </div>
          <div>
            <p className="text-gray-600">Date Commande:</p>
            <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString('fr-MA')}</p>
          </div>
          <div>
            <p className="text-gray-600">Statut:</p>
            <p className="font-semibold text-gray-900">{order.status}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-900">Description</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-900">Quantité</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-900">Prix Unitaire</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-3 px-2 text-sm text-gray-900">{item.label}</td>
                <td className="py-3 px-2 text-sm text-gray-600 text-center">{item.quantity}</td>
                <td className="py-3 px-2 text-sm text-gray-600 text-right">
                  {item.unitPrice.toLocaleString('fr-MA')} MAD
                </td>
                <td className="py-3 px-2 text-sm text-gray-900 text-right font-semibold">
                  {(item.unitPrice * item.quantity).toLocaleString('fr-MA')} MAD
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 px-4 bg-gray-50 border border-gray-200">
              <span className="text-sm text-gray-600">Montant Total:</span>
              <span className="text-lg font-bold text-gray-900">
                {totalAmount.toLocaleString('fr-MA')} MAD
              </span>
            </div>
            {order.paidAmount > 0 && (
              <>
                <div className="flex justify-between py-2 px-4 border-l border-r border-gray-200">
                  <span className="text-sm text-gray-600">Montant Payé:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {order.paidAmount.toLocaleString('fr-MA')} MAD
                  </span>
                </div>
                <div className="flex justify-between py-2 px-4 border border-gray-200">
                  <span className="text-sm text-gray-600">Solde:</span>
                  <span className={`text-sm font-semibold ${totalAmount - order.paidAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {(totalAmount - order.paidAmount).toLocaleString('fr-MA')} MAD
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        {order.notes && (
          <div className="mb-8 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-2">Notes:</p>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        <div className="text-center pt-8 border-t border-gray-300 text-xs text-gray-500">
          <p>Merci pour votre confiance!</p>
          <p className="mt-2">OpticApp © {new Date().getFullYear()} - Tous droits réservés</p>
        </div>
      </div>
    );
  }
);

PrintableInvoice.displayName = 'PrintableInvoice';

export default PrintableInvoice;

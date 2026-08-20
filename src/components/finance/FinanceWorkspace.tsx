import React, { useState } from 'react';
import { BarChart3, ReceiptText, Wallet } from 'lucide-react';
import {
  ExpenseReceipt,
  FinancialInvoice,
  FinancialTransaction,
  Hotel,
  ReceiptVerificationStatus,
  Ticket,
  TourPackage,
  TouristProfile,
} from '../../types';
import { FinanceManagementView } from './FinanceManagementView';
import { ExpenseChartsAnalytics } from './ExpenseChartsAnalytics';
import { ReceiptStoreVerificationView } from './ReceiptStoreVerificationView';

interface FinanceWorkspaceProps {
  transactions: FinancialTransaction[];
  invoices: FinancialInvoice[];
  receipts: ExpenseReceipt[];
  tourists: TouristProfile[];
  packages: TourPackage[];
  hotels: Hotel[];
  tickets: Ticket[];
  canRecordPayment: boolean;
  /** Only the administrator may change a receipt or transaction already stored. */
  canEdit?: boolean;
  onAddTransaction: (txn: FinancialTransaction) => void;
  onAddInvoice: (inv: FinancialInvoice) => void;
  onAddReceipt: (receipt: ExpenseReceipt, autoCreateTransaction?: boolean) => void;
  onUpdateReceiptStatus: (
    receiptId: string,
    status: ReceiptVerificationStatus,
    notes?: string,
    verifiedBy?: string,
  ) => void;
  onLinkReceiptToTransaction: (receiptId: string, transactionId: string) => void;
}

/**
 * Finance in one place: the general ledger, the spend analytics, and the
 * receipt store with its verification queue. The analytics and receipt screens
 * existed as standalone components; they belong beside the ledger they explain.
 */
export const FinanceWorkspace: React.FC<FinanceWorkspaceProps> = ({
  transactions,
  invoices,
  receipts,
  tourists,
  packages,
  hotels,
  tickets,
  canRecordPayment,
  canEdit = false,
  onAddTransaction,
  onAddInvoice,
  onAddReceipt,
  onUpdateReceiptStatus,
  onLinkReceiptToTransaction,
}) => {
  const [section, setSection] = useState<'ledger' | 'analytics' | 'receipts'>('ledger');

  const sections = [
    { key: 'ledger' as const, label: 'General ledger', icon: Wallet },
    { key: 'analytics' as const, label: 'Spend analytics', icon: BarChart3 },
    { key: 'receipts' as const, label: `Receipt store (${receipts.length})`, icon: ReceiptText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 w-fit">
          {sections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                section === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {!canRecordPayment && (
          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
            Your role can view finance but not record payments.
          </div>
        )}
      </div>

      {section === 'ledger' && (
        <FinanceManagementView
          transactions={transactions}
          invoices={invoices}
          tourists={tourists}
          packages={packages}
          hotels={hotels}
          tickets={tickets}
          onAddTransaction={onAddTransaction}
          onAddInvoice={onAddInvoice}
        />
      )}

      {section === 'analytics' && (
        <ExpenseChartsAnalytics transactions={transactions} receipts={receipts} />
      )}

      {section === 'receipts' && (
        <ReceiptStoreVerificationView
          receipts={receipts}
          transactions={transactions}
          canEdit={canEdit}
          onAddReceipt={onAddReceipt}
          onUpdateReceiptStatus={onUpdateReceiptStatus}
          onLinkReceiptToTransaction={onLinkReceiptToTransaction}
        />
      )}
    </div>
  );
};

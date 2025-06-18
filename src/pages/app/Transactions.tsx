
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, FileSpreadsheet, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TransactionTable from '@/components/transactions/TransactionTable';
import ManualEntryModal from '@/components/transactions/ManualEntryModal';
import DocumentUploadModal from '@/components/transactions/DocumentUploadModal';
import ImportTemplateModal from '@/components/transactions/ImportTemplateModal';
import { useTransactions } from '@/hooks/useTransactions';

const TRANSACTION_CYCLES = [
  {
    id: 'sales_receipts',
    name: 'Sales & Receipts',
    description: 'Invoices, customer receipts, credit notes, write-offs',
    color: 'bg-green-500'
  },
  {
    id: 'purchases_payments',
    name: 'Purchases & Payments',
    description: 'Vendor bills, payments, debit notes, advances',
    color: 'bg-blue-500'
  },
  {
    id: 'inventory',
    name: 'Inventory & COGS',
    description: 'Inventory receipts, issues, adjustments, cost of sales',
    color: 'bg-purple-500'
  },
  {
    id: 'journal_entries',
    name: 'Journal Entries',
    description: 'Adjustments, accruals, provisions, manual journals',
    color: 'bg-orange-500'
  },
  {
    id: 'payroll',
    name: 'Payroll',
    description: 'Salary expense, PF, TDS, bonuses, reimbursements',
    color: 'bg-teal-500'
  },
  {
    id: 'banking',
    name: 'Banking & Treasury',
    description: 'Bank reconciliations, transfers, charges, interest',
    color: 'bg-indigo-500'
  },
  {
    id: 'taxes',
    name: 'Taxes & Statutory',
    description: 'GST/VAT/TDS entries, tax payments, refunds',
    color: 'bg-red-500'
  },
  {
    id: 'custom',
    name: 'Custom Transactions',
    description: 'Other business-specific transactions',
    color: 'bg-gray-500'
  }
];

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('sales_receipts');
  const [entryMode, setEntryMode] = useState<'manual' | 'upload' | 'import' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const { transactions, loading, createTransaction, updateTransaction } = useTransactions({
    cycle: activeTab,
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    dateRange: dateRange === 'all' ? undefined : dateRange
  });

  const activeCycle = TRANSACTION_CYCLES.find(cycle => cycle.id === activeTab);

  const handleCreateTransaction = async (data: any): Promise<void> => {
    await createTransaction({
      ...data,
      cycle: activeTab,
      source: entryMode || 'manual'
    });
    setEntryMode(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage financial transactions across accounting cycles
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {TRANSACTION_CYCLES.map((cycle) => (
            <TabsTrigger
              key={cycle.id}
              value={cycle.id}
              className="flex flex-col items-center p-2 text-xs"
            >
              <div className={`w-3 h-3 rounded-full ${cycle.color} mb-1`} />
              <span className="hidden sm:block">{cycle.name.split(' ')[0]}</span>
              <span className="sm:hidden">{cycle.name.split(' ')[0].slice(0, 3)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TRANSACTION_CYCLES.map((cycle) => (
          <TabsContent key={cycle.id} value={cycle.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${cycle.color} mr-2`} />
                      {cycle.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {cycle.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEntryMode('manual')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Manual Entry
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEntryMode('upload')}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEntryMode('import')}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Import Template
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transaction Table */}
                <TransactionTable
                  transactions={transactions}
                  loading={loading}
                  onUpdateTransaction={updateTransaction}
                  cycle={cycle}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Modals */}
      {entryMode === 'manual' && (
        <ManualEntryModal
          isOpen={true}
          onClose={() => setEntryMode(null)}
          onSubmit={handleCreateTransaction}
          cycle={activeCycle}
        />
      )}

      {entryMode === 'upload' && (
        <DocumentUploadModal
          isOpen={true}
          onClose={() => setEntryMode(null)}
          onSubmit={handleCreateTransaction}
          cycle={activeCycle}
        />
      )}

      {entryMode === 'import' && (
        <ImportTemplateModal
          isOpen={true}
          onClose={() => setEntryMode(null)}
          onSubmit={handleCreateTransaction}
          cycle={activeCycle}
        />
      )}
    </div>
  );
};

export default Transactions;

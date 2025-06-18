
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  cycle: any;
}

const ImportTemplateModal = ({ isOpen, onClose, onSubmit, cycle }: ImportTemplateModalProps) => {
  const [step, setStep] = useState<'download' | 'upload' | 'preview'>('download');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  const generateTemplate = () => {
    const templateData = [
      ['Date', 'Description', 'Reference', 'Account Code', 'Account Name', 'Debit', 'Credit', 'Line Description'],
      ['2024-06-18', 'Sample transaction', 'REF001', '1002', 'Bank - Current Account', '1000', '0', 'Payment received'],
      ['2024-06-18', 'Sample transaction', 'REF001', '4001', 'Sales Revenue', '0', '1000', 'Sales revenue'],
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cycle.id}_template.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    setSelectedFile(file);
    
    // Parse file (mock implementation)
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // Mock parsing - in reality you'd use a proper CSV/Excel parser
      const lines = content.split('\n').slice(1); // Skip header
      const parsedData = lines.map((line, index) => {
        const columns = line.split(',');
        return {
          id: `import_${index}`,
          transaction_date: columns[0] || '',
          narration: columns[1] || '',
          reference_number: columns[2] || '',
          account_code: columns[3] || '',
          account_name: columns[4] || '',
          debit: parseFloat(columns[5]) || 0,
          credit: parseFloat(columns[6]) || 0,
          line_description: columns[7] || ''
        };
      }).filter(row => row.transaction_date); // Filter out empty rows

      setPreviewData(parsedData);
      setStep('preview');
    };

    reader.readAsText(file);
  };

  const processImport = async () => {
    if (previewData.length === 0) return;

    setImporting(true);
    try {
      // Group lines by transaction (same date + description + reference)
      const groupedTransactions = previewData.reduce((acc: any, line) => {
        const key = `${line.transaction_date}_${line.narration}_${line.reference_number}`;
        if (!acc[key]) {
          acc[key] = {
            transaction_date: line.transaction_date,
            narration: line.narration,
            reference_number: line.reference_number,
            lines: []
          };
        }
        acc[key].lines.push({
          account_id: line.account_code, // In real implementation, map code to ID
          account_name: line.account_name,
          debit: line.debit,
          credit: line.credit,
          description: line.line_description
        });
        return acc;
      }, {});

      // Create transactions
      for (const [key, transaction] of Object.entries(groupedTransactions) as [string, any][]) {
        const totalAmount = transaction.lines.reduce((sum: number, line: any) => 
          sum + Math.max(line.debit, line.credit), 0
        );

        await onSubmit({
          ...transaction,
          amount: totalAmount,
          client_id: '', // This would need to be selected by user
          source: 'import'
        });
      }

      toast.success(`Successfully imported ${Object.keys(groupedTransactions).length} transactions`);
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import transactions');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${cycle.color} mr-2`} />
            Import Template - {cycle.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'download' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Step 1: Download Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Download the CSV template for {cycle.name.toLowerCase()} transactions. 
                    Fill in your transaction data and upload it back.
                  </p>
                  <Button onClick={generateTemplate} className="w-full">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Download {cycle.name} Template
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Step 2: Upload Completed File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Upload your completed CSV or Excel file with transaction data.
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-center"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Import Preview</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {previewData.length} rows to import
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-2 mb-4 p-3 bg-amber-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Review Before Import</h4>
                      <p className="text-sm text-amber-700">
                        Please review the parsed data below. Ensure all amounts balance and accounts are correct.
                      </p>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 text-left">Date</th>
                          <th className="p-2 text-left">Description</th>
                          <th className="p-2 text-left">Account</th>
                          <th className="p-2 text-right">Debit</th>
                          <th className="p-2 text-right">Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{row.transaction_date}</td>
                            <td className="p-2">{row.narration}</td>
                            <td className="p-2 font-mono text-xs">{row.account_name}</td>
                            <td className="p-2 text-right font-mono">
                              {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : '-'}
                            </td>
                            <td className="p-2 text-right font-mono">
                              {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (step === 'preview') {
                  setStep('download');
                  setSelectedFile(null);
                  setPreviewData([]);
                } else {
                  onClose();
                }
              }}
            >
              {step === 'preview' ? 'Back' : 'Cancel'}
            </Button>

            {step === 'preview' && (
              <Button
                onClick={processImport}
                disabled={importing || previewData.length === 0}
                className="min-w-[120px]"
              >
                {importing ? 'Importing...' : `Import ${previewData.length} Rows`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportTemplateModal;

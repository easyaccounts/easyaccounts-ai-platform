
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  cycle: any;
}

const DocumentUploadModal = ({ isOpen, onClose, onSubmit, cycle }: DocumentUploadModalProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, image, or Excel file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const simulateAIExtraction = async (file: File) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted data based on cycle type
    const mockData = {
      sales_receipts: {
        narration: `Invoice payment from ${file.name}`,
        amount: 15000,
        transaction_date: new Date().toISOString().split('T')[0],
        reference_number: 'INV-2024-001',
        lines: [
          { account_id: '1', account_name: '1002 - Bank - Current Account', debit: 15000, credit: 0, description: 'Payment received' },
          { account_id: '5', account_name: '4001 - Sales Revenue', debit: 0, credit: 15000, description: 'Sales revenue' }
        ]
      },
      purchases_payments: {
        narration: `Vendor payment for ${file.name}`,
        amount: 8500,
        transaction_date: new Date().toISOString().split('T')[0],
        reference_number: 'BILL-2024-001',
        lines: [
          { account_id: '7', account_name: '6001 - Office Expenses', debit: 8500, credit: 0, description: 'Office supplies' },
          { account_id: '2', account_name: '1002 - Bank - Current Account', debit: 0, credit: 8500, description: 'Payment made' }
        ]
      },
      journal_entries: {
        narration: `Adjustment entry from ${file.name}`,
        amount: 5000,
        transaction_date: new Date().toISOString().split('T')[0],
        reference_number: 'JE-2024-001',
        lines: [
          { account_id: '7', account_name: '6001 - Office Expenses', debit: 5000, credit: 0, description: 'Accrued expense' },
          { account_id: '4', account_name: '2001 - Accounts Payable', debit: 0, credit: 5000, description: 'Liability recognized' }
        ]
      }
    };

    return mockData[cycle.id as keyof typeof mockData] || mockData.journal_entries;
  };

  const handleUploadAndExtract = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // In a real implementation, you would upload to Supabase Storage
      // and then call an AI service to extract the data
      const extracted = await simulateAIExtraction(selectedFile);
      setExtractedData(extracted);
      toast.success('Document processed successfully!');
    } catch (error) {
      console.error('Error processing document:', error);
      toast.error('Failed to process document');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!extractedData) return;

    try {
      await onSubmit({
        ...extractedData,
        client_id: '', // This would need to be selected by user
        source: 'upload',
        document_url: `uploaded/${selectedFile?.name}` // Mock URL
      });
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${cycle.color} mr-2`} />
            Upload Document - {cycle.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedFile ? (
            <Card>
              <CardContent className="pt-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Upload Document</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your files here, or click to browse
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports PDF, images, and Excel files up to 10MB
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div className="flex-1">
                      <h3 className="font-medium">{selectedFile.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setExtractedData(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {!extractedData && (
                <div className="text-center">
                  <Button
                    onClick={handleUploadAndExtract}
                    disabled={uploading}
                    className="min-w-[160px]"
                  >
                    {uploading ? 'Processing...' : 'Process with AI'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Our AI will extract transaction data from your document
                  </p>
                </div>
              )}

              {extractedData && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">AI Extracted Data</h3>
                        <p className="text-sm text-muted-foreground">
                          Please review and edit the extracted information before submitting
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Amount:</span> ₹{extractedData.amount?.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {extractedData.transaction_date}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Description:</span> {extractedData.narration}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Reference:</span> {extractedData.reference_number}
                      </div>
                    </div>

                    {extractedData.lines && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Journal Lines:</h4>
                        <div className="space-y-2">
                          {extractedData.lines.map((line: any, index: number) => (
                            <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                              <div className="font-mono">
                                {line.account_name}: Dr. ₹{line.debit} | Cr. ₹{line.credit}
                              </div>
                              <div className="text-muted-foreground">{line.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {extractedData && (
              <Button onClick={handleSubmit}>
                Create Transaction
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal;

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useClientContext } from '@/hooks/useClientContext';
import { useSessionContext } from '@/hooks/useSessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, FileText, Eye, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import AddEditReportModal from '@/components/reports/AddEditReportModal';
import FinalisationBar from '@/components/finalisation/FinalisationBar';
import AuditLogViewer from '@/components/audit/AuditLogViewer';

type Report = Database['public']['Tables']['reports']['Row'] & {
  clients?: { name: string };
  approved_user?: { first_name: string; last_name: string };
  finalised_user?: { first_name: string; last_name: string };
  shared_user?: { first_name: string; last_name: string };
};

const Reports = () => {
  const { profile } = useAuth();
  const { selectedClient } = useClientContext();
  const { viewMode } = useSessionContext();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const canManageReports = ['partner', 'senior_staff'].includes(profile?.user_role || '');
  const canGenerateReports = ['partner', 'senior_staff', 'staff'].includes(profile?.user_role || '');

  useEffect(() => {
    if (profile) {
      fetchReports();
    }
  }, [profile, selectedClient, viewMode]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fix: Fetch reports and related data separately
      let query = supabase
        .from('reports')
        .select('*');

      // Apply filters based on user role and view mode
      if (profile?.user_group === 'accounting_firm') {
        query = query.eq('firm_id', profile.firm_id);
        
        // In client view mode, filter by selected client
        if (viewMode === 'client' && selectedClient) {
          query = query.eq('client_id', selectedClient.id);
        }
      } else if (profile?.user_group === 'business_owner') {
        query = query.eq('business_id', profile.business_id);
        // Clients can only see approved reports
        query = query.eq('status', 'approved');
      }

      if (typeFilter !== 'all') {
        query = query.eq('report_type', typeFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query.order('created_at', { ascending: false });

      const { data: reportsData, error } = await query;

      if (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to fetch reports');
        return;
      }

      // Fetch client names separately
      const clientIds = [...new Set(reportsData?.map(r => r.client_id).filter(Boolean) || [])];
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .in('id', clientIds);

      // Fetch approved user names separately
      const approvedIds = [...new Set(reportsData?.map(r => r.approved_by).filter(Boolean) || [])];
      const { data: approvedUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', approvedIds);

      // Fetch finalised user names separately
      const finalisedIds = [...new Set(reportsData?.map(r => r.finalised_by).filter(Boolean) || [])];
      const { data: finalisedUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', finalisedIds);

      // Fetch shared user names separately
      const sharedIds = [...new Set(reportsData?.map(r => r.shared_with_client).filter(Boolean) || [])];
      const { data: sharedUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', sharedIds);

      // Combine data
      const enrichedReports = reportsData?.map(report => ({
        ...report,
        clients: clients?.find(c => c.id === report.client_id),
        approved_user: approvedUsers?.find(u => u.id === report.approved_by),
        finalised_user: finalisedUsers?.find(u => u.id === report.finalised_by),
        shared_user: sharedUsers?.find(u => u.id === report.shared_with_client)
      })) || [];

      setReports(enrichedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = () => {
    setEditingReport(null);
    setModalOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingReport(null);
    fetchReports();
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setActiveTab('view');
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setActiveTab('list');
    fetchReports(); // Refresh data
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending_review': return 'outline';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'under_review': return 'outline';
      case 'final': return 'default';
      case 'shared_with_client': return 'default';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (selectedReport) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="mb-4"
            >
              ← Back to Reports
            </Button>
            <h1 className="text-3xl font-bold">{selectedReport.title}</h1>
            <p className="text-muted-foreground">
              Report Details and Management
            </p>
          </div>
        </div>

        <FinalisationBar
          entityType="report"
          entity={selectedReport}
          onUpdate={handleBackToList}
        />

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="audit">
              <Activity className="w-4 h-4 mr-2" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-sm">{selectedReport.report_type?.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={getStatusColor(selectedReport.status || 'draft')}>
                      {(selectedReport.status || 'draft').replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Period</label>
                    <p className="text-sm">
                      {selectedReport.period_start && selectedReport.period_end
                        ? `${formatDate(selectedReport.period_start)} - ${formatDate(selectedReport.period_end)}`
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Version</label>
                    <p className="text-sm">v{selectedReport.version}</p>
                  </div>
                </div>
                
                {selectedReport.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm mt-1">{selectedReport.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AuditLogViewer entityType="report" entityId={selectedReport.id} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            {viewMode === 'client' && selectedClient 
              ? `Reports for ${selectedClient.name}`
              : 'Generate and manage accounting reports'
            }
          </p>
        </div>
        {canGenerateReports && (
          <Button onClick={handleAddReport}>
            <Plus className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Reports</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="trial_balance">Trial Balance</SelectItem>
                  <SelectItem value="profit_loss">P&L Statement</SelectItem>
                  <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                  <SelectItem value="cash_flow">Cash Flow</SelectItem>
                </SelectContent>
              </Select>
              
              {profile?.user_group === 'accounting_firm' && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="shared_with_client">Shared with Client</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found. {canGenerateReports && 'Generate your first report to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Title</TableHead>
                  {viewMode !== 'client' && <TableHead>Client</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Created {formatDate(report.created_at)}
                        </div>
                      </div>
                    </TableCell>
                    {viewMode !== 'client' && (
                      <TableCell>{report.clients?.name}</TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline">
                        {report.report_type?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.period_start && report.period_end
                        ? `${formatDate(report.period_start)} - ${formatDate(report.period_end)}`
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(report.status || 'draft')}>
                        {(report.status || 'draft').replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>v{report.version}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {report.file_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(report.file_url!, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {canManageReports && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReport(report)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddEditReportModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        report={editingReport}
        onReportSaved={handleModalClose}
      />
    </div>
  );
};

export default Reports;

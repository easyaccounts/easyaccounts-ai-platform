
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { format } from 'date-fns';
import { Clock, User, Activity } from 'lucide-react';

interface AuditLogViewerProps {
  entityType: string;
  entityId: string;
}

const AuditLogViewer = ({ entityType, entityId }: AuditLogViewerProps) => {
  const { auditLogs, loading } = useAuditLogs({ entityType, entityId });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'default';
      case 'edit':
        return 'secondary';
      case 'finalise':
        return 'default';
      case 'share':
        return 'default';
      case 'revoke':
        return 'destructive';
      case 'comment':
        return 'outline';
      case 'approve':
        return 'default';
      case 'submit_for_review':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return '➕';
      case 'edit':
        return '✏️';
      case 'finalise':
        return '✅';
      case 'share':
        return '📤';
      case 'revoke':
        return '🚫';
      case 'comment':
        return '💬';
      case 'approve':
        return '👍';
      case 'submit_for_review':
        return '📋';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No audit trail available</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="text-2xl">{getActionIcon(log.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getActionColor(log.action)}>
                          {log.action.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{log.role}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <User className="w-3 h-3 mr-1" />
                      {log.user_name || 'Unknown User'}
                    </div>
                    
                    {log.description && (
                      <p className="text-sm">{log.description}</p>
                    )}
                    
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          View details
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogViewer;

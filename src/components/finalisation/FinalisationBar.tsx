
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useFinalisation } from '@/hooks/useFinalisation';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { 
  Lock, 
  Share, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

interface FinalisationBarProps {
  entityType: 'report' | 'deliverable';
  entity: any;
  onUpdate?: () => void;
}

const FinalisationBar = ({ entityType, entity, onUpdate }: FinalisationBarProps) => {
  const { profile } = useAuth();
  const { canFinalise, canShare, finaliseEntity, shareWithClient, revokeFinalisation, isFinalising, isSharing, isRevoking } = useFinalisation({ entityType });
  
  const [finaliseDialog, setFinaliseDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [revokeDialog, setRevokeDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [revokeReason, setRevokeReason] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'under_review':
        return 'outline';
      case 'final':
        return 'default';
      case 'shared_with_client':
        return 'default';
      case 'archived':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'under_review':
        return <AlertTriangle className="w-4 h-4" />;
      case 'final':
        return <Lock className="w-4 h-4" />;
      case 'shared_with_client':
        return <Share className="w-4 h-4" />;
      case 'archived':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleFinalise = async () => {
    try {
      await finaliseEntity({ entityId: entity.id, description });
      setFinaliseDialog(false);
      setDescription('');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to finalise:', error);
    }
  };

  const handleShare = async () => {
    try {
      await shareWithClient({ entityId: entity.id, clientNotify: notifyClient });
      setShareDialog(false);
      setNotifyClient(true);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeFinalisation({ entityId: entity.id, reason: revokeReason });
      setRevokeDialog(false);
      setRevokeReason('');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to revoke:', error);
    }
  };

  const handleNotifyClientChange = (checked: boolean | 'indeterminate') => {
    setNotifyClient(checked === true);
  };

  const isFinal = entity.status === 'final';
  const isSharedWithClient = entity.status === 'shared_with_client';
  const canRevoke = isFinal && !isSharedWithClient && canFinalise;

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant={getStatusColor(entity.status)} className="flex items-center space-x-1">
                {getStatusIcon(entity.status)}
                <span>{entity.status?.replace('_', ' ').toUpperCase()}</span>
              </Badge>
              
              {entity.finalised_at && (
                <div className="text-sm text-muted-foreground">
                  Finalised on {format(new Date(entity.finalised_at), 'MMM dd, yyyy HH:mm')}
                </div>
              )}
              
              {entity.shared_with_client_at && (
                <div className="text-sm text-muted-foreground">
                  Shared on {format(new Date(entity.shared_with_client_at), 'MMM dd, yyyy HH:mm')}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {!isFinal && canFinalise && (
                <Button
                  onClick={() => setFinaliseDialog(true)}
                  disabled={isFinalising}
                  size="sm"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isFinalising ? 'Finalising...' : 'Mark as Final'}
                </Button>
              )}

              {isFinal && !isSharedWithClient && canShare && (
                <Button
                  onClick={() => setShareDialog(true)}
                  disabled={isSharing}
                  size="sm"
                >
                  <Share className="w-4 h-4 mr-2" />
                  {isSharing ? 'Sharing...' : 'Share with Client'}
                </Button>
              )}

              {canRevoke && (
                <Button
                  variant="outline"
                  onClick={() => setRevokeDialog(true)}
                  disabled={isRevoking}
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isRevoking ? 'Revoking...' : 'Revoke'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finalise Dialog */}
      <Dialog open={finaliseDialog} onOpenChange={setFinaliseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalise {entityType}</DialogTitle>
            <DialogDescription>
              This will mark the {entityType} as final and lock it from further edits.
              You can still revoke this action if it hasn't been shared with the client.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note about this finalisation..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFinaliseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinalise} disabled={isFinalising}>
              {isFinalising ? 'Finalising...' : 'Finalise'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onOpenChange={setShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share with Client</DialogTitle>
            <DialogDescription>
              This will make the {entityType} available to the client.
              Once shared, finalisation cannot be revoked.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-client"
                checked={notifyClient}
                onCheckedChange={handleNotifyClientChange}
              />
              <Label htmlFor="notify-client">
                Send notification to client
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isSharing}>
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={revokeDialog} onOpenChange={setRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Finalisation</DialogTitle>
            <DialogDescription>
              This will change the status back to "Under Review" and allow further edits.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="revoke-reason">Reason for Revocation</Label>
              <Textarea
                id="revoke-reason"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Explain why you're revoking the finalisation..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRevoke} 
              disabled={isRevoking}
            >
              {isRevoking ? 'Revoking...' : 'Revoke Finalisation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinalisationBar;

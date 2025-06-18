
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDeliverableMessages } from '@/hooks/useDeliverableMessages';
import MessageList from '@/components/messages/MessageList';
import MessageInput from '@/components/messages/MessageInput';

const DeliverableMessages = () => {
  const { deliverableId } = useParams<{ deliverableId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { thread, messages, loading, sendMessage } = useDeliverableMessages(deliverableId!);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading messages...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Unable to load conversation thread.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/app/deliverables')}
            className="mt-4"
          >
            Back to Deliverables
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/app/deliverables')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deliverables
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <MessageSquare className="w-6 h-6 mr-2" />
              {thread.deliverables?.title} - Messages
            </h1>
            <p className="text-muted-foreground">
              {thread.deliverables?.clients?.name}
            </p>
          </div>
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Communication Thread</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <MessageList 
            messages={messages} 
            currentUserId={profile?.id || ''} 
          />
          
          <MessageInput 
            onSendMessage={sendMessage}
            disabled={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliverableMessages;

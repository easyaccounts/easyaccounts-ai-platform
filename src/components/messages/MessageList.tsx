
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type ThreadMessage = Database['public']['Tables']['thread_messages']['Row'] & {
  profiles?: { first_name: string; last_name: string };
  thread_attachments?: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
  }>;
};

interface MessageListProps {
  messages: ThreadMessage[];
  currentUserId: string;
}

const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (url: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const senderName = message.profiles 
          ? `${message.profiles.first_name} ${message.profiles.last_name}`
          : 'Unknown User';

        return (
          <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {getInitials(message.profiles?.first_name, message.profiles?.last_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg p-3 max-w-full ${
                  isOwnMessage 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <div className="text-xs opacity-70 mb-1">
                    {senderName} • {formatTime(message.created_at!)}
                  </div>
                  
                  {message.message && (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.message}
                    </p>
                  )}
                  
                  {message.thread_attachments && message.thread_attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.thread_attachments.map((attachment) => (
                        <div 
                          key={attachment.id} 
                          className={`flex items-center justify-between p-2 rounded ${
                            isOwnMessage ? 'bg-primary-foreground/10' : 'bg-background'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {attachment.file_name}
                            </p>
                            <p className="text-xs opacity-70">
                              {formatFileSize(attachment.file_size)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(attachment.file_url, attachment.file_name)}
                            className="ml-2"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;

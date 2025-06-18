
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to relevant page based on entity type
    switch (notification.entity_type) {
      case 'report':
        navigate('/app/reports');
        break;
      case 'deliverable':
        navigate('/app/deliverables');
        break;
      case 'request':
        navigate('/app/requests');
        break;
      case 'transaction':
        navigate('/app/transactions');
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_report':
      case 'report_shared':
        return '📊';
      case 'status_change':
        return '🔄';
      case 'comment':
        return '💬';
      case 'request_reply':
        return '📝';
      case 'deliverable_update':
        return '📋';
      default:
        return '🔔';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
              className="h-6 px-2"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-3 w-full">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                  </p>
                  {notification.sender_name && (
                    <p className="text-xs text-muted-foreground">
                      From: {notification.sender_name}
                    </p>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-sm text-muted-foreground"
              onClick={() => navigate('/app/notifications')}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;

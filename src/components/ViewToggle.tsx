
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/hooks/useUserContext';
import { Building2, User } from 'lucide-react';

const ViewToggle = () => {
  const { currentView, setCurrentView, userRole } = useUserContext();

  // Only show for accounting firm users who can switch views
  if (userRole !== 'partner' && userRole !== 'senior_staff' && userRole !== 'staff') {
    return null;
  }

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <Button
        size="sm"
        variant={currentView === 'firm' ? 'default' : 'ghost'}
        onClick={() => setCurrentView('firm')}
        className="h-8 px-3"
      >
        <Building2 className="w-4 h-4 mr-1" />
        Firm View
      </Button>
      <Button
        size="sm"
        variant={currentView === 'client' ? 'default' : 'ghost'}
        onClick={() => setCurrentView('client')}
        className="h-8 px-3"
      >
        <User className="w-4 h-4 mr-1" />
        Client View
      </Button>
    </div>
  );
};

export default ViewToggle;

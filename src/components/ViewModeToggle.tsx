
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Building2, User } from 'lucide-react';
import { useSessionContext } from '@/hooks/useSessionContext';

interface ViewModeToggleProps {
  userRole?: string;
}

const ViewModeToggle = ({ userRole }: ViewModeToggleProps) => {
  const { viewMode, setViewMode, loading } = useSessionContext();

  // Only show toggle for partners and management who can switch views
  if (!['partner', 'management'].includes(userRole || '')) {
    return null;
  }

  const handleViewChange = async (mode: 'firm' | 'client') => {
    await setViewMode(mode);
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Eye className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {viewMode === 'firm' ? (
            <>
              <Building2 className="w-4 h-4 mr-2" />
              Firm View
            </>
          ) : (
            <>
              <User className="w-4 h-4 mr-2" />
              Client View
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewChange('firm')}>
          <Building2 className="w-4 h-4 mr-2" />
          Firm View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewChange('client')}>
          <User className="w-4 h-4 mr-2" />
          Client View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ViewModeToggle;

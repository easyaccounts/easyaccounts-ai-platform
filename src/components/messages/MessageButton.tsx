
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface MessageButtonProps {
  deliverableId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const MessageButton = ({ deliverableId, variant = 'ghost', size = 'sm' }: MessageButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/app/deliverables/${deliverableId}/messages`);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
    >
      <MessageSquare className="w-4 h-4" />
    </Button>
  );
};

export default MessageButton;


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_at: string;
  transaction_id: string;
  uploaded_by: string;
}

export const useDocumentManager = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['client-documents', profile?.business_id],
    queryFn: async () => {
      if (!profile?.business_id) return [];
      
      const { data, error } = await supabase
        .from('transaction_documents')
        .select('*')
        .eq('transaction_id', profile.business_id);
      
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!profile?.business_id,
  });

  const uploadDocument = async (file: File) => {
    if (!profile?.business_id) throw new Error('No business ID available');
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `client-docs/${profile.business_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create transaction document record
      const { error: dbError } = await supabase
        .from('transaction_documents')
        .insert({
          transaction_id: profile.business_id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          uploaded_by: profile.id
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['client-documents'] });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return {
    documents,
    isLoading,
    uploading,
    uploadDocument
  };
};

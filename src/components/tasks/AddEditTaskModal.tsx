
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type DeliverableTask = Database['public']['Tables']['deliverable_tasks']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface AddEditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: DeliverableTask | null;
  deliverableId: string;
  onTaskSaved: () => void;
}

const AddEditTaskModal = ({ 
  isOpen, 
  onClose, 
  task, 
  deliverableId, 
  onTaskSaved 
}: AddEditTaskModalProps) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    due_date: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'pending',
          due_date: task.due_date || '',
        });
        fetchTaskAssignments();
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'pending',
          due_date: '',
        });
        setSelectedAssignees([]);
      }
    }
  }, [isOpen, task]);

  const fetchTeamMembers = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .in('user_role', ['senior_staff', 'staff']);

      if (profile?.user_group === 'accounting_firm') {
        query = query.eq('firm_id', profile.firm_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchTaskAssignments = async () => {
    if (!task) return;
    
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('assigned_to')
        .eq('task_id', task.id);

      if (error) throw error;
      setSelectedAssignees(data?.map(a => a.assigned_to) || []);
    } catch (error) {
      console.error('Error fetching task assignments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      let taskId = task?.id;

      if (task) {
        // Update existing task
        const { error } = await supabase
          .from('deliverable_tasks')
          .update({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            due_date: formData.due_date || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id);

        if (error) throw error;
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('deliverable_tasks')
          .insert({
            deliverable_id: deliverableId,
            title: formData.title,
            description: formData.description,
            status: formData.status,
            due_date: formData.due_date || null,
            created_by: profile?.id!,
          })
          .select()
          .single();

        if (error) throw error;
        taskId = data.id;
      }

      // Update task assignments
      if (taskId) {
        // Remove existing assignments
        await supabase
          .from('task_assignments')
          .delete()
          .eq('task_id', taskId);

        // Add new assignments
        if (selectedAssignees.length > 0) {
          const assignments = selectedAssignees.map(assigneeId => ({
            task_id: taskId,
            assigned_to: assigneeId,
            assigned_by: profile?.id!,
          }));

          const { error: assignError } = await supabase
            .from('task_assignments')
            .insert(assignments);

          if (assignError) throw assignError;
        }
      }

      toast.success(task ? 'Task updated successfully' : 'Task created successfully');
      onTaskSaved();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeToggle = (assigneeId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(assigneeId) 
        ? prev.filter(id => id !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign To</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={member.id}
                    checked={selectedAssignees.includes(member.id)}
                    onCheckedChange={() => handleAssigneeToggle(member.id)}
                  />
                  <Label htmlFor={member.id} className="text-sm font-normal">
                    {member.first_name} {member.last_name} ({member.user_role})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditTaskModal;

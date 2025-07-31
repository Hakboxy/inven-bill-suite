import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'user';
  status: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: 'admin' | 'manager' | 'user';
  }) => {
    try {
      setLoading(true);
      setError(null);

      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        }
      });

      if (authError) throw authError;

      // Update profile with additional data
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            role: userData.role || 'user',
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User created successfully",
      });

      return authData.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Delete the auth user (this will cascade to profile)
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) throw authError;

      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id: string, status: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      await fetchUsers();
      
      toast({
        title: "Success",
        description: `User ${status ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Set up realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refetch: fetchUsers,
  };
};
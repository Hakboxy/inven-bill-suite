import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StockMovement {
  id?: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  movement_type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer';
  quantity_change: number;
  stock_before: number;
  stock_after: number;
  reason?: string;
  reference_id?: string;
  reference_type?: string;
  movement_date: string;
  created_by?: string;
  created_at?: string;
}

export const useStockMovements = () => {
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStockMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('movement_date', { ascending: false });

      if (error) throw error;
      setStockMovements((data || []) as StockMovement[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stock movements';
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

  const createStockMovement = async (movementData: Omit<StockMovement, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const stockMovementPayload = {
        ...movementData,
        created_by: user?.id,
      };

      const { data: newMovement, error } = await supabase
        .from('stock_movements')
        .insert([stockMovementPayload])
        .select()
        .single();

      if (error) throw error;

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: movementData.stock_after })
        .eq('id', movementData.product_id);

      if (updateError) throw updateError;

      await fetchStockMovements();
      
      toast({
        title: "Success",
        description: "Stock movement recorded successfully",
      });

      return newMovement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create stock movement';
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

  const updateStockMovement = async (id: string, updates: Partial<StockMovement>) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('stock_movements')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchStockMovements();
      
      toast({
        title: "Success",
        description: "Stock movement updated successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stock movement';
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

  const deleteStockMovement = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('stock_movements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchStockMovements();
      
      toast({
        title: "Success",
        description: "Stock movement deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete stock movement';
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

  const createStockAdjustment = async (
    productId: string,
    productName: string,
    productSku: string | undefined,
    currentStock: number,
    newStock: number,
    reason: string
  ) => {
    const quantityChange = newStock - currentStock;
    
    await createStockMovement({
      product_id: productId,
      product_name: productName,
      product_sku: productSku,
      movement_type: 'adjustment',
      quantity_change: quantityChange,
      stock_before: currentStock,
      stock_after: newStock,
      reason,
      movement_date: new Date().toISOString(),
    });
  };

  useEffect(() => {
    fetchStockMovements();
  }, []);

  return {
    stockMovements,
    loading,
    error,
    createStockMovement,
    updateStockMovement,
    deleteStockMovement,
    createStockAdjustment,
    refetch: fetchStockMovements,
  };
};
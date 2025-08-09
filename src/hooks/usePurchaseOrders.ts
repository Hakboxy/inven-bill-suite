import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PurchaseOrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface PurchaseOrder {
  id?: string;
  po_number: string;
  vendor_id?: string;
  vendor_name: string;
  order_date: string;
  expected_delivery_date?: string;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  items?: PurchaseOrderItem[];
}

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          items:purchase_order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchaseOrders((data || []) as PurchaseOrder[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch purchase orders';
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

  const generatePONumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_po_number');
    if (error) throw error;
    return data;
  };

  const createPurchaseOrder = async (orderData: Omit<PurchaseOrder, 'id' | 'po_number' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      // Generate PO number
      const poNumber = await generatePONumber();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const purchaseOrderPayload = {
        ...orderData,
        po_number: poNumber,
        created_by: user?.id,
      };

      // Create purchase order
      const { data: newPO, error: poError } = await supabase
        .from('purchase_orders')
        .insert([purchaseOrderPayload])
        .select()
        .maybeSingle();

      if (poError) throw poError;
      if (!newPO) throw new Error('Failed to create purchase order');

      // Create purchase order items if provided
      if (orderData.items && orderData.items.length > 0) {
        const itemsPayload = orderData.items.map(item => ({
          ...item,
          purchase_order_id: newPO.id,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsPayload);

        if (itemsError) throw itemsError;
      }

      await fetchPurchaseOrders();
      
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });

      return newPO;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create purchase order';
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

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      setLoading(true);
      setError(null);

      const { items, ...orderUpdates } = updates;

      // Update purchase order
      const { error: poError } = await supabase
        .from('purchase_orders')
        .update(orderUpdates)
        .eq('id', id);

      if (poError) throw poError;

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('purchase_order_items')
          .delete()
          .eq('purchase_order_id', id);

        // Insert new items
        if (items.length > 0) {
          const itemsPayload = items.map(item => ({
            ...item,
            purchase_order_id: id,
          }));

          const { error: itemsError } = await supabase
            .from('purchase_order_items')
            .insert(itemsPayload);

          if (itemsError) throw itemsError;
        }
      }

      await fetchPurchaseOrders();
      
      toast({
        title: "Success",
        description: "Purchase order updated successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update purchase order';
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

  const deletePurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPurchaseOrders();
      
      toast({
        title: "Success",
        description: "Purchase order deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete purchase order';
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

  const updatePOStatus = async (id: string, status: PurchaseOrder['status']) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('purchase_orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      await fetchPurchaseOrders();
      
      toast({
        title: "Success",
        description: `Purchase order ${status} successfully`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update purchase order status';
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
    fetchPurchaseOrders();
  }, []);

  return {
    purchaseOrders,
    loading,
    error,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    updatePOStatus,
    refetch: fetchPurchaseOrders,
  };
};
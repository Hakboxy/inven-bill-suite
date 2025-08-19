import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SalesOrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SalesOrder {
  id?: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  order_date: string;
  expected_delivery_date?: string;
  status: 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  shipping_address?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  items?: SalesOrderItem[];
}

export const useSalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('sales_orders')
        .select(`*, items:sales_order_items(*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSalesOrders((data || []) as SalesOrder[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sales orders';
      setError(message);
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateOrderNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_order_number');
    if (error) throw error;
    return data as string;
  };

  const createSalesOrder = async (
    orderData: Omit<SalesOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const orderNumber = await generateOrderNumber();
      const { data: { user } } = await supabase.auth.getUser();

      // Separate items from order data
      const { items, ...orderPayload } = orderData;
      const payload = {
        ...orderPayload,
        order_number: orderNumber,
        created_by: user?.id,
      };

      const { data: newOrder, error: orderError } = await supabase
        .from('sales_orders')
        .insert([payload])
        .select()
        .maybeSingle();

      if (orderError) throw orderError;
      if (!newOrder) throw new Error('Failed to create sales order');

      if (items && items.length > 0) {
        const itemsPayload = items.map((item) => ({
          ...item,
          sales_order_id: newOrder.id,
        }));

        const { error: itemsError } = await supabase
          .from('sales_order_items')
          .insert(itemsPayload);

        if (itemsError) throw itemsError;
      }

      await fetchSalesOrders();
      toast({ title: 'Success', description: 'Sales order created successfully' });
      return newOrder as SalesOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create sales order';
      setError(message);
      toast({ title: 'Error', description: message, variant: 'destructive' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSalesOrder = async (id: string, updates: Partial<SalesOrder>) => {
    try {
      setLoading(true);
      setError(null);

      const { items, ...orderUpdates } = updates as any;

      const { error: orderError } = await supabase
        .from('sales_orders')
        .update(orderUpdates)
        .eq('id', id);

      if (orderError) throw orderError;

      if (items) {
        await supabase.from('sales_order_items').delete().eq('sales_order_id', id);
        if (items.length > 0) {
          const itemsPayload = items.map((item: SalesOrderItem) => ({
            ...item,
            sales_order_id: id,
          }));
          const { error: itemsError } = await supabase
            .from('sales_order_items')
            .insert(itemsPayload);
          if (itemsError) throw itemsError;
        }
      }

      await fetchSalesOrders();
      toast({ title: 'Success', description: 'Sales order updated successfully' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update sales order';
      setError(message);
      toast({ title: 'Error', description: message, variant: 'destructive' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSalesOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Delete items first to avoid potential FK issues
      await supabase.from('sales_order_items').delete().eq('sales_order_id', id);

      const { error } = await supabase.from('sales_orders').delete().eq('id', id);
      if (error) throw error;

      await fetchSalesOrders();
      toast({ title: 'Success', description: 'Sales order deleted successfully' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete sales order';
      setError(message);
      toast({ title: 'Error', description: message, variant: 'destructive' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    id: string,
    status: SalesOrder['status']
  ) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('sales_orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      await fetchSalesOrders();
      toast({ title: 'Success', description: `Order ${status}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      setError(message);
      toast({ title: 'Error', description: message, variant: 'destructive' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  return {
    salesOrders,
    loading,
    error,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    updateOrderStatus,
    refetch: fetchSalesOrders,
  };
};

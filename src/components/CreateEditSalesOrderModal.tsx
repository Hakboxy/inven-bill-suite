import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useSalesOrders, SalesOrder } from '@/hooks/useSalesOrders';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const salesOrderItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  product_name: z.string(),
  product_sku: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  total_price: z.number(),
});

const salesOrderSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  customer_name: z.string().min(1, 'Customer is required'),
  order_date: z.date(),
  expected_delivery_date: z.date().optional(),
  status: z.enum(['draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  tax_rate: z.number().min(0).max(100),
  notes: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1, 'At least one item is required'),
});

export type SalesOrderFormData = z.infer<typeof salesOrderSchema>;

interface CreateEditSalesOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrder?: SalesOrder | null;
}

export function CreateEditSalesOrderModal({ open, onOpenChange, salesOrder }: CreateEditSalesOrderModalProps) {
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { createSalesOrder, updateSalesOrder, loading } = useSalesOrders();
  const { toast } = useToast();

  const form = useForm<SalesOrderFormData>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      customer_id: '',
      customer_name: '',
      order_date: new Date(),
      expected_delivery_date: undefined,
      status: 'draft',
      tax_rate: 0,
      notes: '',
      items: [
        {
          product_id: '',
          product_name: '',
          product_sku: '',
          quantity: 1,
          unit_price: 0,
          total_price: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (salesOrder && open) {
      form.reset({
        customer_id: salesOrder.customer_id || '',
        customer_name: salesOrder.customer_name,
        order_date: new Date(salesOrder.order_date),
        expected_delivery_date: salesOrder.expected_delivery_date ? new Date(salesOrder.expected_delivery_date) : undefined,
        status: salesOrder.status,
        tax_rate: 0,
        notes: salesOrder.notes || '',
        items: (salesOrder.items || []).map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          product_sku: i.product_sku,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total_price: i.total_price,
        })),
      });
    } else if (!salesOrder && open) {
      form.reset({
        customer_id: '',
        customer_name: '',
        order_date: new Date(),
        expected_delivery_date: undefined,
        status: 'draft',
        tax_rate: 0,
        notes: '',
        items: [
          {
            product_id: '',
            product_name: '',
            product_sku: '',
            quantity: 1,
            unit_price: 0,
            total_price: 0,
          },
        ],
      });
    }
  }, [salesOrder, open, form]);

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    form.setValue('customer_name', customer?.name || '');
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.product_name`, product.name);
      form.setValue(`items.${index}.product_sku`, product.sku);
      form.setValue(`items.${index}.unit_price`, product.price || 0);
      calculateItemTotal(index);
    }
  };

  const calculateItemTotal = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`);
    const unitPrice = form.getValues(`items.${index}.unit_price`);
    form.setValue(`items.${index}.total_price`, quantity * unitPrice);
  };

  const calculateTotals = () => {
    const items = form.getValues('items');
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const taxRate = form.getValues('tax_rate');
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const onSubmit = async (data: SalesOrderFormData) => {
    try {
      const { subtotal, taxAmount, total } = calculateTotals();

      const orderData = {
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        status: data.status,
        notes: data.notes,
        subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        order_date: format(data.order_date, 'yyyy-MM-dd'),
        expected_delivery_date: data.expected_delivery_date ? format(data.expected_delivery_date, 'yyyy-MM-dd') : undefined,
        items: data.items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      } as Partial<SalesOrder> & { items: any[] };

      if (salesOrder?.id) {
        await updateSalesOrder(salesOrder.id, orderData);
      } else {
        await createSalesOrder(orderData as any);
      }

      form.reset();
      onOpenChange(false);
      toast({ title: 'Success', description: `Sales order ${salesOrder ? 'updated' : 'created'} successfully` });
    } catch (error) {
      console.error('Sales order submit error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${salesOrder ? 'update' : 'create'} sales order`,
        variant: 'destructive',
      });
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{salesOrder ? 'Edit Sales Order' : 'Create Sales Order'}</DialogTitle>
          <DialogDescription>
            {salesOrder ? 'Update the sales order details and items.' : 'Create a new sales order by filling in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCustomerChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Order Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_delivery_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter any additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Sales Order Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      product_id: '',
                      product_name: '',
                      product_sku: '',
                      quantity: 1,
                      unit_price: 0,
                      total_price: 0,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                  <div className="col-span-4">
                    <FormLabel>Product</FormLabel>
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_id`}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleProductChange(index, value);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormLabel>Quantity</FormLabel>
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => {
                            const val = parseInt(e.target.value || '0', 10);
                            field.onChange(val);
                            calculateItemTotal(index);
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormLabel>Unit Price</FormLabel>
                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_price`}
                      render={({ field }) => (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value || '0');
                            field.onChange(val);
                            calculateItemTotal(index);
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormLabel>Total</FormLabel>
                    <Input value={form.watch(`items.${index}.total_price`) || 0} readOnly />
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Subtotal</div>
                  <div className="text-xl font-semibold">${subtotal.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tax</div>
                  <div className="text-xl font-semibold">${taxAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="text-xl font-semibold">${total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {salesOrder ? 'Update Order' : 'Create Order'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { useVendors } from '@/hooks/useVendors';
import { useProducts } from '@/hooks/useProducts';
import { usePurchaseOrders, PurchaseOrder, PurchaseOrderItem } from '@/hooks/usePurchaseOrders';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const purchaseOrderItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  product_name: z.string(),
  product_sku: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_cost: z.number().min(0, 'Unit cost must be non-negative'),
  total_cost: z.number(),
});

const purchaseOrderSchema = z.object({
  vendor_id: z.string().min(1, 'Vendor is required'),
  vendor_name: z.string(),
  order_date: z.date(),
  expected_delivery_date: z.date().optional(),
  status: z.enum(['draft', 'sent', 'received', 'cancelled']),
  tax_rate: z.number().min(0).max(100),
  notes: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface CreateEditPurchaseOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder?: PurchaseOrder | null;
}

export function CreateEditPurchaseOrderModal({ 
  open, 
  onOpenChange, 
  purchaseOrder 
}: CreateEditPurchaseOrderModalProps) {
  const { vendors } = useVendors();
  const { products } = useProducts();
  const { createPurchaseOrder, updatePurchaseOrder, loading } = usePurchaseOrders();
  const { toast } = useToast();
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      vendor_id: '',
      vendor_name: '',
      order_date: new Date(),
      expected_delivery_date: undefined,
      status: 'draft',
      tax_rate: 0,
      notes: '',
      items: [{
        product_id: '',
        product_name: '',
        product_sku: '',
        quantity: 1,
        unit_cost: 0,
        total_cost: 0,
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (purchaseOrder && open) {
      const vendor = vendors.find(v => v.id === purchaseOrder.vendor_id);
      setSelectedVendor(vendor);
      
      form.reset({
        vendor_id: purchaseOrder.vendor_id || '',
        vendor_name: purchaseOrder.vendor_name,
        order_date: new Date(purchaseOrder.order_date),
        expected_delivery_date: purchaseOrder.expected_delivery_date 
          ? new Date(purchaseOrder.expected_delivery_date) 
          : undefined,
        status: purchaseOrder.status,
        tax_rate: purchaseOrder.tax_rate,
        notes: purchaseOrder.notes || '',
        items: purchaseOrder.items || [{
          product_id: '',
          product_name: '',
          product_sku: '',
          quantity: 1,
          unit_cost: 0,
          total_cost: 0,
        }],
      });
    } else if (!purchaseOrder && open) {
      form.reset({
        vendor_id: '',
        vendor_name: '',
        order_date: new Date(),
        expected_delivery_date: undefined,
        status: 'draft',
        tax_rate: 0,
        notes: '',
        items: [{
          product_id: '',
          product_name: '',
          product_sku: '',
          quantity: 1,
          unit_cost: 0,
          total_cost: 0,
        }],
      });
      setSelectedVendor(null);
    }
  }, [purchaseOrder, open, vendors, form]);

  const handleVendorChange = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    setSelectedVendor(vendor);
    form.setValue('vendor_name', vendor?.name || '');
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.product_name`, product.name);
      form.setValue(`items.${index}.product_sku`, product.sku);
      form.setValue(`items.${index}.unit_cost`, product.cost || 0);
      calculateItemTotal(index);
    }
  };

  const calculateItemTotal = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`);
    const unitCost = form.getValues(`items.${index}.unit_cost`);
    const total = quantity * unitCost;
    form.setValue(`items.${index}.total_cost`, total);
  };

  const calculateTotals = () => {
    const items = form.getValues('items');
    const subtotal = items.reduce((sum, item) => sum + item.total_cost, 0);
    const taxRate = form.getValues('tax_rate');
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const onSubmit = async (data: PurchaseOrderFormData) => {
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      
      const orderData = {
        vendor_id: data.vendor_id,
        vendor_name: data.vendor_name,
        status: data.status,
        tax_rate: data.tax_rate,
        notes: data.notes,
        subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        order_date: format(data.order_date, 'yyyy-MM-dd'),
        expected_delivery_date: data.expected_delivery_date 
          ? format(data.expected_delivery_date, 'yyyy-MM-dd')
          : undefined,
        items: data.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
        })),
      };

      if (purchaseOrder?.id) {
        await updatePurchaseOrder(purchaseOrder.id, orderData);
      } else {
        await createPurchaseOrder(orderData);
      }
      
      form.reset();
      setSelectedVendor(null);
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: `Purchase order ${purchaseOrder ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${purchaseOrder ? 'update' : 'create'} purchase order`,
        variant: "destructive",
      });
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {purchaseOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
          </DialogTitle>
          <DialogDescription>
            {purchaseOrder 
              ? 'Update the purchase order details and items.' 
              : 'Create a new purchase order by filling in the details below.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleVendorChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
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
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
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
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
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
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
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
                    <Textarea
                      placeholder="Enter any additional notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Purchase Order Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    product_id: '',
                    product_name: '',
                    product_sku: '',
                    quantity: 1,
                    unit_cost: 0,
                    total_cost: 0,
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
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
                            field.onChange(parseInt(e.target.value) || 1);
                            calculateItemTotal(index);
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormLabel>Unit Cost</FormLabel>
                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_cost`}
                      render={({ field }) => (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            calculateItemTotal(index);
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormLabel>Total Cost</FormLabel>
                    <Input
                      type="number"
                      value={form.watch(`items.${index}.total_cost`)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="col-span-2">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({form.watch('tax_rate')}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : purchaseOrder ? 'Update Purchase Order' : 'Create Purchase Order'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
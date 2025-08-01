import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useProducts } from '@/hooks/useProducts';
import { useStockMovements } from '@/hooks/useStockMovements';
import { useToast } from '@/hooks/use-toast';

const stockAdjustmentSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  new_stock: z.number().min(0, 'Stock cannot be negative'),
  reason: z.string().min(1, 'Reason is required'),
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

interface StockAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockAdjustmentModal({ open, onOpenChange }: StockAdjustmentModalProps) {
  const { products } = useProducts();
  const { createStockAdjustment, loading } = useStockMovements();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const form = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      product_id: '',
      new_stock: 0,
      reason: '',
    },
  });

  const onSubmit = async (data: StockAdjustmentFormData) => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    try {
      await createStockAdjustment(
        selectedProduct.id,
        selectedProduct.name,
        selectedProduct.sku,
        selectedProduct.stock,
        data.new_stock,
        data.reason
      );
      
      form.reset();
      setSelectedProduct(null);
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Stock adjustment recorded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record stock adjustment",
        variant: "destructive",
      });
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    form.setValue('new_stock', product?.stock || 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Stock Adjustment</DialogTitle>
          <DialogDescription>
            Adjust stock levels for products. This will create a stock movement record.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleProductChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku}) - Current: {product.stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Current Stock: <span className="font-medium">{selectedProduct.stock}</span>
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="new_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Stock Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Change: <span className={`font-medium ${
                    (form.watch('new_stock') - selectedProduct.stock) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(form.watch('new_stock') - selectedProduct.stock) >= 0 ? '+' : ''}
                    {form.watch('new_stock') - selectedProduct.stock}
                  </span>
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Adjustment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reason for stock adjustment..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {loading ? 'Adjusting...' : 'Adjust Stock'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
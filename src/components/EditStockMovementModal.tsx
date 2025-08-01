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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useStockMovements, StockMovement } from '@/hooks/useStockMovements';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const editMovementSchema = z.object({
  reason: z.string().optional(),
});

type EditMovementFormData = z.infer<typeof editMovementSchema>;

interface EditStockMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: StockMovement | null;
}

export function EditStockMovementModal({ open, onOpenChange, movement }: EditStockMovementModalProps) {
  const { updateStockMovement, loading } = useStockMovements();
  const { toast } = useToast();

  const form = useForm<EditMovementFormData>({
    resolver: zodResolver(editMovementSchema),
    defaultValues: {
      reason: '',
    },
  });

  useEffect(() => {
    if (movement) {
      form.reset({
        reason: movement.reason || '',
      });
    }
  }, [movement, form]);

  const onSubmit = async (data: EditMovementFormData) => {
    if (!movement?.id) return;

    try {
      await updateStockMovement(movement.id, data);
      
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Stock movement updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock movement",
        variant: "destructive",
      });
    }
  };

  if (!movement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Stock Movement</DialogTitle>
          <DialogDescription>
            Update the reason for this stock movement. Stock quantities cannot be modified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Movement Details (Read-only) */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Product:</span>
                <p className="font-medium">{movement.product_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium capitalize">{movement.movement_type}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Quantity Change:</span>
                <p className="font-medium">{movement.quantity_change}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">{new Date(movement.movement_date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Stock Before:</span>
                <p className="font-medium">{movement.stock_before}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Stock After:</span>
                <p className="font-medium">{movement.stock_after}</p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter reason for this stock movement..."
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
                  {loading ? 'Updating...' : 'Update Movement'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
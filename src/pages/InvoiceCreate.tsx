
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Save,
  Send,
  ArrowLeft,
  Calculator,
  User,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceFormData {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
  total: number;
  notes: string;
  terms: string;
}

export default function InvoiceCreate() {
  const [previewMode, setPreviewMode] = useState(false);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      taxRate: 10,
      discountType: "percentage",
      discountValue: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedTaxRate = watch("taxRate");
  const watchedDiscountType = watch("discountType");
  const watchedDiscountValue = watch("discountValue");

  // Calculate totals
  React.useEffect(() => {
    const subtotal = watchedItems.reduce((sum, item) => {
      const amount = (item.quantity || 0) * (item.rate || 0);
      return sum + amount;
    }, 0);

    const discountAmount = watchedDiscountType === "percentage" 
      ? subtotal * ((watchedDiscountValue || 0) / 100)
      : (watchedDiscountValue || 0);

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((watchedTaxRate || 0) / 100);
    const total = taxableAmount + taxAmount;

    setValue("subtotal", subtotal);
    setValue("discountAmount", discountAmount);
    setValue("taxAmount", taxAmount);
    setValue("total", total);

    // Update individual item amounts
    watchedItems.forEach((item, index) => {
      const amount = (item.quantity || 0) * (item.rate || 0);
      setValue(`items.${index}.amount`, amount);
    });
  }, [watchedItems, watchedTaxRate, watchedDiscountType, watchedDiscountValue, setValue]);

  const onSubmit = (data: InvoiceFormData) => {
    console.log("Invoice data:", data);
    // Handle invoice creation
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="flex justify-between">
                <div>
                  <h1 className="text-3xl font-bold">INVOICE</h1>
                  <p className="text-muted-foreground">#{watch("invoiceNumber")}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">InvenBill</div>
                  <p className="text-muted-foreground">Business Suite</p>
                </div>
              </div>

              {/* Customer and Date Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <div className="space-y-1">
                    <p className="font-medium">{watch("customerName")}</p>
                    <p className="text-muted-foreground">{watch("customerEmail")}</p>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {watch("customerAddress")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Issue Date: </span>
                      {new Date(watch("issueDate")).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Due Date: </span>
                      {new Date(watch("dueDate")).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchedItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.description}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">{formatCurrency(item.rate)}</td>
                        <td className="text-right py-2">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(watch("subtotal"))}</span>
                  </div>
                  {watch("discountAmount") > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(watch("discountAmount"))}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax ({watch("taxRate")}%):</span>
                    <span>{formatCurrency(watch("taxAmount"))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(watch("total"))}</span>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              {watch("notes") && (
                <div>
                  <h3 className="font-semibold mb-2">Notes:</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{watch("notes")}</p>
                </div>
              )}
              
              {watch("terms") && (
                <div>
                  <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{watch("terms")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            Create a new invoice for your customer
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/invoices">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            Preview
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    {...register("customerName", { required: "Customer name is required" })}
                    placeholder="Enter customer name"
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-600">{errors.customerName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    {...register("customerEmail", { 
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email address"
                      }
                    })}
                    placeholder="customer@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-red-600">{errors.customerEmail.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Billing Address</Label>
                <Textarea
                  id="customerAddress"
                  {...register("customerAddress")}
                  placeholder="Enter billing address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  {...register("invoiceNumber", { required: "Invoice number is required" })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  {...register("issueDate", { required: "Issue date is required" })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register("dueDate", { required: "Due date is required" })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-12 md:col-span-5">
                    <Label htmlFor={`items.${index}.description`}>Description</Label>
                    <Input
                      {...register(`items.${index}.description`, { 
                        required: "Description is required" 
                      })}
                      placeholder="Item description"
                    />
                  </div>
                  
                  <div className="col-span-4 md:col-span-2">
                    <Label htmlFor={`items.${index}.quantity`}>Qty</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.quantity`, { 
                        required: "Quantity is required",
                        min: { value: 0.01, message: "Quantity must be positive" }
                      })}
                      placeholder="1"
                    />
                  </div>
                  
                  <div className="col-span-4 md:col-span-2">
                    <Label htmlFor={`items.${index}.rate`}>Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.rate`, { 
                        required: "Rate is required",
                        min: { value: 0, message: "Rate must be positive" }
                      })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="col-span-3 md:col-span-2">
                    <Label>Amount</Label>
                    <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
                      {formatCurrency(watchedItems[index]?.amount || 0)}
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ description: "", quantity: 1, rate: 0, amount: 0 })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Totals and Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Additional notes for the customer"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  {...register("terms")}
                  placeholder="Payment terms and conditions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select value={watchedDiscountType} onValueChange={(value: "percentage" | "fixed") => setValue("discountType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Discount Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("discountValue", { min: 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("taxRate", { min: 0, max: 100 })}
                  placeholder="10"
                />
              </div>

              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(watch("subtotal"))}</span>
                </div>
                
                {watch("discountAmount") > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(watch("discountAmount"))}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(watch("taxAmount"))}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(watch("total"))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button type="submit">
            <Send className="h-4 w-4 mr-2" />
            Create & Send
          </Button>
        </div>
      </form>
    </div>
  );
}

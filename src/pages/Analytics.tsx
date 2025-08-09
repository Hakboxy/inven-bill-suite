import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { format, eachDayOfInterval, eachMonthOfInterval, eachYearOfInterval, startOfDay, endOfDay, subDays } from "date-fns";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";

// Basic invoice shape for analytics
interface InvoiceLite {
  issue_date: string;
  total_amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
}

type Granularity = "day" | "month" | "year";

type DateRange = { from: Date | undefined; to: Date | undefined };

const defaultRange: DateRange = {
  from: subDays(new Date(), 29),
  to: new Date(),
};

export default function Analytics() {
  const { toast } = useToast();
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<InvoiceLite[]>([]);

  // SEO basics
  useEffect(() => {
    const title = "Analytics | InvenBill";
    const description = "Analytics dashboard with date range, monthly and yearly insights for revenue and orders.";
    document.title = title;

    const ensureTag = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      return el;
    };

    const metaDesc = ensureTag('meta[name="description"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      return m;
    });
    metaDesc.setAttribute("content", description);

    const linkCanon = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    });
    linkCanon.setAttribute("href", `${window.location.origin}/analytics`);
  }, []);

  const fetchData = async () => {
    if (!range.from || !range.to) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("invoices")
        .select("issue_date,total_amount,status")
        .gte("issue_date", startOfDay(range.from).toISOString())
        .lte("issue_date", endOfDay(range.to).toISOString());

      if (error) throw error;
      setRows((data || []) as InvoiceLite[]);
    } catch (err: any) {
      toast({ title: "Failed to load analytics", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularity, range.from?.toISOString(), range.to?.toISOString()]);

  const buckets = useMemo(() => {
    if (!range.from || !range.to) return [] as Date[];
    const interval = { start: startOfDay(range.from), end: endOfDay(range.to) };
    if (granularity === "day") return eachDayOfInterval(interval);
    if (granularity === "month") return eachMonthOfInterval(interval);
    return eachYearOfInterval(interval);
  }, [granularity, range.from, range.to]);

  const pattern = granularity === "day" ? "yyyy-MM-dd" : granularity === "month" ? "yyyy-MM" : "yyyy";

  const chartData = useMemo(() => {
    const map = new Map<string, { period: string; revenue: number; orders: number }>();
    for (const d of buckets) {
      const key = format(d, pattern);
      map.set(key, { period: key, revenue: 0, orders: 0 });
    }
    rows.forEach((inv) => {
      const key = format(new Date(inv.issue_date), pattern);
      if (!map.has(key)) return;
      const cur = map.get(key)!;
      cur.orders += 1;
      if (inv.status === "paid") cur.revenue += inv.total_amount || 0;
    });
    return Array.from(map.values());
  }, [rows, buckets, pattern]);

  const totals = useMemo(() => {
    const orders = rows.length;
    const revenue = rows.filter(r => r.status === "paid").reduce((s, r) => s + (r.total_amount || 0), 0);
    const avg = orders ? revenue / orders : 0;
    return { orders, revenue, avg };
  }, [rows]);

  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    orders: { label: "Orders", color: "hsl(var(--muted-foreground))" },
  } as const;

  const displayRange = range.from && range.to ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}` : "Pick a date range";

  const resetRange = () => setRange(defaultRange);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track revenue and orders with custom date ranges and monthly/yearly grouping.</p>
      </header>

      <main className="space-y-6">
        <section aria-label="Analytics Filters" className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
              <SelectTrigger aria-label="Select granularity">
                <SelectValue placeholder="Granularity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="truncate">{displayRange}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={range as any}
                onSelect={setRange as any}
                initialFocus
              />
              <div className="flex items-center justify-between p-3 border-t">
                <Button variant="ghost" size="sm" onClick={resetRange}>Reset</Button>
                <Button variant="secondary" size="sm" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </section>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Summary">
          <Card>
            <CardHeader>
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl">{new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(totals.revenue)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Orders</CardDescription>
              <CardTitle className="text-2xl">{totals.orders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Avg. Order Value</CardDescription>
              <CardTitle className="text-2xl">{new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(totals.avg)}</CardTitle>
            </CardHeader>
          </Card>
        </section>

        <section aria-label="Revenue Over Time">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Grouped by {granularity}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent nameKey="label" labelKey="period" />} />
                  <ChartLegend content={<ChartLegendContent nameKey="label" />} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        <section aria-label="Orders Over Time">
          <Card>
            <CardHeader>
              <CardTitle>Orders Over Time</CardTitle>
              <CardDescription>Grouped by {granularity}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent nameKey="label" labelKey="period" />} />
                  <ChartLegend content={<ChartLegendContent nameKey="label" />} />
                  <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}

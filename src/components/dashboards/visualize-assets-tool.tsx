'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChart, LineChart, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { visualizeAssetChanges } from '@/ai/flows/visualize-asset-changes';
import { Skeleton } from '../ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart as RechartsBarChart, LineChart as RechartsLineChart, PieChart as RechartsPieChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Cell, Legend } from 'recharts';

type ChartType = 'line chart' | 'bar chart' | 'pie chart';

interface VisualizationResult {
  chartType: ChartType;
  reason: string;
}

const mockData = {
  line: [
    { month: 'Jan', value: 1000 },
    { month: 'Feb', value: 1200 },
    { month: 'Mar', value: 1100 },
    { month: 'Apr', value: 1500 },
    { month: 'May', value: 1800 },
  ],
  bar: [
    { name: 'Stocks', value: 4000 },
    { name: 'Bonds', value: 3000 },
    { name: 'MF', value: 2000 },
  ],
  pie: [
    { name: 'Equity', value: 400 },
    { name: 'Debt', value: 300 },
    { name: 'Gold', value: 300 },
  ],
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

const chartConfig = {
  value: { label: 'Value' },
};

function RenderChart({ chartType }: { chartType: ChartType }) {
  if (chartType === 'line chart') {
    return (
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <RechartsLineChart data={mockData.line}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" />
        </RechartsLineChart>
      </ChartContainer>
    );
  }
  if (chartType === 'bar chart') {
    return (
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <RechartsBarChart data={mockData.bar}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
        </RechartsBarChart>
      </ChartContainer>
    );
  }
  if (chartType === 'pie chart') {
    return (
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <RechartsPieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie data={mockData.pie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
            {mockData.pie.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </RechartsPieChart>
      </ChartContainer>
    );
  }
  return null;
}

export default function VisualizeAssetsTool() {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VisualizationResult | null>(null);
  const { toast } = useToast();

  const handleVisualize = async () => {
    if (!description.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please describe the asset changes.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await visualizeAssetChanges({ assetChanges: description });
      // Normalize chartType to handle variations from the AI model
      const chartType = response.chartType.toLowerCase() as ChartType;
      setResult({ ...response, chartType });
    } catch (error) {
      console.error('Error visualizing asset changes:', error);
      toast({
        title: 'Error',
        description: 'Could not generate visualization. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getChartIcon = (chartType: ChartType) => {
    switch (chartType) {
      case 'line chart': return <LineChart className="h-5 w-5" />;
      case 'bar chart': return <BarChart className="h-5 w-5" />;
      case 'pie chart': return <PieChart className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          AI Asset Visualizer
        </CardTitle>
        <CardDescription>
          Describe changes in your assets over time (e.g., "My stock portfolio grew by 20% in the last quarter, while my bonds remained stable.") and let our AI suggest the best way to visualize it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Describe asset changes here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
        <Button onClick={handleVisualize} disabled={isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Analyzing...' : 'Analyze & Visualize'}
        </Button>

        {isLoading && (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {result && (
          <Card className="bg-background/50 mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getChartIcon(result.chartType)}
                Recommended: {result.chartType.charAt(0).toUpperCase() + result.chartType.slice(1)}
              </CardTitle>
              <CardDescription>{result.reason}</CardDescription>
            </CardHeader>
            <CardContent>
              <RenderChart chartType={result.chartType} />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

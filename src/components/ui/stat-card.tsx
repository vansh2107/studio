
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  href: string;
  icon?: React.ElementType;
}

export function StatCard({ label, value, href, icon: Icon }: StatCardProps) {
  const router = useRouter();

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && router.push(href)}
      className={cn(
        "cursor-pointer select-none",
        "transition-all duration-200",
        "hover:shadow-md",
        "active:scale-[0.98]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "gradient-border-card"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

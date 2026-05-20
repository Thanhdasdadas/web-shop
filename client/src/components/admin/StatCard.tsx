import { Card } from '@/components/ui/Card';

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-brand-200 bg-white/80">
      <p className="text-sm text-brand-700/70">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}

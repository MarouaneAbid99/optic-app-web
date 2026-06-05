import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const colors = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
};

export default function StatsCard({ title, value, icon: Icon, color }: Props) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={clsx('p-3 rounded-xl shrink-0', colors[color])}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

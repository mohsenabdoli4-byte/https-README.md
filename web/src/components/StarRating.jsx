import { Star } from 'lucide-react';
import { faNum } from '../lib/format.js';

export default function StarRating({ value = 0, count, size = 'sm' }) {
  const rounded = Math.round(Number(value) || 0);
  const dim = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-1.5" aria-label={`امتیاز ${faNum(value)} از ۵`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`${dim} ${n <= rounded ? 'fill-butter text-butter' : 'text-cocoa/20'}`}
          />
        ))}
      </div>
      {count != null && <span className="text-xs text-muted">({faNum(count)})</span>}
    </div>
  );
}

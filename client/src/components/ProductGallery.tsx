import { useState } from 'react';
import clsx from 'clsx';

const fallback = 'https://picsum.photos/600';

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const list = images.length > 0 ? images : [fallback];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-slate-100">
        <img src={list[active]} alt={alt} className="aspect-square w-full object-cover" />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {list.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={clsx(
                'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition',
                i === active ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

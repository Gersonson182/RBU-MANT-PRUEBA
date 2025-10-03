import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type VirtualizedSearchSelectProps<T> = {
  items: T[];
  getKey: (item: T) => string | number;
  getLabel: (item: T) => string;
  getValue: (item: T) => string | number;
  height?: number;
  open?: boolean;
};

export function VirtualizedSearchSelect<T>({
  items,
  getKey,
  getLabel,
  getValue,
  height = 250,
  open,
}: VirtualizedSearchSelectProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState('');

  const filteredItems = React.useMemo(() => {
    if (!query) return items;
    return items.filter((item) =>
      getLabel(item).toLowerCase().includes(query.toLowerCase()),
    );
  }, [items, query, getLabel]);

  const rowVirtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  // medir cuando se abre
  React.useEffect(() => {
    if (open) {
      rowVirtualizer.measure();
    }
  }, [open, rowVirtualizer, filteredItems]);

  return (
    <SelectContent>
      <div className='border-b p-2'>
        <Input
          placeholder='Buscar...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className='h-8'
        />
      </div>

      <div ref={parentRef} style={{ height, overflow: 'auto' }}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize() || 1}px`,
            position: 'relative',
            width: '100%',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = filteredItems[virtualRow.index];
            return (
              <div
                key={getKey(item)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <SelectItem value={String(getValue(item))}>
                  {getLabel(item)}
                </SelectItem>
              </div>
            );
          })}
        </div>
      </div>
    </SelectContent>
  );
}

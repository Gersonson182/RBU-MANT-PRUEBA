import { Link, useNavigate } from 'react-router-dom';
import type { ModuleItem as ModuleItemType, MenuItem } from '../../constants';
import { Card, CardContent } from '../ui/card';
import clsx from 'clsx';

import {
  PrimarySheet,
  PrimarySheetContent,
  PrimarySheetHeader,
  PrimarySheetTitle,
} from '../ui/primary-sheet';

import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth/useAuthStore';

type ModuleItemProps = {
  module: ModuleItemType;
};

export default function ModuleItem({ module }: ModuleItemProps) {
  const permissions = useAuthStore((state) => state.permissions);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const hasPermission = (item: MenuItem) =>
    !item.permission ||
    permissions.some(
      (p) =>
        p.nombreModulo === item.permission?.nombreModulo &&
        p.nombreAcceso === item.permission?.nombreAcceso,
    );

  useEffect(() => {
    console.log('Permisos del usuario:', permissions);
  }, [permissions]);

  return (
    <>
      <Card
        className={cn(
          'rounded-2xl hover:shadow-sm hover:shadow-primary/30',
          isOpen && 'bg-primary-50',
        )}
        onClick={() => navigate(module.url)}
      >
        <CardContent>
          <div className='flex flex-col items-center justify-between gap-4 pt-6'>
            <img
              src={isOpen ? module.imageUrlActive : module.imageUrl}
              alt={module.name}
              className={clsx(
                'size-16 transition-transform duration-300',
                isOpen && 'scale-110',
                'hover:scale-110 group-hover:drop-shadow-md',
              )}
            />
            <span
              className={cn(
                'font-bold',
                isOpen ? 'text-neutral-50' : 'text-primary',
              )}
            >
              {module.name}
            </span>
          </div>
        </CardContent>
      </Card>

      <PrimarySheet open={isOpen} onOpenChange={setIsOpen}>
        <PrimarySheetContent
          aria-describedby={undefined}
          className='flex flex-col gap-8 text-neutral-50'
        >
          <PrimarySheetHeader className='flex flex-col items-center justify-center'>
            <img
              src={module.imageUrlActive}
              alt={module.name}
              className='size-20'
            />
            <PrimarySheetTitle className='text-neutral-50'>
              {module.name}
            </PrimarySheetTitle>
          </PrimarySheetHeader>

          <div className='flex flex-1 flex-col gap-4 overflow-y-auto border-t pt-8'>
            {module.items.map((item) => (
              <div key={item.name} className='space-y-1'>
                <div className='flex items-center gap-2'>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className='h-4 w-4'
                    />
                  )}
                  <Link
                    to={item.url}
                    className={cn(
                      'group relative',
                      !hasPermission(item) && 'pointer-events-none opacity-50',
                    )}
                  >
                    {item.name}
                    <span className='absolute bottom-0 left-0 h-[1px] w-0 bg-neutral-50 transition-all group-hover:w-full' />
                  </Link>
                </div>

                {/* Renderizar children (submenú) si existen */}
                {Array.isArray(item.children) && item.children.length > 0 && (
                  <ul className='ml-4 list-disc text-sm text-neutral-200'>
                    {item.children.map((sub) => (
                      <li key={sub.name} className='flex items-center gap-2'>
                        {sub.imageUrl && (
                          <img
                            src={sub.imageUrl}
                            alt={sub.name}
                            className='h-4 w-4'
                          />
                        )}
                        <Link
                          to={sub.url}
                          className={cn(
                            'hover:underline',
                            !hasPermission(sub) &&
                              'pointer-events-none opacity-50',
                          )}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className='mt-auto flex items-center justify-center'>
            <button onClick={() => setIsOpen(false)}>
              <ChevronRight size={30} />
            </button>
          </div>
        </PrimarySheetContent>
      </PrimarySheet>
    </>
  );
}

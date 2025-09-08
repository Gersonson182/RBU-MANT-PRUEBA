import * as React from 'react';
import * as PrimarySheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '../../lib/utils';

const PrimarySheet = PrimarySheetPrimitive.Root;

const PrimarySheetTrigger = PrimarySheetPrimitive.Trigger;

const PrimarySheetClose = PrimarySheetPrimitive.Close;

const PrimarySheetPortal = PrimarySheetPrimitive.Portal;

const PrimarySheetOverlay = React.forwardRef<
  React.ElementRef<typeof PrimarySheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof PrimarySheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <PrimarySheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
));
PrimarySheetOverlay.displayName = PrimarySheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-primary border-primary p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'top-[90px] left-0 h-[85vh] w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'top-[90px] right-0 rounded-l-2xl h-[85vh] w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

interface PrimarySheetContentProps
  extends React.ComponentPropsWithoutRef<typeof PrimarySheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const PrimarySheetContent = React.forwardRef<
  React.ElementRef<typeof PrimarySheetPrimitive.Content>,
  PrimarySheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <PrimarySheetPortal>
    <PrimarySheetOverlay />
    <PrimarySheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <PrimarySheetPrimitive.Close className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary'>
        <X className='h-4 w-4' />
        <span className='sr-only'>Close</span>
      </PrimarySheetPrimitive.Close>
    </PrimarySheetPrimitive.Content>
  </PrimarySheetPortal>
));
PrimarySheetContent.displayName = PrimarySheetPrimitive.Content.displayName;

const PrimarySheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
PrimarySheetHeader.displayName = 'PrimarySheetHeader';

const PrimarySheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
PrimarySheetFooter.displayName = 'PrimarySheetFooter';

const PrimarySheetTitle = React.forwardRef<
  React.ElementRef<typeof PrimarySheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof PrimarySheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <PrimarySheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
));
PrimarySheetTitle.displayName = PrimarySheetPrimitive.Title.displayName;

const PrimarySheetDescription = React.forwardRef<
  React.ElementRef<typeof PrimarySheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof PrimarySheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <PrimarySheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
PrimarySheetDescription.displayName =
  PrimarySheetPrimitive.Description.displayName;

export {
  PrimarySheet,
  PrimarySheetPortal,
  PrimarySheetOverlay,
  PrimarySheetTrigger,
  PrimarySheetClose,
  PrimarySheetContent,
  PrimarySheetHeader,
  PrimarySheetFooter,
  PrimarySheetTitle,
  PrimarySheetDescription,
};

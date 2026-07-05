import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-brand text-white hover:bg-brand-dark',
        outline: 'border border-hairline text-ink hover:border-brand hover:text-brand',
        'outline-brand': 'border-2 border-brand text-brand hover:bg-brand-light',
        ghost: 'text-ink hover:bg-brand-light',
        link: 'text-brand underline-offset-4 hover:underline',
        onDark: 'bg-white text-ink hover:bg-white/90',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-10 px-4',
        lg: 'h-14 px-6 text-lg',
        icon: 'size-11',
        'icon-sm': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };

'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const rootRef = React.useRef<HTMLSpanElement>(null);

  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  // Extract ARIA props to pass to thumb
  const ariaLabelledBy = props['aria-labelledby'];
  const ariaLabel = props['aria-label'];
  const ariaDescribedBy = props['aria-describedby'];

  // Remove ARIA attributes from props that shouldn't be on root
  const {
    'aria-valuemin': _ariaValuemin,
    'aria-valuemax': _ariaValuemax,
    'aria-valuenow': _ariaValuenow,
    ...rootProps
  } = props;

  // Remove ARIA slider attributes from root after Radix UI applies them
  React.useEffect(() => {
    if (rootRef.current) {
      rootRef.current.removeAttribute('aria-valuemin');
      rootRef.current.removeAttribute('aria-valuemax');
      rootRef.current.removeAttribute('aria-valuenow');
    }
  }, [value, min, max]);

  // Prevent horizontal scrolling during slider interaction
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    // Prevent horizontal scrolling when touching slider
    const touch = e.touches[0];
    if (touch) {
      const startX = touch.clientX;
      const startY = touch.clientY;
      let isSliding = false;
      
      const handleTouchMove = (moveEvent: TouchEvent) => {
        const currentTouch = moveEvent.touches[0];
        if (currentTouch) {
          const deltaX = Math.abs(currentTouch.clientX - startX);
          const deltaY = Math.abs(currentTouch.clientY - startY);
          
          // If horizontal movement is detected, prevent default scrolling
          if (deltaX > 5 || isSliding) {
            isSliding = true;
            // Prevent horizontal scrolling
            moveEvent.preventDefault();
            // Also prevent body scroll
            document.body.style.overflowX = 'hidden';
          }
        }
      };
      
      const handleTouchEnd = () => {
        isSliding = false;
        document.body.style.overflowX = '';
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
  }, []);

  return (
    <SliderPrimitive.Root
      ref={rootRef}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        '[touch-action:none]',
        className
      )}
      style={{ touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      {...rootProps}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => {
        return (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 [touch-action:none]"
            aria-labelledby={ariaLabelledBy}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            style={{ touchAction: 'none' }}
          />
        );
      })}
    </SliderPrimitive.Root>
  );
}

export { Slider };

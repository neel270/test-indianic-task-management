import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Props for Shimmer component
 */
interface ShimmerProps {
  /** Additional CSS classes */
  className?: string;
  /** Width of the shimmer element */
  width?: string | number;
  /** Height of the shimmer element */
  height?: string | number;
  /** Border radius of the shimmer element */
  borderRadius?: string | number;
  /** Animation duration in seconds */
  duration?: number;
}

/**
 * Shimmer Component
 *
 * Creates a shimmer loading animation effect with customizable dimensions
 * and styling. Uses CSS animations to create a smooth loading indicator.
 *
 * @param props - Shimmer component props
 * @returns JSX element with shimmer animation
 *
 * @example
 * ```tsx
 * <Shimmer className="w-32 h-8" />
 * <Shimmer width={200} height={40} borderRadius={8} />
 * ```
 */
export const Shimmer: React.FC<ShimmerProps> = ({
  className,
  width,
  height,
  borderRadius = 4,
  duration = 2,
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
        className
      )}
      style={{
        width,
        height,
        borderRadius,
        animationDuration: `${duration}s`,
      }}
    />
  );
};

/**
 * ShimmerText Component
 *
 * Creates a shimmer effect for text elements with multiple lines
 *
 * @param lines - Number of shimmer lines to display
 * @param className - Additional CSS classes
 * @returns JSX element with shimmer text effect
 */
export const ShimmerText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Shimmer
          key={index}
          height={16}
          width={index === lines - 1 ? '60%' : '100%'}
          className={index > 0 ? 'mt-2' : ''}
        />
      ))}
    </div>
  );
};

/**
 * ShimmerAvatar Component
 *
 * Creates a shimmer effect for avatar/profile picture placeholders
 *
 * @param size - Size of the avatar (width and height)
 * @param className - Additional CSS classes
 * @returns JSX element with shimmer avatar effect
 */
export const ShimmerAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className,
}) => {
  return (
    <Shimmer
      width={size}
      height={size}
      borderRadius="50%"
      className={cn('rounded-full', className)}
    />
  );
};

/**
 * ShimmerCard Component
 *
 * Creates a shimmer effect for card layouts with header, content, and actions
 *
 * @param className - Additional CSS classes
 * @returns JSX element with shimmer card effect
 */
export const ShimmerCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-6 border rounded-lg space-y-4', className)}>
      <div className="flex items-center space-x-4">
        <ShimmerAvatar size={48} />
        <div className="flex-1">
          <ShimmerText lines={2} />
        </div>
      </div>
      <Shimmer height={120} className="w-full" />
      <div className="flex justify-between items-center">
        <Shimmer width={80} height={32} />
        <div className="flex space-x-2">
          <Shimmer width={60} height={32} />
          <Shimmer width={60} height={32} />
        </div>
      </div>
    </div>
  );
};

/**
 * ShimmerList Component
 *
 * Creates a shimmer effect for lists with multiple items
 *
 * @param items - Number of shimmer items to display
 * @param ItemComponent - Custom shimmer component for each item
 * @param className - Additional CSS classes
 * @returns JSX element with shimmer list effect
 */
export const ShimmerList: React.FC<{
  items?: number;
  ItemComponent?: React.ComponentType<{ className?: string }>;
  className?: string;
}> = ({
  items = 3,
  ItemComponent = ShimmerCard,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <ItemComponent key={index} />
      ))}
    </div>
  );
};

/**
 * ShimmerTable Component
 *
 * Creates a shimmer effect for table layouts with headers and rows
 *
 * @param rows - Number of shimmer rows to display
 * @param columns - Number of shimmer columns to display
 * @param className - Additional CSS classes
 * @returns JSX element with shimmer table effect
 */
export const ShimmerTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Shimmer key={`header-${index}`} height={20} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Shimmer key={`cell-${rowIndex}-${colIndex}`} height={16} />
          ))}
        </div>
      ))}
    </div>
  );
};

import { ShimmerCard, ShimmerList, ShimmerTable } from '@/components/ui/shimmer';
import React, { ComponentType, ReactNode, Suspense } from 'react';

/**
 * Available shimmer fallback types
 */
type ShimmerType = 'card' | 'list' | 'table' | 'custom';

/**
 * Props for LazyWrapper component
 */
interface LazyWrapperProps {
  /** The component to lazy load */
  children: ReactNode;
  /** Type of shimmer effect to show while loading */
  shimmerType?: ShimmerType;
  /** Number of shimmer items for list/table types */
  shimmerCount?: number;
  /** Custom shimmer component for custom type */
  customShimmer?: ReactNode;
  /** Additional CSS classes for the wrapper */
  className?: string;
  /** Error boundary fallback component */
  errorFallback?: ReactNode;
  /** Delay before showing shimmer (in milliseconds) */
  delay?: number;
}

/**
 * LazyWrapper Component
 *
 * Provides lazy loading functionality with shimmer effects for better user experience.
 * Wraps components in React.Suspense and displays appropriate shimmer animations
 * while the component is loading.
 *
 * Features:
 * - Multiple shimmer effect types (card, list, table, custom)
 * - Configurable shimmer counts for lists and tables
 * - Custom shimmer components support
 * - Error boundary integration
 * - Optional loading delay
 * - Smooth loading transitions
 *
 * @example
 * ```tsx
 * // Basic usage with card shimmer
 * <LazyWrapper shimmerType="card">
 *   <ExpensiveComponent />
 * </LazyWrapper>
 *
 * // List with custom count
 * <LazyWrapper shimmerType="list" shimmerCount={5}>
 *   <TaskList />
 * </LazyWrapper>
 *
 * // Custom shimmer
 * <LazyWrapper
 *   shimmerType="custom"
 *   customShimmer={<CustomLoadingSkeleton />}
 * >
 *   <Dashboard />
 * </LazyWrapper>
 * ```
 */
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  shimmerType = 'card',
  shimmerCount = 3,
  customShimmer,
  className,
  errorFallback,
  delay = 0,
}) => {
  /**
   * Renders the appropriate shimmer effect based on type
   */
  const renderShimmer = () => {
    if (customShimmer && shimmerType === 'custom') {
      return customShimmer;
    }

    switch (shimmerType) {
      case 'card':
        return <ShimmerCard {...(className && { className })} />;
      case 'list':
        return <ShimmerList items={shimmerCount} {...(className && { className })} />;
      case 'table':
        return <ShimmerTable rows={shimmerCount} {...(className && { className })} />;
      default:
        return <ShimmerCard {...(className && { className })} />;
    }
  };

  /**
   * Loading fallback component with optional delay
   */
  const LoadingFallback = () => {
    const [showShimmer, setShowShimmer] = React.useState(delay === 0);

    React.useEffect(() => {
      if (delay > 0) {
        const timer = setTimeout(() => {
          setShowShimmer(true);
        }, delay);

        return () => clearTimeout(timer);
      }
    }, [delay]);

    if (!showShimmer) {
      return null;
    }

    return <>{renderShimmer()}</>;
  };

  /**
   * Error boundary fallback component
   */
  const ErrorFallback = () => {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    return (
      <div className='flex items-center justify-center p-8 text-red-600'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold mb-2'>Failed to load component</h3>
          <p className='text-sm'>Please try refreshing the page</p>
        </div>
      </div>
    );
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary fallback={<ErrorFallback />}>{children}</ErrorBoundary>
    </Suspense>
  );
};

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in the component tree and displays a fallback UI
 */
class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyWrapper Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for lazy loading with shimmer effects
 *
 * @param importFunc - Dynamic import function for the component
 * @param shimmerOptions - Shimmer configuration options
 * @returns Lazy loaded component wrapped with shimmer effects
 *
 * @example
 * ```tsx
 * const LazyTaskList = withLazyLoading(
 *   () => import('./TaskList'),
 *   { shimmerType: 'list', shimmerCount: 5 }
 * );
 *
 * // Use in your component
 * <LazyTaskList />
 * ```
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  shimmerOptions?: Omit<LazyWrapperProps, 'children'>
) {
  const LazyComponent = React.lazy(importFunc);

  return React.forwardRef<React.ComponentRef<typeof LazyComponent>, P>((props, ref) => (
    <LazyWrapper {...shimmerOptions}>
      <LazyComponent {...props} ref={ref} />
    </LazyWrapper>
  ));
}

/**
 * Hook for implementing lazy loading with shimmer effects in functional components
 *
 * @param shimmerOptions - Shimmer configuration options
 * @returns Object with loading state and wrapper function
 *
 * @example
 * ```tsx
 * function TaskList() {
 *   const { isLoading, withShimmer } = useLazyLoading({
 *     shimmerType: 'list',
 *     shimmerCount: 5
 *   });
 *
 *   if (isLoading) {
 *     return withShimmer(<TaskListContent />);
 *   }
 *
 *   return <TaskListContent />;
 * }
 * ```
 */
export function useLazyLoading(shimmerOptions?: Omit<LazyWrapperProps, 'children'>) {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, shimmerOptions?.delay ?? 0);

    return () => clearTimeout(timer);
  }, [shimmerOptions?.delay]);

  const withShimmer = React.useCallback(
    (children: ReactNode) => {
      if (!isLoading) {
        return children;
      }

      return <LazyWrapper {...shimmerOptions}>{children}</LazyWrapper>;
    },
    [isLoading, shimmerOptions]
  );

  return { isLoading, withShimmer };
}

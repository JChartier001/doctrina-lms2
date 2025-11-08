import { useQueries } from 'convex/react';
import { makeUseQueryWithStatus } from 'convex-helpers/react';

/**
 * Enhanced useQuery hook with richer state handling
 *
 * Returns discriminated union with:
 * - status: 'pending' | 'success' | 'error'
 * - data: Query result (only present when status === 'success')
 * - error: Error object (only present when status === 'error')
 * - isPending, isSuccess, isError: Boolean flags for convenience
 *
 * Benefits over standard useQuery:
 * - Cleaner state handling (no undefined ambiguity)
 * - Better TypeScript type narrowing
 * - No need for try-catch blocks
 * - Explicit error handling with error object
 *
 * @see https://github.com/get-convex/convex-helpers/blob/main/packages/convex-helpers/README.md#richer-usequery
 *
 * @example
 * const { isPending, isError, error, data } =
 *   useQueryWithStatus(api.courses.list);
 *
 * if (isPending) return <Skeleton />;
 * if (isError) return <ErrorMessage error={error} />;
 * return <CourseList courses={data} />;
 */
export const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

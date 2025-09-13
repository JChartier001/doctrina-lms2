/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as certificates from "../certificates.js";
import type * as courses from "../courses.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as liveSessions from "../liveSessions.js";
import type * as notifications from "../notifications.js";
import type * as purchases from "../purchases.js";
import type * as recommendations from "../recommendations.js";
import type * as resources from "../resources.js";
import type * as search from "../search.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  certificates: typeof certificates;
  courses: typeof courses;
  favorites: typeof favorites;
  http: typeof http;
  liveSessions: typeof liveSessions;
  notifications: typeof notifications;
  purchases: typeof purchases;
  recommendations: typeof recommendations;
  resources: typeof resources;
  search: typeof search;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

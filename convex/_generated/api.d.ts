/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as certificates from "../certificates.js";
import type * as courseModules from "../courseModules.js";
import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as image from "../image.js";
import type * as lessonProgress from "../lessonProgress.js";
import type * as lessons from "../lessons.js";
import type * as lib_stripeClient from "../lib/stripeClient.js";
import type * as liveSessions from "../liveSessions.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as purchases from "../purchases.js";
import type * as recommendations from "../recommendations.js";
import type * as resources from "../resources.js";
import type * as search from "../search.js";
import type * as stripe from "../stripe.js";
import type * as triggers from "../triggers.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

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
  courseModules: typeof courseModules;
  courses: typeof courses;
  enrollments: typeof enrollments;
  favorites: typeof favorites;
  http: typeof http;
  image: typeof image;
  lessonProgress: typeof lessonProgress;
  lessons: typeof lessons;
  "lib/stripeClient": typeof lib_stripeClient;
  liveSessions: typeof liveSessions;
  notifications: typeof notifications;
  payments: typeof payments;
  purchases: typeof purchases;
  recommendations: typeof recommendations;
  resources: typeof resources;
  search: typeof search;
  stripe: typeof stripe;
  triggers: typeof triggers;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};

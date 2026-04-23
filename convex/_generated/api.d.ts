/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as leagues from "../leagues.js";
import type * as lib_admin from "../lib/admin.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_scoring from "../lib/scoring.js";
import type * as lib_time from "../lib/time.js";
import type * as lib_validation from "../lib/validation.js";
import type * as matches from "../matches.js";
import type * as predictions from "../predictions.js";
import type * as rankings from "../rankings.js";
import type * as scoring from "../scoring.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  leagues: typeof leagues;
  "lib/admin": typeof lib_admin;
  "lib/errors": typeof lib_errors;
  "lib/scoring": typeof lib_scoring;
  "lib/time": typeof lib_time;
  "lib/validation": typeof lib_validation;
  matches: typeof matches;
  predictions: typeof predictions;
  rankings: typeof rankings;
  scoring: typeof scoring;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

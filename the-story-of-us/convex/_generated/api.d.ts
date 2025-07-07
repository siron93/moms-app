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
import type * as babies from "../babies.js";
import type * as files from "../files.js";
import type * as growthLogs from "../growthLogs.js";
import type * as memories from "../memories.js";
import type * as memories_old from "../memories_old.js";
import type * as milestoneEntries from "../milestoneEntries.js";
import type * as milestones from "../milestones.js";
import type * as schema_old from "../schema_old.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
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
  babies: typeof babies;
  files: typeof files;
  growthLogs: typeof growthLogs;
  memories: typeof memories;
  memories_old: typeof memories_old;
  milestoneEntries: typeof milestoneEntries;
  milestones: typeof milestones;
  schema_old: typeof schema_old;
  seed: typeof seed;
  seedData: typeof seedData;
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

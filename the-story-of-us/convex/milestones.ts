import { v } from "convex/values";
import { query } from "./_generated/server";

// Get all milestones
export const getMilestones = query({
  handler: async (ctx) => {
    return await ctx.db.query("milestones").collect();
  },
});

// Get milestones by category
export const getMilestonesByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("milestones")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});
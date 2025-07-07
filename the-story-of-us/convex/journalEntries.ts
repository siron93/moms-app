import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Create a journal entry
export const createJournalEntry = mutation({
  args: {
    babyId: v.id("babies"),
    title: v.optional(v.string()),
    content: v.string(),
    date: v.number(),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.auth?.userId ? 
      await ctx.db.query("users").withIndex("by_clerk", q => q.eq("clerkId", ctx.auth!.userId!)).first()
        .then(user => user?._id) : undefined;

    return await ctx.db.insert("journalEntries", {
      babyId: args.babyId,
      userId,
      anonymousId: args.anonymousId,
      title: args.title,
      content: args.content,
      date: args.date,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update journal entry
export const updateJournalEntry = mutation({
  args: {
    journalId: v.id("journalEntries"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const journal = await ctx.db.get(args.journalId);
    if (!journal) throw new Error("Journal entry not found");

    await ctx.db.patch(args.journalId, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.content !== undefined && { content: args.content }),
      updatedAt: Date.now(),
    });
  },
});

// Get journal entries for a baby
export const getJournalEntriesForBaby = query({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("journalEntries")
      .withIndex("by_baby_date", q => q.eq("babyId", args.babyId))
      .order("desc")
      .collect();
  },
});

// Test data creation function
export const createTestJournalEntry = mutation({
  args: {
    babyId: v.id("babies"),
  },
  handler: async (ctx, args) => {
    // Get the baby to find the anonymous ID
    const baby = await ctx.db.get(args.babyId);
    
    return await ctx.db.insert("journalEntries", {
      babyId: args.babyId,
      userId: undefined,
      anonymousId: baby?.anonymousId || "test-anonymous",
      title: "A note from my heart...",
      content: "Today you gave me the biggest smile when I walked into your room after your nap. It's these little moments that make my heart overflow with love. You're growing so fast, and I want to remember every precious second. I love you more than all the stars in the sky, my sweet baby.",
      date: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
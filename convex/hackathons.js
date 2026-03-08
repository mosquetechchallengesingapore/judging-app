import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("hackathons").collect();
  },
});

export const get = query({
  args: { id: v.id("hackathons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const hackathonId = await ctx.db.insert("hackathons", {
      name: args.name,
      description: args.description || '',
      status: "upcoming",
      createdAt: Date.now(),
      startDate: args.startDate,
      endDate: args.endDate,
    });
    return hackathonId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("hackathons"),
    status: v.union(v.literal("upcoming"), v.literal("live"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("hackathons") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

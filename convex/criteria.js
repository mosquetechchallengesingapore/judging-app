import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByHackathon = query({
  args: { hackathonId: v.id("hackathons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("criteria")
      .withIndex("by_hackathon", (q) => q.eq("hackathonId", args.hackathonId))
      .collect();
  },
});

export const create = mutation({
  args: {
    hackathonId: v.id("hackathons"),
    name: v.string(),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    const criteriaId = await ctx.db.insert("criteria", {
      hackathonId: args.hackathonId,
      name: args.name,
      weight: args.weight,
    });
    return criteriaId;
  },
});

export const update = mutation({
  args: {
    id: v.id("criteria"),
    name: v.string(),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      weight: args.weight,
    });
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("criteria") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

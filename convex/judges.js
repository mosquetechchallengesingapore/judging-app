import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByHackathon = query({
  args: { hackathonId: v.id("hackathons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("judges")
      .withIndex("by_hackathon", (q) => q.eq("hackathonId", args.hackathonId))
      .collect();
  },
});

export const create = mutation({
  args: {
    hackathonId: v.id("hackathons"),
    name: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const judgeId = await ctx.db.insert("judges", {
      hackathonId: args.hackathonId,
      name: args.name,
      role: args.role,
    });
    return judgeId;
  },
});

export const remove = mutation({
  args: { id: v.id("judges") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

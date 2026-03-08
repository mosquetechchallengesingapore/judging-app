import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByHackathon = query({
  args: { hackathonId: v.id("hackathons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teams")
      .withIndex("by_hackathon", (q) => q.eq("hackathonId", args.hackathonId))
      .collect();
  },
});

export const create = mutation({
  args: {
    hackathonId: v.id("hackathons"),
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const teamId = await ctx.db.insert("teams", {
      hackathonId: args.hackathonId,
      name: args.name,
      description: args.description,
    });
    return teamId;
  },
});

export const remove = mutation({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

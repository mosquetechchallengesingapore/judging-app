import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitScore = mutation({
  args: {
    hackathonId: v.id("hackathons"),
    judgeId: v.id("judges"),
    teamId: v.id("teams"),
    criteriaId: v.id("criteria"),
    score: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scores")
      .filter(
        (q) =>
          q.and(
            q.eq(q.field("judgeId"), args.judgeId),
            q.eq(q.field("teamId"), args.teamId),
            q.eq(q.field("criteriaId"), args.criteriaId)
          )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        score: args.score,
        notes: args.notes,
        submittedAt: Date.now(),
      });
      return await ctx.db.get(existing._id);
    }

    return await ctx.db.insert("scores", {
      hackathonId: args.hackathonId,
      judgeId: args.judgeId,
      teamId: args.teamId,
      criteriaId: args.criteriaId,
      score: args.score,
      notes: args.notes,
      submittedAt: Date.now(),
    });
  },
});

export const getTeamScores = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scores")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const getJudgeTeamScores = query({
  args: {
    judgeId: v.id("judges"),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scores")
      .withIndex("by_judge_team", (q) =>
        q.eq("judgeId", args.judgeId).eq("teamId", args.teamId)
      )
      .collect();
  },
});

export const getHackathonScores = query({
  args: { hackathonId: v.id("hackathons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scores")
      .withIndex("by_hackathon", (q) => q.eq("hackathonId", args.hackathonId))
      .collect();
  },
});

export const calculateTeamFinalScore = query({
  args: {
    hackathonId: v.id("hackathons"),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("scores")
      .filter(
        (q) =>
          q.and(
            q.eq(q.field("hackathonId"), args.hackathonId),
            q.eq(q.field("teamId"), args.teamId)
          )
      )
      .collect();

    const criteria = await ctx.db
      .query("criteria")
      .withIndex("by_hackathon", (q) => q.eq("hackathonId", args.hackathonId))
      .collect();

    const criteriaMap = new Map(criteria.map((c) => [c._id, c]));

    const criteriaScores = new Map();

    for (const score of scores) {
      const crit = criteriaMap.get(score.criteriaId);
      if (!crit) continue;

      if (!criteriaScores.has(score.criteriaId)) {
        criteriaScores.set(score.criteriaId, []);
      }
      criteriaScores.get(score.criteriaId).push(score.score);
    }

    let totalScore = 0;
    const breakdown = {};

    for (const [critId, scoreList] of criteriaScores) {
      const crit = criteriaMap.get(critId);
      if (!crit) continue;

      const avgScore = scoreList.reduce((a, b) => a + b, 0) / scoreList.length;
      const normalized = (avgScore / crit.maxPoints) * 100;
      const weighted = (normalized * crit.weight) / 100;

      breakdown[crit.name] = {
        average: Math.round(avgScore * 10) / 10,
        maxPoints: crit.maxPoints,
        normalized: Math.round(normalized * 10) / 10,
        weight: crit.weight,
        weighted: Math.round(weighted * 10) / 10,
      };

      totalScore += weighted;
    }

    return {
      teamId: args.teamId,
      finalScore: Math.round(totalScore * 10) / 10,
      breakdown,
    };
  },
});

export const updateScore = mutation({
  args: {
    scoreId: v.id("scores"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.scoreId, {
      score: args.score,
      submittedAt: Date.now(),
    });
    return await ctx.db.get(args.scoreId);
  },
});

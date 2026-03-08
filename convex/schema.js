import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("judge")),
  })
    .index("email", ["email"]),

  hackathons: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("upcoming"), v.literal("live"), v.literal("completed")),
    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  }).index("by_creator", ["createdBy"]),

  criteria: defineTable({
    hackathonId: v.id("hackathons"),
    name: v.string(),
    weight: v.number(),
  }).index("by_hackathon", ["hackathonId"]),

  judges: defineTable({
    hackathonId: v.id("hackathons"),
    userId: v.optional(v.id("users")),
    name: v.string(),
    role: v.string(),
  })
    .index("by_hackathon", ["hackathonId"])
    .index("by_user", ["userId"]),

  teams: defineTable({
    hackathonId: v.id("hackathons"),
    name: v.string(),
    description: v.string(),
  }).index("by_hackathon", ["hackathonId"]),

  scores: defineTable({
    hackathonId: v.id("hackathons"),
    judgeId: v.id("judges"),
    teamId: v.id("teams"),
    criteriaId: v.id("criteria"),
    score: v.number(),
    notes: v.optional(v.string()),
    submittedAt: v.optional(v.number()),
  })
    .index("by_hackathon", ["hackathonId"])
    .index("by_team", ["teamId"])
    .index("by_judge_team", ["judgeId", "teamId"])
    .index("by_judge_team_criteria", ["judgeId", "teamId", "criteriaId"]),
});

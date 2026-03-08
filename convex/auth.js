import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple password hashing (in production, use proper crypto library)
function hashPassword(password) {
  // Simple hash for demo - in production use a proper crypto library
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36) + password.length;
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("judge")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: hashPassword(args.password),
      name: args.name,
      role: args.role,
    });

    return { userId, email: args.email, name: args.name, role: args.role };
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (!user || !verifyPassword(args.password, user.passwordHash)) {
      throw new Error("Invalid email or password");
    }

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});

export const getCurrentUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});

export const resetPassword = mutation({
  args: {
    email: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("No account found with this email address");
    }

    await ctx.db.patch(user._id, {
      passwordHash: hashPassword(args.newPassword),
    });

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});

import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { UpdateMyProfileBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/profiles/me", requireAuth, async (req, res): Promise<void> => {
  const uid = req.auth!.uid;
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, uid));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(serialize(profile));
});

router.put("/profiles/me", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const uid = req.auth!.uid;
  const [profile] = await db
    .update(profilesTable)
    .set(parsed.data)
    .where(eq(profilesTable.userId, uid))
    .returning();
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(serialize(profile));
});

function serialize(p: typeof profilesTable.$inferSelect) {
  return {
    userId: p.userId,
    role: p.role,
    name: p.name,
    bio: p.bio ?? undefined,
    city: p.city ?? undefined,
    area: p.area ?? undefined,
    category: p.category ?? undefined,
    instagramUrl: p.instagramUrl ?? undefined,
    youtubeUrl: p.youtubeUrl ?? undefined,
    followers: p.followers ?? 0,
    avatarUrl: p.avatarUrl ?? undefined,
    coverUrl: p.coverUrl ?? undefined,
    companyName: p.companyName ?? undefined,
    industry: p.industry ?? undefined,
    description: p.description ?? undefined,
  };
}

export default router;

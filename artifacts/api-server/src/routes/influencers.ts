import { Router, type IRouter } from "express";
import { and, eq, gte, lte, ilike, or, sql, desc } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/influencers", async (req, res): Promise<void> => {
  const { city, area, category, minFollowers, maxFollowers, q } = req.query;
  const conds = [eq(profilesTable.role, "influencer")];
  if (typeof city === "string" && city.trim())
    conds.push(eq(profilesTable.city, city.trim()));
  if (typeof area === "string" && area.trim())
    conds.push(eq(profilesTable.area, area.trim()));
  if (typeof category === "string" && category.trim())
    conds.push(eq(profilesTable.category, category.trim()));
  if (typeof minFollowers === "string" && minFollowers)
    conds.push(gte(profilesTable.followers, parseInt(minFollowers, 10)));
  if (typeof maxFollowers === "string" && maxFollowers)
    conds.push(lte(profilesTable.followers, parseInt(maxFollowers, 10)));
  if (typeof q === "string" && q.trim()) {
    const like = `%${q.trim()}%`;
    const search = or(
      ilike(profilesTable.name, like),
      ilike(profilesTable.bio, like),
      ilike(profilesTable.category, like),
      ilike(profilesTable.city, like),
    );
    if (search) conds.push(search);
  }

  const rows = await db
    .select()
    .from(profilesTable)
    .where(and(...conds))
    .orderBy(desc(profilesTable.followers));

  res.json(rows.map(toSummary));
});

router.get("/influencers/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.role, "influencer"))
    .orderBy(desc(profilesTable.followers))
    .limit(6);
  res.json(rows.map(toSummary));
});

router.get("/influencers/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: profilesTable.category,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(profilesTable)
    .where(eq(profilesTable.role, "influencer"))
    .groupBy(profilesTable.category);
  res.json(
    rows
      .filter((r) => r.category)
      .map((r) => ({ category: r.category as string, count: r.count })),
  );
});

router.get("/influencers/cities", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      city: profilesTable.city,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(profilesTable)
    .where(eq(profilesTable.role, "influencer"))
    .groupBy(profilesTable.city);
  res.json(
    rows
      .filter((r) => r.city)
      .map((r) => ({ city: r.city as string, count: r.count })),
  );
});

router.get("/influencers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw ?? "", 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db
    .select()
    .from(profilesTable)
    .where(
      and(eq(profilesTable.userId, id), eq(profilesTable.role, "influencer")),
    );
  if (!row) {
    res.status(404).json({ error: "Influencer not found" });
    return;
  }
  res.json({
    ...toSummary(row),
    instagramUrl: row.instagramUrl ?? undefined,
    youtubeUrl: row.youtubeUrl ?? undefined,
    coverUrl: row.coverUrl ?? undefined,
  });
});

function toSummary(p: typeof profilesTable.$inferSelect) {
  return {
    id: p.userId,
    name: p.name,
    city: p.city ?? "",
    area: p.area ?? undefined,
    category: p.category ?? "",
    followers: p.followers ?? 0,
    avatarUrl: p.avatarUrl ?? undefined,
    bio: p.bio ?? undefined,
  };
}

export default router;

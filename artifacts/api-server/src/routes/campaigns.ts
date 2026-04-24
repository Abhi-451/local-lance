import { Router, type IRouter } from "express";
import { and, eq, desc } from "drizzle-orm";
import { db, campaignsTable, profilesTable } from "@workspace/db";
import { CreateCampaignBody } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../lib/auth";

const router: IRouter = Router();

router.get(
  "/campaigns",
  requireAuth,
  requireRole("business"),
  async (req, res): Promise<void> => {
    const uid = req.auth!.uid;
    const rows = await db
      .select()
      .from(campaignsTable)
      .where(eq(campaignsTable.businessId, uid))
      .orderBy(desc(campaignsTable.createdAt));
    const [me] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, uid));
    res.json(rows.map((r) => serialize(r, me?.companyName ?? me?.name ?? "")));
  },
);

router.post(
  "/campaigns",
  requireAuth,
  requireRole("business"),
  async (req, res): Promise<void> => {
    const parsed = CreateCampaignBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const uid = req.auth!.uid;
    const [row] = await db
      .insert(campaignsTable)
      .values({ ...parsed.data, businessId: uid })
      .returning();
    if (!row) {
      res.status(500).json({ error: "Failed to create campaign" });
      return;
    }
    const [me] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, uid));
    res.json(serialize(row, me?.companyName ?? me?.name ?? ""));
  },
);

router.get("/campaigns/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw ?? "", 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  const [biz] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, row.businessId));
  res.json(serialize(row, biz?.companyName ?? biz?.name ?? ""));
});

function serialize(
  c: typeof campaignsTable.$inferSelect,
  businessName: string,
) {
  return {
    id: c.id,
    businessId: c.businessId,
    businessName,
    title: c.title,
    description: c.description,
    budget: c.budget,
    location: c.location,
    deliverables: c.deliverables,
    createdAt: c.createdAt.toISOString(),
  };
}

export default router;

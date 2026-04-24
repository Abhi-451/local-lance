import { Router, type IRouter } from "express";
import { and, eq, or, desc, inArray } from "drizzle-orm";
import {
  db,
  requestsTable,
  profilesTable,
  campaignsTable,
  usersTable,
} from "@workspace/db";
import {
  CreateRequestBody,
  UpdateRequestStatusBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/requests", requireAuth, async (req, res): Promise<void> => {
  const auth = req.auth!;
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const baseCond =
    auth.role === "business"
      ? eq(requestsTable.businessId, auth.uid)
      : eq(requestsTable.influencerId, auth.uid);
  const conds = [baseCond];
  if (status) conds.push(eq(requestsTable.status, status));

  const rows = await db
    .select()
    .from(requestsTable)
    .where(and(...conds))
    .orderBy(desc(requestsTable.createdAt));

  res.json(await hydrate(rows));
});

router.post("/requests", requireAuth, async (req, res): Promise<void> => {
  const auth = req.auth!;
  if (auth.role !== "business") {
    res.status(403).json({ error: "Only businesses can send requests" });
    return;
  }
  const parsed = CreateRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(requestsTable)
    .values({
      businessId: auth.uid,
      influencerId: parsed.data.influencerId,
      campaignId: parsed.data.campaignId ?? null,
      message: parsed.data.message ?? null,
      status: "pending",
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create request" });
    return;
  }
  const [out] = await hydrate([row]);
  res.json(out);
});

router.put(
  "/requests/:id/status",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw ?? "", 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = UpdateRequestStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const auth = req.auth!;
    const [existing] = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    const status = parsed.data.status;

    // Authorization rules:
    //  - influencer can accept/reject if they're the target
    //  - business can mark completed if accepted
    if (status === "accepted" || status === "rejected") {
      if (auth.uid !== existing.influencerId || auth.role !== "influencer") {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    } else if (status === "completed") {
      if (auth.uid !== existing.businessId || auth.role !== "business") {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }

    const [row] = await db
      .update(requestsTable)
      .set({ status })
      .where(eq(requestsTable.id, id))
      .returning();
    if (!row) {
      res.status(500).json({ error: "Failed to update request" });
      return;
    }
    const [out] = await hydrate([row]);
    res.json(out);
  },
);

async function hydrate(rows: (typeof requestsTable.$inferSelect)[]) {
  if (rows.length === 0) return [];
  const userIds = Array.from(
    new Set(rows.flatMap((r) => [r.businessId, r.influencerId])),
  );
  const campaignIds = Array.from(
    new Set(rows.map((r) => r.campaignId).filter((x): x is number => x != null)),
  );
  const profiles = await db
    .select()
    .from(profilesTable)
    .where(inArray(profilesTable.userId, userIds));
  const profileMap = new Map(profiles.map((p) => [p.userId, p]));
  const campaigns =
    campaignIds.length > 0
      ? await db
          .select()
          .from(campaignsTable)
          .where(inArray(campaignsTable.id, campaignIds))
      : [];
  const campaignMap = new Map(campaigns.map((c) => [c.id, c]));

  return rows.map((r) => {
    const biz = profileMap.get(r.businessId);
    const inf = profileMap.get(r.influencerId);
    const camp = r.campaignId ? campaignMap.get(r.campaignId) : undefined;
    return {
      id: r.id,
      businessId: r.businessId,
      businessName: biz?.companyName ?? biz?.name ?? "",
      influencerId: r.influencerId,
      influencerName: inf?.name ?? "",
      campaignId: r.campaignId ?? undefined,
      campaignTitle: camp?.title ?? undefined,
      message: r.message ?? undefined,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    };
  });
}

export default router;

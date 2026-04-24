import { Router, type IRouter } from "express";
import { and, eq, desc, inArray } from "drizzle-orm";
import {
  db,
  campaignsTable,
  requestsTable,
  profilesTable,
} from "@workspace/db";
import { requireAuth, requireRole } from "../lib/auth";

const router: IRouter = Router();

router.get(
  "/dashboard/business",
  requireAuth,
  requireRole("business"),
  async (req, res): Promise<void> => {
    const uid = req.auth!.uid;
    const [campaigns, requests, [me]] = await Promise.all([
      db
        .select()
        .from(campaignsTable)
        .where(eq(campaignsTable.businessId, uid))
        .orderBy(desc(campaignsTable.createdAt)),
      db
        .select()
        .from(requestsTable)
        .where(eq(requestsTable.businessId, uid))
        .orderBy(desc(requestsTable.createdAt)),
      db.select().from(profilesTable).where(eq(profilesTable.userId, uid)),
    ]);

    const recentRequests = requests.slice(0, 5);
    const userIds = Array.from(
      new Set(recentRequests.map((r) => r.influencerId)),
    );
    const infProfiles =
      userIds.length > 0
        ? await db
            .select()
            .from(profilesTable)
            .where(inArray(profilesTable.userId, userIds))
        : [];
    const infMap = new Map(infProfiles.map((p) => [p.userId, p]));
    const businessName = me?.companyName ?? me?.name ?? "";

    res.json({
      campaignCount: campaigns.length,
      requestsSent: requests.length,
      activeCollaborations: requests.filter((r) => r.status === "accepted")
        .length,
      pendingRequests: requests.filter((r) => r.status === "pending").length,
      recentRequests: recentRequests.map((r) => ({
        id: r.id,
        businessId: r.businessId,
        businessName,
        influencerId: r.influencerId,
        influencerName: infMap.get(r.influencerId)?.name ?? "",
        campaignId: r.campaignId ?? undefined,
        message: r.message ?? undefined,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
      recentCampaigns: campaigns.slice(0, 5).map((c) => ({
        id: c.id,
        businessId: c.businessId,
        businessName,
        title: c.title,
        description: c.description,
        budget: c.budget,
        location: c.location,
        deliverables: c.deliverables,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  },
);

router.get(
  "/dashboard/influencer",
  requireAuth,
  requireRole("influencer"),
  async (req, res): Promise<void> => {
    const uid = req.auth!.uid;
    const requests = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.influencerId, uid))
      .orderBy(desc(requestsTable.createdAt));

    const recent = requests.slice(0, 5);
    const bizIds = Array.from(new Set(recent.map((r) => r.businessId)));
    const bizProfiles =
      bizIds.length > 0
        ? await db
            .select()
            .from(profilesTable)
            .where(inArray(profilesTable.userId, bizIds))
        : [];
    const bizMap = new Map(bizProfiles.map((p) => [p.userId, p]));
    const [me] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, uid));

    res.json({
      pendingRequests: requests.filter((r) => r.status === "pending").length,
      acceptedCollaborations: requests.filter((r) => r.status === "accepted")
        .length,
      totalRequests: requests.length,
      recentRequests: recent.map((r) => {
        const biz = bizMap.get(r.businessId);
        return {
          id: r.id,
          businessId: r.businessId,
          businessName: biz?.companyName ?? biz?.name ?? "",
          influencerId: r.influencerId,
          influencerName: me?.name ?? "",
          campaignId: r.campaignId ?? undefined,
          message: r.message ?? undefined,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        };
      }),
    });
  },
);

export default router;

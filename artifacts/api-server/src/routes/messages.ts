import { Router, type IRouter } from "express";
import { and, eq, or, desc, asc, sql, inArray } from "drizzle-orm";
import { db, messagesTable, profilesTable, usersTable } from "@workspace/db";
import { SendMessageToUserBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get(
  "/messages/conversations",
  requireAuth,
  async (req, res): Promise<void> => {
    const uid = req.auth!.uid;

    // Find all messages involving me, then group by other user
    const rows = await db
      .select()
      .from(messagesTable)
      .where(
        or(eq(messagesTable.senderId, uid), eq(messagesTable.receiverId, uid)),
      )
      .orderBy(desc(messagesTable.createdAt));

    const byOther = new Map<
      number,
      { last: typeof messagesTable.$inferSelect; count: number }
    >();
    for (const m of rows) {
      const other = m.senderId === uid ? m.receiverId : m.senderId;
      const cur = byOther.get(other);
      if (!cur) {
        byOther.set(other, { last: m, count: 0 });
      }
    }
    const otherIds = Array.from(byOther.keys());
    if (otherIds.length === 0) {
      res.json([]);
      return;
    }
    const profiles = await db
      .select()
      .from(profilesTable)
      .where(inArray(profilesTable.userId, otherIds));
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    const conversations = otherIds.map((otherId) => {
      const entry = byOther.get(otherId)!;
      const p = profileMap.get(otherId);
      return {
        otherUserId: otherId,
        otherUserName: p?.name ?? p?.companyName ?? "Unknown",
        otherUserRole: p?.role ?? "influencer",
        otherUserAvatarUrl: p?.avatarUrl ?? undefined,
        lastMessage: entry.last.content,
        lastMessageAt: entry.last.createdAt.toISOString(),
        unreadCount: 0,
      };
    });
    conversations.sort((a, b) =>
      b.lastMessageAt.localeCompare(a.lastMessageAt),
    );
    res.json(conversations);
  },
);

router.get(
  "/messages/with/:userId",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const otherId = parseInt(raw ?? "", 10);
    if (Number.isNaN(otherId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }
    const uid = req.auth!.uid;
    const rows = await db
      .select()
      .from(messagesTable)
      .where(
        or(
          and(
            eq(messagesTable.senderId, uid),
            eq(messagesTable.receiverId, otherId),
          ),
          and(
            eq(messagesTable.senderId, otherId),
            eq(messagesTable.receiverId, uid),
          ),
        ),
      )
      .orderBy(asc(messagesTable.createdAt));
    res.json(
      rows.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    );
  },
);

router.post(
  "/messages/with/:userId",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const otherId = parseInt(raw ?? "", 10);
    if (Number.isNaN(otherId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }
    const parsed = SendMessageToUserBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const uid = req.auth!.uid;
    const [other] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, otherId));
    if (!other) {
      res.status(404).json({ error: "Recipient not found" });
      return;
    }
    const [row] = await db
      .insert(messagesTable)
      .values({
        senderId: uid,
        receiverId: otherId,
        content: parsed.data.content,
      })
      .returning();
    if (!row) {
      res.status(500).json({ error: "Failed to send message" });
      return;
    }
    res.json({
      id: row.id,
      senderId: row.senderId,
      receiverId: row.receiverId,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
    });
  },
);

export default router;

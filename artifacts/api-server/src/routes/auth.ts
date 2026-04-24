import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, profilesTable } from "@workspace/db";
import { SignupBody, LoginBody } from "@workspace/api-zod";
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  type AuthRole,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const role = parsed.data.role as AuthRole;

  const [user] = await db
    .insert(usersTable)
    .values({ email, passwordHash, role })
    .returning();

  if (!user) {
    res.status(500).json({ error: "Failed to create user" });
    return;
  }

  await db.insert(profilesTable).values({
    userId: user.id,
    role,
    name: parsed.data.name,
    city: parsed.data.city ?? null,
    companyName: role === "business" ? parsed.data.name : null,
  });

  const token = signToken({ uid: user.id, role, email: user.email });
  res.json({
    token,
    user: { id: user.id, email: user.email, role, name: parsed.data.name },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const role = user.role as AuthRole;
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, user.id));

  const token = signToken({ uid: user.id, role, email: user.email });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role,
      name: profile?.name ?? "",
      avatarUrl: profile?.avatarUrl ?? undefined,
    },
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const auth = req.auth!;
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, auth.uid));
  res.json({
    id: auth.uid,
    email: auth.email,
    role: auth.role,
    name: profile?.name ?? "",
    avatarUrl: profile?.avatarUrl ?? undefined,
  });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ ok: true });
});

export default router;

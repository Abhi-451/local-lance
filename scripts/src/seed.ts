import bcrypt from "bcryptjs";
import {
  db,
  usersTable,
  profilesTable,
  campaignsTable,
  requestsTable,
  messagesTable,
} from "@workspace/db";

async function main() {
  console.log("Seeding Localfluence...");

  // Clear existing data (dev only)
  await db.delete(messagesTable);
  await db.delete(requestsTable);
  await db.delete(campaignsTable);
  await db.delete(profilesTable);
  await db.delete(usersTable);

  const hash = await bcrypt.hash("password123", 10);

  // Businesses
  const businesses = [
    {
      email: "hello@golden-bean.com",
      name: "Golden Bean Coffee",
      city: "Austin",
      industry: "Food & Beverage",
      description:
        "Single-origin specialty roastery in East Austin looking for local creators to share our craft.",
    },
    {
      email: "team@riverbed-yoga.com",
      name: "Riverbed Yoga",
      city: "Austin",
      industry: "Wellness",
      description:
        "Boutique yoga studio along the river, offering vinyasa, yin, and outdoor classes.",
    },
    {
      email: "studio@parker-textiles.com",
      name: "Parker & Co. Textiles",
      city: "Brooklyn",
      industry: "Fashion",
      description:
        "Slow-fashion textiles handwoven in Williamsburg. Looking for fashion creators in NYC.",
    },
  ];

  const businessRows = await db
    .insert(usersTable)
    .values(
      businesses.map((b) => ({
        email: b.email,
        passwordHash: hash,
        role: "business",
      })),
    )
    .returning();

  await db.insert(profilesTable).values(
    businessRows.map((u, i) => ({
      userId: u.id,
      role: "business",
      name: businesses[i]!.name,
      companyName: businesses[i]!.name,
      city: businesses[i]!.city,
      industry: businesses[i]!.industry,
      description: businesses[i]!.description,
    })),
  );

  // Influencers
  const influencers = [
    {
      email: "maya@local.test",
      name: "Maya Chen",
      city: "Austin",
      area: "East Austin",
      category: "food",
      bio: "Cafe-hopping food writer. Always chasing the next great pour-over.",
      followers: 84000,
      instagramUrl: "https://instagram.com/maya.eats",
      youtubeUrl: "https://youtube.com/@mayaeats",
      avatarUrl: "https://i.pravatar.cc/300?img=47",
    },
    {
      email: "jordan@local.test",
      name: "Jordan Rivers",
      city: "Austin",
      area: "South Congress",
      category: "fitness",
      bio: "Trail runner & yoga teacher. Sharing morning routines that actually stick.",
      followers: 42000,
      instagramUrl: "https://instagram.com/jordan.runs",
      avatarUrl: "https://i.pravatar.cc/300?img=12",
    },
    {
      email: "leo@local.test",
      name: "Leo Park",
      city: "Brooklyn",
      area: "Williamsburg",
      category: "fashion",
      bio: "Menswear & vintage. NYC streets, slow fashion, honest reviews.",
      followers: 156000,
      instagramUrl: "https://instagram.com/leoinparkslope",
      avatarUrl: "https://i.pravatar.cc/300?img=33",
    },
    {
      email: "sophie@local.test",
      name: "Sophie Albright",
      city: "Brooklyn",
      area: "Bushwick",
      category: "lifestyle",
      bio: "Apartment dweller, plant collector, weekend baker. Cozy NYC content.",
      followers: 23000,
      instagramUrl: "https://instagram.com/sophie.bakes",
      avatarUrl: "https://i.pravatar.cc/300?img=44",
    },
    {
      email: "ravi@local.test",
      name: "Ravi Patel",
      city: "Austin",
      area: "Downtown",
      category: "tech",
      bio: "Software engineer turned creator. Reviewing local makers and indie tech.",
      followers: 67000,
      instagramUrl: "https://instagram.com/raviworks",
      youtubeUrl: "https://youtube.com/@raviworks",
      avatarUrl: "https://i.pravatar.cc/300?img=15",
    },
    {
      email: "nadia@local.test",
      name: "Nadia Okafor",
      city: "Brooklyn",
      area: "Crown Heights",
      category: "beauty",
      bio: "Clean beauty, melanin-rich skincare, and finding the best brunch.",
      followers: 110000,
      instagramUrl: "https://instagram.com/nadia.glows",
      avatarUrl: "https://i.pravatar.cc/300?img=49",
    },
    {
      email: "kai@local.test",
      name: "Kai Morales",
      city: "Los Angeles",
      area: "Echo Park",
      category: "travel",
      bio: "Weekend road trips & hidden gems within 100 miles of LA.",
      followers: 38000,
      instagramUrl: "https://instagram.com/kaiwanders",
      avatarUrl: "https://i.pravatar.cc/300?img=68",
    },
    {
      email: "elena@local.test",
      name: "Elena Vasquez",
      city: "Los Angeles",
      area: "Silver Lake",
      category: "parenting",
      bio: "Mom of two, urban garden builder, no-nonsense parenting tips.",
      followers: 51000,
      instagramUrl: "https://instagram.com/elena.raises",
      avatarUrl: "https://i.pravatar.cc/300?img=20",
    },
  ];

  const influencerRows = await db
    .insert(usersTable)
    .values(
      influencers.map((p) => ({
        email: p.email,
        passwordHash: hash,
        role: "influencer",
      })),
    )
    .returning();

  await db.insert(profilesTable).values(
    influencerRows.map((u, i) => {
      const p = influencers[i]!;
      return {
        userId: u.id,
        role: "influencer",
        name: p.name,
        bio: p.bio,
        city: p.city,
        area: p.area,
        category: p.category,
        instagramUrl: p.instagramUrl ?? null,
        youtubeUrl: p.youtubeUrl ?? null,
        followers: p.followers,
        avatarUrl: p.avatarUrl,
      };
    }),
  );

  // Campaigns
  const goldenBean = businessRows[0]!;
  const riverbed = businessRows[1]!;
  const parker = businessRows[2]!;

  const campaigns = await db
    .insert(campaignsTable)
    .values([
      {
        businessId: goldenBean.id,
        title: "Spring Single-Origin Launch",
        description:
          "Help us introduce our spring Ethiopian micro-lot to Austin coffee lovers.",
        budget: 800,
        location: "Austin, TX",
        deliverables:
          "1 Instagram reel + 3 stories featuring the new roast at our East Austin cafe.",
      },
      {
        businessId: riverbed.id,
        title: "Sunrise Riverside Class Series",
        description:
          "Weekly sunrise yoga sessions on the river. Promote the new pass.",
        budget: 600,
        location: "Austin, TX",
        deliverables: "2 reels + carousel post during a 4-week series.",
      },
      {
        businessId: parker.id,
        title: "Slow Fashion Look Book",
        description:
          "Style our handwoven scarves & throws in your everyday NYC look.",
        budget: 1500,
        location: "Brooklyn, NY",
        deliverables:
          "1 long-form video + 2 styled photos featuring 3 of our pieces.",
      },
    ])
    .returning();

  // Requests
  const maya = influencerRows[0]!;
  const jordan = influencerRows[1]!;
  const leo = influencerRows[2]!;
  const sophie = influencerRows[3]!;

  await db.insert(requestsTable).values([
    {
      businessId: goldenBean.id,
      influencerId: maya.id,
      campaignId: campaigns[0]!.id,
      message:
        "We loved your East Austin cafe series — would love to feature our new roast.",
      status: "pending",
    },
    {
      businessId: riverbed.id,
      influencerId: jordan.id,
      campaignId: campaigns[1]!.id,
      message: "Your trail-and-yoga content is exactly the vibe we're going for.",
      status: "accepted",
    },
    {
      businessId: parker.id,
      influencerId: leo.id,
      campaignId: campaigns[2]!.id,
      message: "Big fan of your menswear edits. Would love to collaborate.",
      status: "pending",
    },
    {
      businessId: parker.id,
      influencerId: sophie.id,
      campaignId: campaigns[2]!.id,
      message: "Your cozy Brooklyn apartment shots are perfect for our throws.",
      status: "accepted",
    },
  ]);

  // A couple of seed messages
  await db.insert(messagesTable).values([
    {
      senderId: riverbed.id,
      receiverId: jordan.id,
      content:
        "So glad you're in! Want to grab a class this week and figure out the schedule?",
    },
    {
      senderId: jordan.id,
      receiverId: riverbed.id,
      content: "Yes! I'm free Thursday morning — sunrise class would be perfect.",
    },
    {
      senderId: parker.id,
      receiverId: sophie.id,
      content:
        "We'll send the pieces over by Friday. Anything specific you'd like us to include?",
    },
  ]);

  console.log("Seeded successfully.");
  console.log("Test logins (password: password123):");
  console.log("  Business:   hello@golden-bean.com");
  console.log("  Influencer: maya@local.test");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

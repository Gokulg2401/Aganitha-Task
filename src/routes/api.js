const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const crypto = require("crypto");

const router = express.Router();
const prisma = new PrismaClient();

// Meaningful word lists for generating readable short codes
const adjectives = [
  "fast",
  "quick",
  "happy",
  "smart",
  "cool",
  "bright",
  "calm",
  "eager",
  "fresh",
  "gentle",
  "grand",
  "great",
  "honest",
  "kind",
  "light",
  "live",
  "lucky",
  "modern",
  "neat",
  "nice",
  "noble",
  "proud",
  "pure",
  "quiet",
  "rapid",
  "rare",
  "ready",
  "rich",
  "safe",
  "sharp",
  "short",
  "simple",
  "sleek",
  "smooth",
  "social",
  "solid",
  "sound",
  "spare",
  "steady",
  "swift",
  "tidy",
  "tiny",
  "true",
  "viral",
  "vivid",
  "warm",
  "wise",
  "witty",
];

const nouns = [
  "arrow",
  "atlas",
  "beacon",
  "beast",
  "blast",
  "blaze",
  "bonus",
  "boost",
  "brain",
  "brand",
  "brave",
  "brick",
  "brief",
  "bright",
  "bronze",
  "brush",
  "build",
  "burst",
  "cabin",
  "cable",
  "cache",
  "cadet",
  "candy",
  "canon",
  "cargo",
  "carve",
  "cedar",
  "chain",
  "charm",
  "chart",
  "chase",
  "cheer",
  "chess",
  "chief",
  "chime",
  "chord",
  "chose",
  "chunk",
  "civic",
  "claim",
  "clamp",
  "clash",
  "clean",
  "clear",
  "click",
  "cliff",
  "climb",
  "clock",
  "clone",
  "close",
  "cloud",
  "coach",
  "coast",
  "coral",
  "couch",
  "count",
  "court",
  "cover",
  "crack",
  "craft",
  "crane",
  "crash",
  "crate",
  "crave",
  "crazy",
  "cream",
  "creek",
  "crest",
  "crime",
  "cross",
  "crowd",
  "crown",
  "crude",
  "crush",
  "crust",
  "curve",
  "cycle",
  "daily",
  "dance",
  "daring",
  "datum",
  "dealt",
  "death",
  "debut",
  "decade",
  "decal",
  "decay",
  "delay",
  "delta",
  "dense",
  "depth",
  "derby",
  "design",
  "detail",
  "device",
  "devil",
  "diary",
  "diner",
  "diode",
  "dirge",
  "dirty",
  "disco",
  "ditch",
  "diver",
  "dizzy",
  "dodge",
  "doing",
  "doll",
  "domain",
  "dome",
  "donor",
  "doubt",
  "dough",
  "draft",
  "drain",
  "drama",
  "drank",
  "drape",
  "drawl",
  "drawn",
  "dream",
  "dress",
  "drift",
  "drill",
  "drink",
  "drive",
  "droid",
  "drone",
  "drool",
  "droop",
  "doubt",
  "drown",
  "drums",
  "drunk",
  "dumb",
  "dunce",
  "eagle",
  "earth",
  "easel",
  "eater",
  "ebony",
  "edict",
  "eight",
  "eject",
  "elbow",
  "elder",
  "elite",
  "email",
  "ember",
  "embryo",
  "emerge",
  "emery",
  "empty",
  "enact",
  "enemy",
  "enjoy",
  "enter",
  "entry",
  "envoy",
  "epoch",
  "equal",
  "equip",
  "erase",
  "erect",
  "error",
  "erupt",
  "escape",
  "essay",
  "ether",
  "ethic",
  "evict",
  "evoke",
  "exact",
  "exalt",
  "excel",
  "exile",
  "exist",
  "expat",
  "extol",
  "extra",
  "exude",
  "exult",
  "fable",
  "fabric",
  "faced",
  "facet",
  "facts",
  "faded",
  "faint",
  "fairy",
  "faith",
  "false",
  "famed",
  "fancy",
  "fanny",
  "farce",
  "farms",
  "fatal",
  "fated",
  "fatty",
  "fault",
  "fauna",
  "favor",
  "favor",
  "feast",
  "feats",
  "fence",
  "ferns",
];

function generateCode(length = 6) {
  // Generate a meaningful code using adjective-noun combination
  // For length 6: use short adjective + short noun
  // For length 7-8: use longer combinations

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  // Combine and adjust to desired length
  let code = (adj + noun).substring(0, length);

  // If too short, add a random digit
  while (code.length < length) {
    code += Math.floor(Math.random() * 10);
  }

  return code.toLowerCase();
}

// Validation schemas
const createLinkSchema = z.object({
  url: z.string().url(),
  code: z
    .string()
    .regex(/^[a-zA-Z0-9]{6,8}$/, "Code must be 6-8 alphanumeric characters")
    .optional(),
});

// POST /api/links - Create a short link
router.post("/", async (req, res) => {
  try {
    const { url, code } = createLinkSchema.parse(req.body);

    let shortCode = code;
    if (!shortCode) {
      shortCode = generateCode(6);
    }

    console.log(`📝 POST /api/links - Creating link: ${shortCode} -> ${url}`);

    // Check if code exists
    const existing = await prisma.link.findUnique({
      where: { code: shortCode },
    });

    if (existing) {
      console.log(
        `❌ POST /api/links - Error 409: Code already exists: ${shortCode}`
      );
      return res.status(409).json({ error: "Code already in use" });
    }

    const link = await prisma.link.create({
      data: {
        originalUrl: url,
        code: shortCode,
      },
    });

    console.log(`✅ POST /api/links - Link created successfully: ${shortCode}`);

    res.status(201).json({
      code: link.code,
      url: link.originalUrl,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      lastClickedAt: link.lastClickedAt,
      createdAt: link.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(`❌ POST /api/links - Validation error:`, error.errors);
      return res.status(400).json({ error: error.errors });
    }
    console.error(`❌ POST /api/links - Server error:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/links - List all links
router.get("/", async (req, res) => {
  try {
    console.log(`📡 GET /api/links - Fetching all links...`);

    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log(`✅ GET /api/links - Retrieved ${links.length} links`);

    const formattedLinks = links.map((link) => ({
      code: link.code,
      url: link.originalUrl,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      lastClickedAt: link.lastClickedAt,
      createdAt: link.createdAt,
    }));
    res.json(formattedLinks);
  } catch (error) {
    console.error(`❌ GET /api/links - Server error:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/links/:code - Get link stats
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`📊 GET /api/links/${code} - Fetching stats for code...`);

    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      console.log(`❌ GET /api/links/${code} - Link not found`);
      return res.status(404).json({ error: "Link not found" });
    }

    console.log(`✅ GET /api/links/${code} - Stats retrieved:`, {
      code: link.code,
      clicks: link.clicks,
      lastClickedAt: link.lastClickedAt,
    });

    res.json({
      code: link.code,
      url: link.originalUrl,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      lastClickedAt: link.lastClickedAt,
      createdAt: link.createdAt,
    });
  } catch (error) {
    console.error(`❌ Error fetching stats:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/links/:code - Delete a link
router.delete("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`🗑️  DELETE /api/links/${code} - Attempting to delete link...`);

    await prisma.link.delete({
      where: { code },
    });
    console.log(`✅ DELETE /api/links/${code} - Link deleted successfully`);
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      console.log(`❌ DELETE /api/links/${code} - Error 404: Link not found`);
      return res.status(404).json({ error: "Link not found" });
    }
    console.error(`❌ DELETE /api/links/${code} - Server error:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

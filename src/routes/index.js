const express = require("express");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const router = express.Router();
const prisma = new PrismaClient();

// Health check
router.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

// Stats page route (SPA handling - serve index.html or specific stats page)
// Actually, let's serve a specific stats.html for /code/:code
router.get("/code/:code", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/stats.html"));
});

// Redirect endpoint
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (link) {
      console.log(`🔗 Redirecting ${code} -> ${link.originalUrl}`);

      // Async update click count (fire and forget or await depending on strictness)
      await prisma.link.update({
        where: { code },
        data: {
          clicks: { increment: 1 },
          lastClickedAt: new Date(),
        },
      });
      console.log(`📈 Click count updated for ${code}: ${link.clicks + 1}`);
      return res.redirect(302, link.originalUrl);
    }

    console.log(`❌ Link not found: ${code}`);
    res.status(404).sendFile(path.join(__dirname, "../../public/404.html"));
  } catch (error) {
    console.error(`❌ Error redirecting:`, error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

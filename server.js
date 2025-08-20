const express = require("express");
const cors = require("cors");
const path = require("path");
const { generateSite } = require("./assets/js/site-generator.js");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", (req, res) => {
  const { template, data } = req.body;
  if (!template || !data) {
    return res.status(400).json({ error: "Faltan datos o plantilla" });
  }
  try {
    const outputDir = path.join(
      process.cwd(),
      "site-output",
      (data.businessName || "sitio").replace(/\s+/g, "-").toLowerCase()
    );
    generateSite({
      templateName: template,
      data,
      outputDir,
    });
    res.json({ success: true, outputDir });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generando el sitio" });
  }
});

app.listen(3000, () => console.log("Servidor escuchando en http://localhost:3000"));
const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/:placa", async (req, res) => {
  const placa = req.params.placa.toUpperCase();
  const url = `https://www.tabelafipebrasil.com/placa?placa=${placa}`;

  try {
    const { data } = await axios.get(url, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "text/html",
    "Accept-Language": "pt-BR,pt;q=0.9"
  }
});

    const $ = cheerio.load(data);

    const result = {};
    $("ul.list-group li").each((_, el) => {
      const texto = $(el).text().split(":");
      if (texto.length === 2) {
        result[texto[0].trim()] = texto[1].trim();
      }
    });

    result["placa"] = placa;
    res.json(result);
  } catch (err) {
    console.error("Erro ao buscar:", err.message);
    res.status(500).json({ erro: "Não foi possível buscar a placa." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

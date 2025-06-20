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
      headers: {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Accept": "text/html",
  "Accept-Language": "pt-BR,pt;q=0.9",
  "Referer": "https://www.tabelafipebrasil.com/",
  "Connection": "keep-alive"
}
    });

    const $ = cheerio.load(data);
    const result = { placa };

    // Seleciona cada <li> com base na classe da lista
    $("ul.list-group li").each((_, el) => {
      const texto = $(el).text().trim();
      if (texto.includes(":")) {
        const [chave, valor] = texto.split(":");
        result[chave.trim().toLowerCase()] = valor.trim();
      }
    });

    // IPVA estimado
    const ipvaTexto = $("p:contains('IPVA')").text();
    const ipvaMatch = ipvaTexto.match(/IPVA 2025.*?R\$ ([\d.,]+)/i);
    if (ipvaMatch) {
      result["ipva_2025"] = ipvaMatch[1];
    }

    // Código FIPE (procura pelo padrão FIPE na tabela de valores)
    const fipeMatch = $("td:contains('Valor')").first().text().match(/R\$ ([\d.,]+)/);
    if (fipeMatch) {
      result["valor_fipe"] = fipeMatch[1];
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Erro:", err.message);
    res.status(500).json({ erro: "Não foi possível buscar a placa." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ API de placa rodando! Use /PZS3819 para testar.");
});

app.listen(PORT, () => {
  console.log(`🚗 API rodando em http://localhost:${PORT}`);
});

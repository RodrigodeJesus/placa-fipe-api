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
        "Accept-Language": "pt-BR,pt;q=0.9",
        "Referer": "https://www.tabelafipebrasil.com/",
        "Connection": "keep-alive"
      }
    });

    // Log do HTML retornado para debug
    console.log("====== HTML recebido da consulta ======");
    console.log(data.substring(0, 2000)); // mostra só o início para não poluir o terminal
    console.log("====== Fim do HTML recebido ======");

    const $ = cheerio.load(data);
    const result = { placa };

    // Ajuste os seletores conforme o HTML real retornado!
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

    // Se não encontrou nada, talvez o HTML mudou ou a placa não existe
    if (Object.keys(result).length === 1) {
      return res.status(404).json({
        erro: "Placa não encontrada ou formatação do site mudou. Veja logs do servidor para ajustar o parsing."
      });
    }

    res.json(result);
  } catch (err) {
    // Log detalhado do erro para debug
    console.error("❌ Erro ao buscar placa:", err.message);
    if (err.response) {
      console.error("Status HTTP:", err.response.status);
      console.error("Trecho do corpo da resposta:", String(err.response.data).substring(0, 500));
    }
    res.status(500).json({ erro: "Não foi possível buscar a placa." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ API de placa rodando! Use /PZS3819 para testar.");
});

app.listen(PORT, () => {
  console.log(`🚗 API rodando em http://localhost:${PORT}`);
});

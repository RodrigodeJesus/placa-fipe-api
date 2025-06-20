const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/:placa", async (req, res) => {
  const placa = req.params.placa.toUpperCase();

  try {
    const response = await axios.post(
      "https://upconsultas.com.br/consulta_placa.php",
      `placa=${encodeURIComponent(placa)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      }
    );

    const dados = response.data?.response;

    if (!dados || response.data.error) {
      return res.status(404).json({ erro: "Placa não encontrada ou bloqueada." });
    }

    const resultado = {
      placa: dados.placa,
      marca: dados.marca || dados.MARCA,
      modelo: dados.modelo || dados.MODELO,
      versao: dados.versao || dados.VERSAO,
      ano_fabricacao: dados.ano,
      ano_modelo: dados.ano_modelo || dados.anoModelo,
      cor: dados.cor || dados.cor_veiculo?.cor,
      combustivel: dados.combustivel,
      potencia: dados.potencia,
      passageiros: dados.quantidade_passageiro,
      municipio: dados.municipio,
      uf: dados.uf,
      chassi: dados.chassi || dados.extra?.chassi,
      situacao: dados.situacao_veiculo === "S" ? "Regular" : "Irregular"
    };

    res.json(resultado);
  } catch (err) {
    console.error("❌ Erro ao consultar:", err.message);
    res.status(500).json({ erro: "Erro ao acessar a API externa." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ API online. Use /PZS3819 para testar.");
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});

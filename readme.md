# 🚗 API PLACA

## Introdução:

Está biblioteca é para buscar dados de veículos a partir da placa, para isso é utilizado os dados fornecidos do site [Tabela Fipe Brasil](www.tabelafipebrasil.com). Ela também verifica se o valor pesquisada realmente é uma placa válida.

## Uso

### - Instalação

```bash
$ npm install placa-fipe-api
```

### - Importar

```js
import { consultarPlaca } from "placa-fipe-api";
```

### - Exemplo de consulta

```js
consultarPlaca({ placa: "RDT9D99"})
  .then((resultado) => {
    console.log(resultado);
  })
  .catch((error) => {
    console.error(error);
  });
```
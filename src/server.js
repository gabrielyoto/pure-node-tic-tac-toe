const http = require('http');
const fs = require('fs');

const Symbols = {
  X: 'X',
  O: 'O',
};

let game = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

let nextSymbol = Symbols.X;
let winner = undefined;

const getPostRequest = (req, action) => {
  if (winner) return;
  let body = '';

  req.on('data', function (data) {
    body += data;
    if (body.length > 1000000) {
      req.connection.destroy();
    }
  });

  req.on('end', () => {
    action(JSON.parse(body));
  });
};

const montarTabela = (res) => {
  res.writeHead(200, { 'Content-Type': 'application/json;' });

  for (let i = 0; i < 3; i++) {
    if (game[i][0] === game[i][1] && game[i][0] === game[i][2]) {
      winner = game[i][0];

      break;
    }
    for (let j = 0; j < 3; j++) {
      if (game[0][j] === game[1][j] && game[0][j] === game[2][j]) {
        winner = game[0][j];

        break;
      }
    }
  }

  res.write(JSON.stringify({ game, winner }));
  res.end();
};

const carregarPagina = (res) => {
  fs.readFile('./src/pages/index.html', (err, data) => {
    if (err) {
      res.writeHead(500);
      console.error(err);
      res.end();

      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html', charset: 'utf-8' });
    res.write(data);
    res.end();
  });
};

const modifyGame = (newSymbol) => {
  const { i, j } = newSymbol;

  game[i][j] = nextSymbol;
  nextSymbol = nextSymbol === Symbols.X ? Symbols.O : Symbols.X;
};

http
  .createServer((req, res) => {
    switch (req.url) {
      case '/index.html':
      case '/':
        carregarPagina(res);
        break;
      case '/status':
        montarTabela(res);
        break;
      case '/setSymbol':
        getPostRequest(req, modifyGame);
        res.end();
        break;
      case '/reset':
        game = [
          [null, null, null],
          [null, null, null],
          [null, null, null],
        ];
        winner = null;
        res.end();
        break;
      default:
        carregarPagina(res);
    }
  })
  .listen(3000);

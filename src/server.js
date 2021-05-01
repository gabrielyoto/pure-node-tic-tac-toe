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

const getPostRequest = (req, action) => {
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

  res.write(JSON.stringify(game));
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
        res.end();
        break;
      default:
        carregarPagina(res);
    }
  })
  .listen(3000);

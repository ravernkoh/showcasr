const dotenv = require('dotenv');
const Koa = require('koa');

const firebase = require('./firebase');
const globals = require('./globals');
const koa = require('./koa');

const main = async env => {
  const {db} = await firebase();

  const app = new Koa();

  app.context.db = db;
  app.context.globals = globals;

  setInterval(() => {
    for (const client of globals.clients) {
      client.ws.send('Boo!');
    }
  }, 1000);

  koa(env, app);

  app.listen(env.PORT);
};

dotenv.config();

main(process.env)
  .then(() => {})
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

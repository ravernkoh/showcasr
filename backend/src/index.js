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

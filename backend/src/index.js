const dotenv = require("dotenv");
const Koa = require("koa");

const firebase = require("./firebase");
const core = require("./core");
const koa = require("./koa");
const util = require("./util");

const main = async env => {
  const { db } = await firebase();

  const app = new Koa();

  app.context.db = db;
  app.context.core = core({ interval: env.REFRESH_INTERVAL });

  console.log(env);

  app.context.core.startDisplay();

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

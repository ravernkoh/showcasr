const dotenv = require('dotenv');
const Koa = require('koa');
const Router = require('koa-router');

const firebase = require('./firebase');

const projects = require('./koa/projects');

const main = async env => {
  const {db} = await firebase();

  const app = new Koa();

  app.context.db = db;

  const router = new Router();

  const projectsRouter = new Router();
  projects(env, projectsRouter);
  router.use(
    '/projects',
    projectsRouter.routes(),
    projectsRouter.allowedMethods(),
  );

  app.use(router.routes(), router.allowedMethods());

  app.use(async (ctx, next) => {
    ctx.body;
  });

  app.listen(env.PORT);
};

dotenv.config();

main(process.env)
  .then(() => {})
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

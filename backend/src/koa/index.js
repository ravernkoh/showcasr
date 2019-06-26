const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const bearerToken = require("koa-bearer-token");
const CORS = require("koa2-cors");
const websocket = require("koa-easy-ws");

const auth = require("./auth");
const projects = require("./projects");
const live = require("./live");

const buildProjectsRouter = env => {
  const router = new Router();
  router.use(auth());
  projects(env, router);
  return router;
};

const buildLiveRouter = env => {
  const router = new Router();
  live(env, router);
  return router;
};

const buildRouter = env => {
  const router = new Router();

  router.use(
    CORS({
      origin: "*",
      allowMethods: [
        "GET",
        "PUT",
        "POST",
        "PATCH",
        "DELETE",
        "HEAD",
        "OPTIONS",
      ],
    })
  );
  router.use(bodyParser());
  router.use(bearerToken());
  router.use(websocket());

  // In order to satisfy CORS.
  router.options("*", (ctx, next) => {
    ctx.status = 200;
  });

  const projectsRouter = buildProjectsRouter(env);
  router.use(
    "/projects",
    projectsRouter.routes(),
    projectsRouter.allowedMethods()
  );

  const liveRouter = buildLiveRouter(env);
  router.use("/live", liveRouter.routes(), liveRouter.allowedMethods());

  return router;
};

module.exports = (env, app) => {
  const router = buildRouter(env);
  app.use(router.routes(), router.allowedMethods());
};

const firebase = require("firebase-admin");
const uuid = require("uuid/v4");

const auth = require("./auth");

// Get live updates of which project to display.
const get = async ctx => {
  if (!ctx.query.token) {
    // TODO: Handle error properly.
    ctx.status = 401;
    return;
  }

  try {
    await firebase.auth().verifyIdToken(ctx.query.token, true);
  } catch (error) {
    // TODO: Handle error properly.
    ctx.status = 401;
    return;
  }

  if (ctx.ws) {
    const id = uuid();

    const ws = await ctx.ws();
    ws.on("close", () => {
      ctx.core.removeClient(id);
    });

    ctx.core.addClient({ id, ws });
  }
  ctx.status = 500;
  ctx.body = { message: "Could not start websocket connection" };
};

// Configure the current projects.
const post = async ctx => {
  const query = ctx.request.body;

  // TODO: Handle error properly.
  const projects = await ctx.db.projects.all(query);
  ctx.core.setProjects(projects);

  ctx.body = { message: "Success!" };
};

module.exports = (env, router) => {
  router.get("/", get);
  router.post("/", auth(), post);
};

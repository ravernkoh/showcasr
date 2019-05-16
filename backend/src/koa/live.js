// Get live updates of which project to display.
const get = async ctx => {
  if (ctx.ws) {
    const ws = await ctx.ws();
    ctx.core.addClient({ws});
  }
  ctx.status = 500;
  ctx.body = {message: 'Could not start websocket connection'};
};

// Configure the current projects.
const post = async ctx => {
  ctx.core.setProjects(await ctx.db.projects.all());
  ctx.body = {message: 'Success!'};
};

module.exports = (env, router) => {
  router.get('/', get);
  router.post('/', post);
};

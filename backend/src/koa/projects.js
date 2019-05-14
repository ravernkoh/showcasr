const all = async ctx => {
  const projects = await ctx.db.projects.all();
  ctx.body = projects;
};

module.exports = (env, router) => {
  router.get('/', all);
};

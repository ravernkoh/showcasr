const all = async ctx => {
  const projects = await ctx.db.projects.all({});
  ctx.body = projects;
};

const get = async ctx => {
  const id = ctx.params.id;
  const project = await ctx.db.projects.get(id);
  ctx.body = project;
};

const insert = async ctx => {
  let project = ctx.request.body;
  project = await ctx.db.projects.insert(project);
  ctx.body = project;
};

const update = async ctx => {
  let project = ctx.request.body;
  project.id = ctx.params.id;
  project = await ctx.db.projects.update(project);
  ctx.body = project;
};

const _delete = async ctx => {
  const id = ctx.params.id;
  await ctx.db.projects.delete(id);
  ctx.body = {message: 'Success!'};
};

module.exports = (env, router) => {
  router.get('/', all);
  router.post('/', insert);
  router.get('/:id', get);
  router.patch('/:id', update);
  router.delete('/:id', _delete);
};

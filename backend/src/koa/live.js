const index = async ctx => {
  ctx.body = 'Yay!';
};

module.exports = (env, router) => {
  router.all('/', index);
};

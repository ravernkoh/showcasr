const firebase = require("firebase-admin");

module.exports = options => async (ctx, next) => {
  // TODO: Handle error properly.
  if (!ctx.request.token) {
    ctx.status = 401;
    return;
  }

  try {
    await firebase.auth().verifyIdToken(ctx.request.token, true);
  } catch (error) {
    // TODO: Handle error properly.
    ctx.status = 401;
    return;
  }

  await next();
};

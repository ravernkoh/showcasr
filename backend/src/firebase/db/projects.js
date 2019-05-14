const all = db => async () => {
  const projects = [];
  const snapshot = await db.collection('projects').get();
  snapshot.forEach(doc => {
    projects.push(doc.data());
  });
  return projects;
};

module.exports = db => {
  return {
    all: all(db),
  };
};

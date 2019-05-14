const {convertTimestampsToDates} = require('./util');

const all = db => async () => {
  const projects = [];
  const snapshot = await db.collection('projects').get();
  snapshot.forEach(doc => {
    const project = convertTimestampsToDates(doc.data());
    projects.push(project);
  });
  return projects;
};

module.exports = db => {
  return {
    all: all(db),
  };
};

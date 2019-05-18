const {convertTimestampsToDates} = require('./util');

const all = db => async query => {
  const projects = [];

  const snapshot = await db.collection('projects').get();
  snapshot.forEach(doc => {
    const project = convertTimestampsToDates(doc.data());

    // Filter based on the different `query` properties.
    if (query.tags) {
      for (const tag of query.tags) {
        if (!project.tags.includes(tag)) {
          return;
        }
      }
    }
    if (query.course) {
      for (const course of query.course) {
        let found = false;
        if (project.course === course) {
          found = true;
          break;
        }
        if (!found) {
          return;
        }
      }
    }
    if (query.title && !project.title.includes(query.title)) {
      return;
    }
    if (query.description && !project.description.includes(query.description)) {
      return;
    }

    projects.push(project);
  });

  return projects;
};

module.exports = db => {
  return {
    all: all(db),
  };
};

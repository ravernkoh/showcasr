const {NotFoundError} = require('./errors');
const {convertTimestampsToDates} = require('./util');

const all = db => async query => {
  const projects = [];

  const snapshot = await db.collection('projects').get();
  snapshot.forEach(doc => {
    const project = convertTimestampsToDates(doc.data());

    project.id = doc.id;

    // Filter based on the different `query` properties.
    if (query.tags) {
      for (const tag of query.tags) {
        if (!project.tags.includes(tag)) {
          return;
        }
      }
    }
    if (query.course && query.course.length !== 0) {
      let found = false;
      for (const course of query.course) {
        if (project.course === course) {
          found = true;
          break;
        }
      }
      if (!found) {
        return;
      }
    }
    if (
      query.title &&
      query.title !== '' &&
      !project.title.includes(query.title)
    ) {
      return;
    }
    if (
      query.description &&
      query.description !== '' &&
      !project.description.includes(query.description)
    ) {
      return;
    }


    if( query.academicYear &&
        Array.isArray(query.academicYear) &&
        query.academicYear.length == 2 &&
        query.academicYear[0] > project.academicYear &&
        query.academicYear[1] < project.academicYear) {
        return;
    }

    projects.push(project);
  });

  return projects;
};

const get = db => async id => {
  const doc = await db
    .collection('projects')
    .doc(id)
    .get();

  if (!doc.exists) {
    throw new NotFoundError('project not found');
  }

  const project = convertTimestampsToDates(doc.data());

  return project;
};

const insert = db => async project => {
  project = filterProject(project);

  const ref = await db.collection('projects').add(project);
  const doc = await ref.get();

  project = convertTimestampsToDates(doc.data());
  project.id = doc.id;

  return project;
};

const update = db => async project => {
  const id = project.id;
  delete project.id;

  project = filterProject(project);

  let doc = await db
    .collection('projects')
    .doc(id)
    .get();

  if (!doc.exists) {
    throw new NotFoundError('project not found');
  }

  await db
    .collection('projects')
    .doc(id)
    .set(project, {merge: true});
  doc = await db
    .collection('projects')
    .doc(id)
    .get();

  project = convertTimestampsToDates(doc.data());

  return project;
};

const _delete = db => async id => {
  const doc = await db
    .collection('projects')
    .doc(id)
    .get();

  if (!doc.exists) {
    throw new NotFoundError('project not found');
  }

  await db
    .collection('projects')
    .doc(id)
    .delete();
};

const filterProject = project => {
  const filteredProject = {};

  if (project.academicYear) {
    filteredProject.academicYear = project.academicYear;
  }

  if (project.course) {
    filteredProject.course = project.course;
  }

  if (project.description) {
    filteredProject.description = project.description;
  }

  if (project.image) {
    filteredProject.image = project.image;
  }

  if (project.lastUpdated) {
    filteredProject.lastUpdated = project.lastUpdated;
  }

  if (project.lastUpdater) {
    filteredProject.lastUpdater = project.lastUpdater;
  }

  if (project.tags) {
    filteredProject.tags = project.tags;
  }

  if (project.title) {
    filteredProject.title = project.title;
  }

  return project;
};

module.exports = db => {
  return {
    all: all(db),
    get: get(db),
    insert: insert(db),
    update: update(db),
    delete: _delete(db),
  };
};

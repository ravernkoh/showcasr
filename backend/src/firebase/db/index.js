const projects = require("./projects");

module.exports = firebase => {
  const db = firebase.firestore();
  return {
    projects: projects(db)
  };
};

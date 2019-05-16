const queue = require('./queue');

const core = {};

// Stops any existing displays and starts a new display loop.
const startDisplay = core => () => {
  core.stopDisplay();
  core.intervalHandle = setInterval(() => {
    core.rotateClients();
  }, core.options.interval);
};

// Stops any existing displays.
const stopDisplay = core => () => {
  if (this.intervalHandle) {
    clearInterval(this.intervalHandle);
  }
};

// Adds a new client, assigns a project ot them and updates their websocket.
const addClient = core => client => {
  core.clients.push(client);

  const project = core.projects.rotate();
  if (!project) {
    return;
  }
  client.project = project;
  if (client.ws.readyState === 1) {
    client.ws.send(JSON.stringify(client.project));
  }
};

// Rotates the existing clients and sends their new project to them through the websocket.
const rotateClients = core => () => {
  for (const client of core.clients) {
    const project = core.projects.rotate();
    if (!project) {
      continue;
    }
    client.project = project;
    if (client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(client.project));
    }
  }
};

const setProjects = core => projects => {
  core.projects = queue(projects);
};

module.exports = ({interval}) => {
  const core = {
    options: {
      interval,
    },
    intervalHandle: null,
    projects: queue(),
    clients: [],
  };

  core.startDisplay = startDisplay(core);
  core.stopDisplay = stopDisplay(core);
  core.addClient = addClient(core);
  core.rotateClients = rotateClients(core);
  core.setProjects = setProjects(core);

  return core;
};

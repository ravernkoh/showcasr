const queue = require("./queue");

const core = {};

const ACTION_UPDATE = "UPDATE";
const ACTION_CLEAR = "CLEAR";

// Stops any existing displays and starts a new display loop.
const startDisplay = core => () => {
  core.stopDisplay();
  core.intervalHandle = setInterval(() => {
    core.rotateClients();
  }, core.options.interval);
};

// Stops any existing displays.
const stopDisplay = core => () => {
  if (core.intervalHandle) {
    clearInterval(core.intervalHandle);
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
  client.ws.send(
    JSON.stringify({
      action: ACTION_UPDATE,
      data: client.project,
    })
  );
};

// Removes the client with the given id.
const removeClient = core => id => {
  for (let i = 0; i < core.clients.length; i++) {
    if (core.clients[i].id === id) {
      core.clients.splice(i, 1);
      break;
    }
  }
};

// Rotates the existing clients and sends their new project to them through the websocket.
const rotateClients = core => () => {
  // Intitial rotation, to bump things around when they are equal.
  if (core.clients.length % core.projects.length === 0) {
    core.projects.rotate();
  }

  for (const client of core.clients) {
    const project = core.projects.rotate();
    if (!project) {
      client.ws.send(
        JSON.stringify({
          action: ACTION_CLEAR,
        })
      );
      continue;
    }
    client.project = project;
    client.ws.send(
      JSON.stringify({
        action: ACTION_UPDATE,
        data: client.project,
      })
    );
  }
};

const setProjects = core => projects => {
  core.projects = queue(projects);
};

module.exports = ({ interval }) => {
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
  core.removeClient = removeClient(core);
  core.rotateClients = rotateClients(core);
  core.setProjects = setProjects(core);

  return core;
};

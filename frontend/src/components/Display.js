import React, {Fragment, Component} from 'react';

import firebase from 'firebase/app';
import YouTube from 'react-youtube';

import Config from './Config';

import './Display.css';

const ACTION_UPDATE = 'UPDATE';
const ACTION_CLEAR = 'CLEAR';

class Display extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // Stores the current `WebSocket` client.
      ws: null,
      // The URL to connect the websocket to. Should only be set once.
      wsURL: null,
      project: null,
    };

    this.createWebSocket = this.createWebSocket.bind(this);
    this.onWebSocketMessage = this.onWebSocketMessage.bind(this);
    this.onWebSocketClose = this.onWebSocketClose.bind(this);
    this.renderProject = this.renderProject.bind(this);
  }

  componentDidMount() {
    firebase
      .auth()
      .currentUser.getIdToken()
      .then(idToken => {
        const wsURL = `${process.env.REACT_APP_WEBSOCKET_URL}?token=${idToken}`;
        this.setState({wsURL}, () => this.createWebSocket());
      })
      .catch(console.error);
  }

  componentWillUnmount() {
    this.state.ws.close();
  }

  createWebSocket() {
    const ws = new WebSocket(this.state.wsURL);
    ws.onmessage = this.onWebSocketMessage;
    ws.onclose = this.onWebSocketClose;
    this.setState({ws});
  }

  onWebSocketMessage(e) {
    const message = JSON.parse(e.data, JSON.dateParser);

    console.log(message);

    switch (message.action) {
      case ACTION_UPDATE:
        const project = message.data;
        this.setState({project});
        break;
      case ACTION_CLEAR:
        this.setState({project: null});
        break;
      default:
        break;
    }
  }

  onWebSocketClose() {
    // TODO: Change this to exponential backoff (somehow).
    setTimeout(() => this.createWebSocket(), 1000);
  }

  render() {
    return (
      <Fragment>
        <Config />
        {this.state.project ? this.renderProject() : this.renderEmptyState()}
      </Fragment>
    );
  }

  renderEmptyState() {
    return (
      <div className="Display-empty-state">
        No projects loaded... configure below.
      </div>
    );
  }

  renderProject() {
    return (
      <div className="Display-project">
        <div className="Display-project-image">
          <img src={this.state.project.image} alt={this.state.project.title} />
        </div>
        {this.state.project.video ? (
          <div className="Display-project-video">
            <YouTube
              videoId={this.state.project.video}
              opts={{
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                },
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default Display;

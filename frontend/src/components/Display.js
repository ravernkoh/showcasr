import React, {Fragment, Component} from 'react';

import firebase from 'firebase/app';

import Config from './Config';

import './Display.css';

const ACTION_UPDATE = 'UPDATE';
const ACTION_CLEAR = 'CLEAR';

class Display extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ws: null,
      project: null,
    };

    this.onWebSocketMessage = this.onWebSocketMessage.bind(this);
    this.renderProject = this.renderProject.bind(this);
  }

  componentDidMount() {
    firebase
      .auth()
      .currentUser.getIdToken()
      .then(idToken => {
        const ws = new WebSocket(
          `${process.env.REACT_APP_WEBSOCKET_URL}?token=${idToken}`,
        );
        ws.onmessage = this.onWebSocketMessage;
        this.setState({ws});
      })
      .catch(console.error);
  }

  componentWillUnmount() {
    this.state.ws.close();
  }

  onWebSocketMessage(e) {
    const message = JSON.parse(e.data, JSON.dateParser);

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

  render() {
    return (
      <Fragment>
        <Config />
        {this.state.project ? this.renderProject() : 'Empty!'}
      </Fragment>
    );
  }

  renderProject() {
    return (
      <div className="Display-project">
        <img
          className="Display-project-image"
          src={this.state.project.image}
          alt={this.state.project.title}
        />
      </div>
    );
  }
}

export default Display;

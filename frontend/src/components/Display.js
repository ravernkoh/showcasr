import React, {Component} from 'react';

import './Display.css';

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
    const ws = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    ws.onmessage = this.onWebSocketMessage;
    this.setState({ws});
  }

  componentWillUnmount() {
    this.state.ws.close();
  }

  onWebSocketMessage(e) {
    const project = JSON.parse(e.data, JSON.dateParser);
    this.setState({project});
  }

  render() {
    if (this.state.project) {
      return this.renderProject();
    } else {
      return <div>Empty!</div>;
    }
  }

  renderProject() {
    return (
      <img src={this.state.project.image} alt={this.state.project.title} />
    );
  }
}

export default Display;

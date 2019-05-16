import React, {Component} from 'react';

import './Display.css';

class Display extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ws: null,
    };

    this.onWebSocketMessage = this.onWebSocketMessage.bind(this);
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
    console.log(JSON.parse(e.data, JSON.dateParser));
  }

  render() {
    return <p>Hello, world!</p>;
  }
}

export default Display;

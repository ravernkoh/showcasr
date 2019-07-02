import React, {Component} from 'react';

import axios from '../axios';

import './Config.css';

class Config extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: false,
      form: {
        title: '',
        description: '',
        tags: [],
        course: [],
      },
    };

    this.onToggleButtonPressed = this.onToggleButtonPressed.bind(this);
    this.onTitleInputChanged = this.onTitleInputChanged.bind(this);
    this.onDescriptionInputChanged = this.onDescriptionInputChanged.bind(this);
    this.onTagsInputChanged = this.onTagsInputChanged.bind(this);
    this.onCourseInputChanged = this.onCourseInputChanged.bind(this);
    this.onSubmitButtonPressed = this.onSubmitButtonPressed.bind(this);

    this.renderExpanded = this.renderExpanded.bind(this);
  }

  onToggleButtonPressed() {
    this.setState({isExpanded: !this.state.isExpanded});
  }

  onTitleInputChanged(event) {
    const form = this.state.form;
    form.title = event.target.value;
    this.setState({form});
  }

  onDescriptionInputChanged(event) {
    const form = this.state.form;
    form.description = event.target.value;
    this.setState({form});
  }

  onTagsInputChanged(event) {
    const form = this.state.form;
    form.tags = event.target.value.split(',').map(tag => tag.trim());
    this.setState({form});
  }

  onCourseInputChanged(event) {
    const form = this.state.form;
    form.course = event.target.value.split(',').map(course => course.trim());
    this.setState({form});
  }

  onSubmitButtonPressed(event) {
    event.preventDefault();

    axios
      .post('/live', this.state.form)
      .then(res => res.data)
      .then(console.log)
      .catch(console.error);
  }

  render() {
    return (
      <div className="Config-main">
        {this.state.isExpanded ? this.renderExpanded() : null}
        <div className="Config-toggle">
          <button
            className="Config-toggle-button"
            onClick={this.onToggleButtonPressed}>
            {this.state.isExpanded ? 'Close' : 'Configure'}
          </button>
        </div>
      </div>
    );
  }

  renderExpanded() {
    return (
      <div className="Config-main-expanded">
        <form className="Config-form" onSubmit={this.onSubmitButtonPressed}>
          <div className="Config-form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              value={this.state.form.title}
              onChange={this.onTitleInputChanged}
              name="title"
            />
          </div>
          <div className="Config-form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              value={this.state.form.description}
              onChange={this.onDescriptionInputChanged}
              name="description"
            />
          </div>
          <div className="Config-form-group">
            <label htmlFor="tags">Tags</label>
            <small>Comma-separated list of tags</small>
            <input
              type="text"
              value={this.state.form.tags.join(',')}
              onChange={this.onTagsInputChanged}
              name="tags"
            />
          </div>
          <div className="Config-form-group">
            <label htmlFor="course">Course</label>
            <small>Comma-separated list of tags</small>
            <input
              type="text"
              value={this.state.form.course.join(',')}
              onChange={this.onCourseInputChanged}
              name="course"
            />
          </div>
          <div className="Config-form-group">
            <button className="Config-form-submit-button" type="submit">
              Refresh
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default Config;

import React, {Fragment, Component} from 'react';

import firebase from 'firebase/app';

import axios from '../axios';

import './Display.css';

const ACTION_NONE = 'CREATE';
const ACTION_CREATE = 'CREATE';
const ACTION_UPDATE = 'UPDATE';

class Display extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSaving: false,
      projects: [],
    };

    this.onSaveButtonPressed = this.onSaveButtonPressed.bind(this);

    this.renderProject = this.renderProject.bind(this);
  }

  componentDidMount() {
    axios
      .get('/projects')
      .then(res => res.data)
      .then(projects => this.setState({projects}))
      .catch(console.error);
  }

  onSaveButtonPressed() {
    this.setState({isSaving: true});
    setTimeout(() => this.setState({isSaving: false}), 2000);
  }

  render() {
    return (
      <Fragment>
        <button
          className="Display-save-button"
          onClick={this.onSaveButtonPressed}
          disabled={this.state.isSaving}>
          {this.state.isSaving ? 'Saving...' : 'Save'}
        </button>
        <div className="Display-projects">
          {this.state.projects.map(this.renderProject)}
        </div>
      </Fragment>
    );
  }

  renderProject(project, index) {
    return (
      <div className="Display-project" key={index}>
        <form className="Display-project-form">
          <div className="Display-project-form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              value={project.title}
              onChange={undefined}
              name="title"
            />
          </div>
          <div className="Display-project-form-group">
            <label htmlFor="course">Course</label>
            <input
              type="text"
              value={project.course}
              onChange={undefined}
              name="course"
            />
          </div>
          <div className="Display-project-form-group">
            <label htmlFor="academicYear">Academic Year</label>
            <input
              type="text"
              value={project.academicYear}
              onChange={undefined}
              name="academicYear"
            />
          </div>
          <div className="Display-project-form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              value={project.tags}
              onChange={undefined}
              name="tags"
            />
          </div>
          <div className="Display-project-form-group">
            <label htmlFor="description">Description</label>
            <textarea onChange={undefined} name="description">
              {project.description}
            </textarea>
          </div>
        </form>
        <hr />
      </div>
    );
  }
}

export default Display;

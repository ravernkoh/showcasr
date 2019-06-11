import React, {Fragment, Component} from 'react';

import axios from '../axios';

import './Display.css';

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
    this.onTitleInputChanged = this.onTitleInputChanged.bind(this);
    this.onAcademicYearInputChanged = this.onAcademicYearInputChanged.bind(
      this,
    );
    this.onDescriptionTextareaChanged = this.onDescriptionTextareaChanged.bind(
      this,
    );
    this.onTagsInputChanged = this.onTagsInputChanged.bind(this);
    this.onCourseInputChanged = this.onCourseInputChanged.bind(this);
    this.onCreateButtonPressed = this.onCreateButtonPressed.bind(this);

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

    let hasUpdates = false;
    for (let i = 0; i < this.state.projects.length; i++) {
      const project = this.state.projects[i];

      if (!project.action) {
        continue;
      }

      hasUpdates = true;

      switch (project.action) {
        case ACTION_CREATE:
          axios
            .post('/projects', project)
            .then(res => res.data)
            .then(project => {
              this.state.projects[i] = project;
              this.setState({isSaving: false, projects: this.state.projects});
            })
            .catch(console.error);
          break;

        case ACTION_UPDATE:
          axios
            .patch(`/projects/${project.id}`, project)
            .then(res => res.data)
            .then(() => {
              this.state.projects[i] = project;
              this.setState({isSaving: false, projects: this.state.projects});
            })
            .catch(console.error);
          break;

        default:
          break;
      }
    }

    if (!hasUpdates) {
      this.setState({isSaving: false});
    }
  }

  onTitleInputChanged(index) {
    return event => {
      const project = this.state.projects[index];
      project.action = ACTION_UPDATE;
      project.title = event.target.value;
      this.setState({projects: this.state.projects});
    };
  }

  onTagsInputChanged(index) {
    return event => {
      const project = this.state.projects[index];
      project.action = ACTION_UPDATE;
      project.tags = event.target.value.split(',').map(tag => tag.trim());
      this.setState({projects: this.state.projects});
    };
  }

  onDescriptionTextareaChanged(index) {
    return event => {
      const project = this.state.projects[index];
      project.action = ACTION_UPDATE;
      project.description = event.target.value;
      this.setState({projects: this.state.projects});
    };
  }

  onCourseInputChanged(index) {
    return event => {
      const project = this.state.projects[index];
      project.action = ACTION_UPDATE;
      project.course = event.target.value;
      this.setState({projects: this.state.projects});
    };
  }

  onAcademicYearInputChanged(index) {
    return event => {
      const project = this.state.projects[index];
      project.action = ACTION_UPDATE;

      try {
        project.academicYear = parseInt(event.target.value, 10);
      } catch (error) {}

      this.setState({projects: this.state.projects});
    };
  }

  onCreateButtonPressed() {
    this.state.projects.push({
      action: ACTION_CREATE,
      title: '',
      course: '',
      academicYear: '',
      tags: [],
      description: '',
    });
    this.setState({projects: this.state.projects});
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
          <button
            className="Display-create-button"
            onClick={this.onCreateButtonPressed}>
            Create
          </button>
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
              onChange={this.onTitleInputChanged(index)}
              name="title"
            />
          </div>
          <div className="Display-project-form-group">
            <label htmlFor="course">Course</label>
            <input
              type="text"
              value={project.course}
              onChange={this.onCourseInputChanged(index)}
              name="course"
            />
          </div>
          <div className="Display-project-form-group">
            <label htmlFor="academicYear">Academic Year</label>
            <input
              type="text"
              value={project.academicYear}
              onChange={this.onAcademicYearInputChanged(index)}
              name="academicYear"
            />
          </div>
          <div className="Display-project-form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              value={project.tags.join(',')}
              onChange={this.onTagsInputChanged(index)}
              name="tags"
            />
          </div>
          <div className="Display-project-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              value={project.description}
              onChange={this.onDescriptionTextareaChanged(index)}
              name="description"
            />
          </div>
        </form>
        <hr />
      </div>
    );
  }
}

export default Display;

import React, {Fragment, Component} from 'react';

import axios from '../axios';

import './Display.css';

const ACTION_CREATE = 'CREATE';
const ACTION_DELETE = 'DELETE';
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
    this.onDeleteButtonPressed = this.onDeleteButtonPressed.bind(this);
    this.onCreateButtonPressed = this.onCreateButtonPressed.bind(this);

    this.reloadProjects = this.reloadProjects.bind(this);

    this.renderProject = this.renderProject.bind(this);
    this.renderProjectForm = this.renderProjectForm.bind(this);
  }

  componentDidMount() {
    this.reloadProjects();
  }

  onSaveButtonPressed() {
    this.setState({isSaving: true});

    let requests = [];
    for (let i = 0; i < this.state.projects.length; i++) {
      const project = this.state.projects[i];

      if (!project.action) {
        continue;
      }

      switch (project.action) {
        case ACTION_CREATE:
          requests.push(axios.post('/projects', project));
          break;

        case ACTION_UPDATE:
          const id = project.id;
          delete project.id;
          delete project.action;
          requests.push(axios.patch(`/projects/${id}`, project));
          break;

        case ACTION_DELETE:
          requests.push(axios.delete(`/projects/${project.id}`));
          break;

        default:
          break;
      }
    }

    if (requests.length === 0) {
      this.setState({isSaving: false});
      return;
    }

    Promise.all(requests)
      .then(res => {
        this.reloadProjects();
        console.log(res);
      })
      .catch(error => {
        this.reloadProjects();
        console.error(error);
      });
  }

  reloadProjects() {
    axios
      .get('/projects')
      .then(res => res.data)
      .then(projects => this.setState({isSaving: false, projects}))
      .catch(console.error);
  }

  onTitleInputChanged(index) {
    return event => {
      const project = this.state.projects[index];
      if (!project.action) {
        project.action = ACTION_UPDATE;
      }
      project.title = event.target.value;
      this.setState({projects: this.state.projects});
    };
  }

  onTagsInputChanged(index) {
    return event => {
      const project = this.state.projects[index];
      if (!project.action) {
        project.action = ACTION_UPDATE;
      }
      project.tags = event.target.value.split(',').map(tag => tag.trim());
      this.setState({projects: this.state.projects});
    };
  }

  onDescriptionTextareaChanged(index) {
    return event => {
      const project = this.state.projects[index];
      if (!project.action) {
        project.action = ACTION_UPDATE;
      }
      project.description = event.target.value;
      this.setState({projects: this.state.projects});
    };
  }

  onCourseInputChanged(index) {
    return event => {
      const project = this.state.projects[index];
      if (!project.action) {
        project.action = ACTION_UPDATE;
      }
      project.course = event.target.value;
      this.setState({projects: this.state.projects});
    };
  }

  onAcademicYearInputChanged(index) {
    return event => {
      const project = this.state.projects[index];
      if (!project.action) {
        project.action = ACTION_UPDATE;
      }

      try {
        project.academicYear = parseInt(event.target.value, 10);
      } catch (error) {}
      if (isNaN(project.academicYear)) {
        project.academicYear = '';
      }

      this.setState({projects: this.state.projects});
    };
  }

  onDeleteButtonPressed(index) {
    return () => {
      const project = this.state.projects[index];
      project.action = ACTION_DELETE;
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
        {project.action === ACTION_DELETE
          ? this.renderDeleteNote()
          : this.renderProjectForm(project, index)}
        <hr />
      </div>
    );
  }

  renderProjectForm(project, index) {
    return (
      <Fragment>
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
        <button
          className="Display-delete-button"
          onClick={this.onDeleteButtonPressed(index)}>
          Delete!
        </button>
        {project.action === ACTION_UPDATE ? this.renderUpdateNote() : null}
        {project.action === ACTION_CREATE ? this.renderCreateNote() : null}
      </Fragment>
    );
  }

  renderDeleteNote() {
    return <span className="Display-note-delete">Deleted!</span>;
  }

  renderUpdateNote() {
    return <span className="Display-note-update">Updated!</span>;
  }

  renderCreateNote() {
    return <span className="Display-note-create">New!</span>;
  }
}

export default Display;

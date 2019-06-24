import React, {Fragment, Component} from 'react';

import uuid from 'uuid';
import firebase from 'firebase/app';

import axios from '../axios';

import './Display.css';

const ACTION_CREATE = 'CREATE';
const ACTION_DELETE = 'DELETE';
const ACTION_UPDATE = 'UPDATE';

const IMAGE_LOCAL = 'LOCAL';
const IMAGE_REMOTE = 'REMOTE';

class Display extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSaving: false,
      projects: [],
    };

    this.onCollapsedProjectPressed = this.onCollapsedProjectPressed.bind(this);
    this.onCloseButtonPressed = this.onCloseButtonPressed.bind(this);
    this.onSaveButtonPressed = this.onSaveButtonPressed.bind(this);
    this.onTitleInputChanged = this.onTitleInputChanged.bind(this);
    this.onAcademicYearInputChanged = this.onAcademicYearInputChanged.bind(
      this,
    );
    this.onDescriptionTextareaChanged = this.onDescriptionTextareaChanged.bind(
      this,
    );
    this.onImageInputChanged = this.onImageInputChanged.bind(this);
    this.onTagsInputChanged = this.onTagsInputChanged.bind(this);
    this.onCourseInputChanged = this.onCourseInputChanged.bind(this);
    this.onDeleteButtonPressed = this.onDeleteButtonPressed.bind(this);
    this.onCreateButtonPressed = this.onCreateButtonPressed.bind(this);

    this.reloadProjects = this.reloadProjects.bind(this);

    this.renderProject = this.renderProject.bind(this);
    this.renderCollapsedProject = this.renderCollapsedProject.bind(this);
    this.renderProjectForm = this.renderProjectForm.bind(this);
  }

  componentDidMount() {
    this.reloadProjects();
  }

  onCloseButtonPressed(index) {
    return () => {
      const project = this.state.projects[index];
      project.isExpanded = false;
      this.setState({projects: this.state.projects});
    };
  }

  onCollapsedProjectPressed(index) {
    return () => {
      const project = this.state.projects[index];
      project.isExpanded = true;
      this.setState({projects: this.state.projects});
    };
  }

  onSaveButtonPressed() {
    this.setState({isSaving: true});

<<<<<<< HEAD
    this.uploadProjectImages()
      .then(() => this.saveProjects())
      .then(res => {
        this.reloadProjects();
        console.log(res);
      })
      .catch(error => {
        this.reloadProjects();
        console.error(error);
      });
  }

  async uploadProjectImages() {
    const indexes = [];
    const requests = [];

    for (let i = 0; i < this.state.projects.length; i++) {
      const project = this.state.projects[i];

      if (!project.action) {
        continue;
      }

      if (
        project.action !== ACTION_CREATE &&
        project.action !== ACTION_UPDATE
      ) {
        continue;
      }

      if (project.image.type !== IMAGE_LOCAL) {
        continue;
      }

      const ext = /(?:\.([^.]+))?$/.exec(project.image.file.name)[1];
      const name = project.image.file.name.replace(/\.[^/.]+$/, '');

      indexes.push(i);
      requests.push(
        firebase
          .storage()
          .ref()
          .child(`images/posters/${name}-${uuid()}.${ext}`)
          .put(project.image.file),
      );

      delete project.image.type;
    }

    if (requests.length === 0) {
      return;
    }

    const snapshots = await Promise.all(requests);

    for (let i = 0; i < snapshots.length; i++) {
      const index = indexes[i];
      const snapshot = snapshots[i];

      const url = await snapshot.ref.getDownloadURL();

      const project = this.state.projects[index];
      project.image = {
        type: IMAGE_REMOTE,
        url,
      };
      this.setState({projects: this.state.projects});
    }
  }

  async saveProjects() {
    const requests = [];

    for (let i = 0; i < this.state.projects.length; i++) {
      const project = this.state.projects[i];

      if (!project.action) {
        continue;
      }

      switch (project.action) {
        case ACTION_CREATE:
          project.image = project.image.url;
          delete project.action;
          delete project.isExpanded;
          requests.push(axios.post('/projects', project));
          break;

        case ACTION_UPDATE:
          const id = project.id;
          delete project.id;
          project.image = project.image.url;
          delete project.action;
          delete project.isExpanded;
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

    await Promise.all(requests);
  }

  reloadProjects() {
    axios
      .get('/projects')
      .then(res => res.data)
      .then(projects =>
        projects.map(project => {
          project.image = {
            type: IMAGE_REMOTE,
            url: project.image,
          };
          return project;
        }),
      )
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

  onImageInputChanged(index) {
    return event => {
      const project = this.state.projects[index];
      if (!project.action) {
        project.action = ACTION_UPDATE;
      }
      project.image = {
        type: IMAGE_LOCAL,
        file: event.target.files[0],
        url: URL.createObjectURL(event.target.files[0]),
      };
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
      isExpanded: true,
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
    let content;

    if (project.action === ACTION_DELETE) {
      content = this.renderDeleteNote();
    } else if (!project.isExpanded) {
      content = this.renderCollapsedProject(project, index);
    } else {
      content = this.renderProjectForm(project, index);
    }

    return (
      <div className="Display-project" key={index}>
        {content}
        <hr />
      </div>
    );
  }

  renderCollapsedProject(project, index) {
    return (
      <div
        className="Display-collapsed-project"
        onClick={this.onCollapsedProjectPressed(index)}>
        <p className="Display-collapsed-project-title">
          {project.title || '<empty>'}
        </p>
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
          <div className="Display-project-form-group">
            <label htmlFor="image">Image</label>
            <div className="Display-project-form-image">
              <img
                className="Display-project-form-image-preview"
                src={project.image.url}
                alt="Project Poster"
              />
              <input
                type="file"
                onChange={this.onImageInputChanged(index)}
                name="image"
              />
            </div>
          </div>
        </form>
        <button
          className="Display-close-button"
          onClick={this.onCloseButtonPressed(index)}>
          Close
        </button>
        <button
          className="Display-delete-button"
          onClick={this.onDeleteButtonPressed(index)}>
          Delete!
        </button>
        {this.renderProjectNote(project)}
      </Fragment>
    );
  }

  renderProjectNote(project) {
    switch (project.action) {
      case ACTION_UPDATE:
        return this.renderUpdateNote();
      case ACTION_CREATE:
        return this.renderCreateNote();
      default:
        return null;
    }
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

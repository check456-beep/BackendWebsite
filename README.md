# Python Data Science Tutorial Platform

An interactive web-based platform for learning data science and machine learning concepts through hands-on Python coding exercises.

## Overview

This platform provides step-by-step tutorials with interactive code editing, execution, and visualization capabilities focused on Python programming for data analysis. The application runs Python code in a secure sandbox environment and visualizes results directly in the browser.

## Features

- **Interactive Code Editor**: Syntax highlighting, code completion, and error checking
- **In-browser Code Execution**: Run Python code without local installation
- **Real-time Visualization**: Matplotlib plots render directly in the browser
- **Guided Tutorials**: Step-by-step instructions with progression tracking
- **Reference Tools**: Quick access to API documentation for data science libraries
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Prerequisites

- Node.js (v16+)
- Python 3.9+
- Docker (optional, for containerized deployment)

### Docker Deployment

For a containerized deployment with all dependencies:

```
docker build -t python-tutorial-platform .
docker run -p 5000:5000 python-tutorial-platform
```
Access the platform at http://localhost:5000

## Tutorial Structure

The platform currently includes the following tutorials:

### Linear Regression
- **Section 1**: Understanding Linear Regression
- **Section 2**: Implementing Polynomial Regression with NumPy
- **Section 3**: Evaluating Regression Models

Each tutorial section includes:
- Explanatory content
- Sample code
- Interactive tasks
- Reference tools
- Validation criteria

## Development

### Directory Structure

- `/public`: Frontend assets and HTML
- `/data`: Tutorial content in JSON format
- `/temp`: Temporary Python script storage
- `server.js`: Express backend server
- `Dockerfile`: Container configuration

### Adding New Tutorials

1. Create a new directory under `/data` with a unique tutorial ID
2. Create a `metadata.json` file with tutorial information
3. Add section files in JSON format (see existing tutorials for examples)

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, CodeMirror
- **Backend**: Node.js, Express
- **Python Execution**: Child process with sandboxing
- **Data Science Libraries**: NumPy, Matplotlib, scikit-learn, Pandas
- **Containerization**: Docker

## Security Features

- Non-root user execution in Docker
- Restricted filesystem access
- Resource limiting
- Harmful code pattern detection
- Temporary file cleanup

## License

[MIT License](LICENSE)
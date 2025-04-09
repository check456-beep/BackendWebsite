# Website Refactor Project Explanation

## Overview
This project is an interactive coding tutorial platform designed to teach data science and machine learning concepts through a web-based interface. The platform provides step-by-step tutorials with interactive code editing, execution, and visualization capabilities focused on Python programming for data analysis.

## Architecture
- **Frontend**: HTML/CSS/JavaScript web application with CodeMirror for code editing
- **Backend**: Node.js with Express.js server
- **Project Structure**:
  - `Website/`: Main web application
    - `public/`: Static assets (HTML, CSS, JS)
    - `data/`: Tutorial content (Python code, JSON metadata)
    - `server.js`: Express server for serving content
  - `Parser/`: Python scripts to process tutorial code
    - `codeToJSON.py`: Converts annotated Python files to structured JSON
    - `addDocumentation.py`: Enhances code with documentation

## Core Features
1. **Interactive Tutorials**: Step-by-step guided lessons with explanations and tasks
2. **Code Editor**: In-browser Python code editing with syntax highlighting
3. **Code Execution**: Ability to run Python code and view outputs
4. **Visualizations**: Support for displaying graphs and plots from code execution
5. **Progress Tracking**: Task completion and progress monitoring
6. **Tool Reference**: Searchable library of Python methods and tools with documentation

## Current Implementation
The current implementation uses a Node.js/Express backend to serve static content and provide API endpoints. The Python code examples (e.g., linear regression tutorial) are pre-parsed into JSON and served to the frontend, which uses JavaScript to handle the tutorial flow, code editing, and visualization.

## Frontend UI Description
The web interface follows a modern IDE-inspired design with a dark Monokai theme. The layout consists of three main panels:

1. **Left Sidebar (Tasks Panel)**:
   - Displays a list of tasks for the current tutorial section
   - Tasks can be checked off as completed
   - Shows feedback messages for task success/failure
   - Includes hint buttons that reveal help text when needed
   - Completed tasks are highlighted with green indicators

2. **Main Content Area (Code Editor)**:
   - Features a CodeMirror-powered editor with Python syntax highlighting
   - Displays a section title at the top
   - Shows line numbers for easy reference
   - Status bar indicating "Python" at the bottom
   - Control buttons below for "Restart Section," "Run Code," and "Next Section"
   - Progress bar displaying completion status of the current tutorial

3. **Right Sidebar (Tools Reference)**:
   - Searchable library of Python tools and methods
   - Toggle buttons to filter between "Libraries" and "Methods"
   - List of available functions with descriptions
   - Documentation links for each method
   - Hover effects and animation for better user experience

The interface includes several interactive elements:
- Output indicators that show when code has been executed
- Popup windows that display code execution results
- Task feedback that appears when tasks are completed
- Tooltips providing additional information
- Animated transitions between sections

The responsive design adapts to different screen sizes, with the three-panel layout collapsing to a single column on mobile devices. The color scheme consistently uses:
- Dark backgrounds (#272822, #1e1f1c)
- Light text (#f8f8f2)
- Accent colors for different syntax elements:
  - Blue (#66d9ef) for functions and keywords
  - Green (#a6e22e) for variables and success indicators
  - Pink (#f92672) for operators and error messages
  - Purple (#ae81ff) for numbers
  - Orange (#fd971f) for definitions

Custom scrollbars, animations, and transitions enhance the modern feel of the interface, creating an engaging learning environment that mimics professional coding tools.

## Technical Details
- Uses the Monokai color theme for code display
- Responsive design for different screen sizes
- Documentation follows a specific style guide for machine learning content
- The system appears to focus on data science and ML concepts, starting with linear regression

---

# Refactoring Prompt

## Objective: Refactor the Website to use Python with Docker and Express Backend

### Current Limitations to Address
The current JavaScript-only implementation limits the ability to execute Python code directly. The pre-parsed JSON approach restricts dynamic code generation and real-time execution of user-written Python code.

### Proposed Architecture
1. **Docker-based Python Execution Environment**:
   - Create a containerized Python environment with all necessary data science libraries
   - Implement secure code execution sandbox for running user code
   - Support matplotlib/seaborn visualization output capture

2. **Backend API**:
   - Develop an efficient service for Python code execution
   - Implement endpoints for:
     - Code execution with output capture
     - Visualization rendering and return
     - Verification of task completion
     - Tutorial progression management

3. **Express.js Frontend Server**:
   - Maintain existing Express server for static content
   - Add proxy endpoints to communicate with Python backend
   - Implement authentication and rate limiting

4. **Database Integration**:
   - Add user progress tracking with MongoDB/PostgreSQL
   - Store user code submissions and results

### Implementation Requirements
1. Create Dockerfile for Python environment with numpy, pandas, matplotlib, scikit-learn, etc.
2. Develop Python execution service with appropriate sandboxing
3. Implement API for code execution, returning formatted results (text, plots as base64)
4. Enhance the existing frontend to communicate with the new backend
5. Maintain the current UX/UI while improving functionality

### Security Considerations
- Sandbox all code execution to prevent security vulnerabilities
- Implement resource limits (CPU, memory, execution time)
- Validate user inputs to prevent injection attacks
- Use proper authentication and authorization

This refactoring will transform the static tutorial into a fully interactive learning environment where users can execute real Python code and see results directly in the browser.

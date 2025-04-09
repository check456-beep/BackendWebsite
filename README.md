# Python Scientific Web IDE with Express

This project provides a web-based Python IDE designed specifically for scientific computing and data visualization, using Express.js (Node.js) as the backend server.

## Features

- Node.js/Express backend with Python execution capabilities
- Support for scientific libraries (NumPy, Matplotlib, scikit-learn, pandas)
- Real-time plotting with Matplotlib
- Code editor with syntax highlighting
- Execution time tracking
- Responsive design

## Directory Structure

```
python-scientific-ide/
│
├── server.js                   # Express server implementation
├── package.json                # Node.js dependencies
├── Dockerfile                  # Docker configuration with Node.js and Python
├── public/                     # Static web assets
│   └── index.html              # Web interface
└── temp/                       # Temporary directory for Python scripts (created at runtime)
```

## Setup Instructions

### Using Docker (Recommended)

1. **Create the project directory structure**
   ```bash
   mkdir -p python-scientific-ide/public
   cd python-scientific-ide
   ```

2. **Create the required files**
   - Create `package.json`, `server.js`, `Dockerfile`, and `public/index.html` with the provided code

3. **Build the Docker image**
   ```bash
   docker build -t python-scientific-express .
   ```

4. **Run the Docker container**
   ```bash
   docker run -p 5000:5000 python-scientific-express
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

### Manual Setup (without Docker)

1. **Install Node.js and npm**

2. **Install Python and required packages**
   ```bash
   pip install numpy matplotlib scikit-learn pandas scipy
   ```

3. **Create the project directory structure as above**

4. **Install Node.js dependencies**
   ```bash
   npm install
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## Running Scientific Code

The IDE is optimized for running scientific Python code with the following libraries:

- **NumPy** - For numerical computations
- **Matplotlib** - For data visualization
- **scikit-learn** - For machine learning
- **pandas** - For data analysis
- **SciPy** - For advanced scientific computing

### Handling Polynomial Regression Code

This implementation is specifically designed to handle complex polynomial regression code without modifications. It includes:

- Automatic handling of matplotlib plots
- Increased execution timeout (60 seconds)
- Automatic syntax error fixing
- Proper resource allocation

## Key Benefits of Using Express

1. **Improved Performance**: Node.js is lightweight and has excellent request handling capabilities
2. **Non-blocking I/O**: Better handles multiple concurrent requests
3. **Greater Scalability**: More scalable than Python-based web servers for serving web content
4. **Rich Ecosystem**: Access to thousands of NPM packages
5. **Simple API**: Express offers a simpler API compared to Python frameworks

## Customization

You can customize the Express server by modifying `server.js` to add additional routes, middleware, or features. The Python environment can be extended by adding more packages to the Dockerfile.

## Security Considerations

This application executes user-submitted code on the server, which poses security risks. For production use, consider implementing:

- Code execution isolation (e.g., using more restrictive containers)
- User authentication and authorization
- Resource limits and quotas
- Input validation and sanitization

## License

MIT
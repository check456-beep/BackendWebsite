const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store active Python processes
const activeProcesses = new Map();

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: true,
  setHeaders: (res, path) => {
    // Ensure proper content types for files
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
    // Disable caching for development
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Create temporary directory for Python scripts
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Function to clean up old temporary files
const cleanupTempFiles = () => {
  const files = fs.readdirSync(tempDir);
  const now = Date.now();
  
  files.forEach(file => {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);
    // Remove files older than 1 hour
    if (now - stats.mtime.getTime() > 3600000) {
      fs.unlinkSync(filePath);
    }
  });
};

// Clean up temp files periodically
setInterval(cleanupTempFiles, 3600000);

// Function to prepare Python code with matplotlib capture
const preparePythonCode = (code) => {
  // Fix the if **name** syntax error if present
  let modifiedCode = code.replace(/if \*\*name\*\* ==/g, 'if __name__ ==');
  
  // Add matplotlib capture if matplotlib is used
  if (code.includes('matplotlib.pyplot') || code.includes('import plt')) {
    const matplotlibCapture = `
import io
import base64
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
from matplotlib import pyplot as plt

# Store the original plt.show function
original_plt_show = plt.show

# Override plt.show to capture the image data
def custom_plt_show(*args, **kwargs):
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=80, bbox_inches='tight')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    print(f"<matplotlib_figure>{img_base64}</matplotlib_figure>")
    plt.close()

# Replace plt.show with our custom function
plt.show = custom_plt_show
`;
    
    // Insert capture code after matplotlib import
    if (modifiedCode.includes('import matplotlib.pyplot as plt')) {
      modifiedCode = modifiedCode.replace(
        'import matplotlib.pyplot as plt',
        'import matplotlib.pyplot as plt\n' + matplotlibCapture
      );
    } else if (modifiedCode.includes('from matplotlib import pyplot as plt')) {
      modifiedCode = modifiedCode.replace(
        'from matplotlib import pyplot as plt',
        'from matplotlib import pyplot as plt\n' + matplotlibCapture
      );
    }
  }
  
  return modifiedCode;
};

// Function to process output with matplotlib figures
const processOutput = (output) => {
  const imgPattern = /<matplotlib_figure>(.*?)<\/matplotlib_figure>/gs;
  let processedOutput = output;
  let match;
  
  while ((match = imgPattern.exec(output)) !== null) {
    const imgBase64 = match[1];
    const imgTag = `<img src="data:image/png;base64,${imgBase64}" alt="Plot" />`;
    processedOutput = processedOutput.replace(match[0], imgTag);
  }
  
  return processedOutput;
};

// API endpoint to execute Python code
app.post('/api/execute', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  // Prepare the code with matplotlib handling
  const modifiedCode = preparePythonCode(code);
  
  // Create a unique temp file for this execution
  const fileName = `python_script_${uuidv4()}.py`;
  const filePath = path.join(tempDir, fileName);
  const processId = uuidv4();
  
  // Write code to temp file
  try {
    fs.writeFileSync(filePath, modifiedCode);
  } catch (err) {
    console.error('Error writing temp file:', err);
    return res.status(500).json({ error: 'Server error: Could not create temporary file' });
  }
  
  // Track execution time
  const startTime = Date.now();
  
  // Execute Python script
  let pythonProcess;
  try {
    pythonProcess = spawn('python3', [filePath], { stdio: ['pipe', 'pipe', 'pipe'] });
    // Store the process reference
    activeProcesses.set(processId, pythonProcess);
  } catch (err) {
    console.error('Error spawning Python process:', err);
    return res.status(500).json({ error: 'Server error: Could not execute Python' });
  }
  
  let stdout = '';
  let stderr = '';
  
  // Collect stdout data
  pythonProcess.stdout.on('data', (data) => {
    stdout += data.toString();
    
    // Send real-time output updates via WebSocket
    wss.clients.forEach(client => {
      if (client.processId === processId) {
        client.send(JSON.stringify({ type: 'output', data: data.toString() }));
      }
    });
  });
  
  // Collect stderr data
  pythonProcess.stderr.on('data', (data) => {
    stderr += data.toString();
    
    // Send real-time error updates via WebSocket
    wss.clients.forEach(client => {
      if (client.processId === processId) {
        client.send(JSON.stringify({ type: 'error', data: data.toString() }));
      }
    });
  });
  
  // Set timeout (60 seconds for scientific computing)
  const timeout = setTimeout(() => {
    pythonProcess.kill();
    
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error removing temp file:', err);
    }
    
    res.status(408).json({
      output: 'Execution timed out after 60 seconds. Try reducing the complexity of your code.',
      executionTime: 60
    });
  }, 60000);
  
  // Handle process completion
  pythonProcess.on('close', (code) => {
    clearTimeout(timeout);
    
    // Calculate execution time
    const executionTime = (Date.now() - startTime) / 1000;
    
    // Process output
    let output;
    if (code === 0) {
      output = processOutput(stdout);
      
      // Add execution time
      output += `\n\n// Code executed in ${executionTime.toFixed(2)} seconds`;
    } else {
      output = stderr;
    }
    
    // Remove temp file
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error removing temp file:', err);
    }
    
    // Remove from active processes
    activeProcesses.delete(processId);
    
    // Notify WebSocket clients about completion
    wss.clients.forEach(client => {
      if (client.processId === processId) {
        client.send(JSON.stringify({ type: 'completed', data: output }));
        client.processId = null;
      }
    });
    
    res.json({ output, executionTime, processId });
  });
  
  // Handle process errors
  pythonProcess.on('error', (err) => {
    clearTimeout(timeout);
    console.error('Python process error:', err);
    
    try {
      fs.unlinkSync(filePath);
    } catch (fileErr) {
      console.error('Error removing temp file:', fileErr);
    }
    
    res.status(500).json({ 
      error: 'Server error: Python execution failed',
      output: err.toString() 
    });
  });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'register') {
        // Register client with a process ID
        ws.processId = data.processId;
        console.log(`Client registered with process ID: ${data.processId}`);
      }
      else if (data.type === 'input') {
        // Send input to a Python process
        const process = activeProcesses.get(data.processId);
        if (process) {
          process.stdin.write(data.data + '\n');
          console.log(`Input sent to process ${data.processId}: ${data.data}`);
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the IDE`);
});
# Use Python image with Node.js
FROM python:3.9-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up Python scientific libraries all in one layer
RUN pip3 install --no-cache-dir numpy==1.21.6 matplotlib==3.5.3 scikit-learn==1.0.2 pandas==1.3.5 scipy==1.7.3

# Configure matplotlib for non-interactive backend
RUN mkdir -p /root/.config/matplotlib && \
    echo "backend: Agg" > /root/.config/matplotlib/matplotlibrc

# Create app directory
WORKDIR /app

# Copy package.json and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create temp directory for Python scripts
RUN mkdir -p /app/temp && chmod 777 /app/temp

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
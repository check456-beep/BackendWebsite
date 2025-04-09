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

# Create a non-root user to run the application
RUN groupadd -r appuser && useradd -r -g appuser -m appuser

# Create app directory and set permissions
WORKDIR /app
RUN chown -R appuser:appuser /app

# Copy package.json and install Node.js dependencies
COPY --chown=appuser:appuser package*.json ./
RUN npm install

# Bundle app source
COPY --chown=appuser:appuser . .

# Create temp directory for Python scripts with appropriate permissions
RUN mkdir -p /app/temp && chown -R appuser:appuser /app/temp && chmod 700 /app/temp

# Set resource limits for container
ENV NODE_OPTIONS="--max-old-space-size=512" \
    PYTHONUNBUFFERED=1 \
    PYTHONHASHSEED=random

# Add security limits for Python execution
RUN echo "import sys; sys.setrecursionlimit(1000)" > /app/sandbox_config.py

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Start the application with resource limits
CMD ["node", "--max-old-space-size=512", "server.js"]
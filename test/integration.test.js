const { app, server } = require('../server'); // Use the provided server with WebSocket
const request = require('supertest');
const assert = require('assert');
const WebSocket = require('ws');

describe('Integration Tests', function() {
  this.timeout(10000);
  // Start the test server on port 5001.
  before(function(done) {
    server.listen(5001, done);
  });
  
  // Close the test server after tests.
  after(function(done) {
    server.close(done);
  });
  
  // Test that the homepage is served.
  it('should serve the index page on GET /', function(done) {
    request(server)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
  
  // Test tutorial metadata endpoint.
  it('should return tutorial metadata for a valid tutorial id', function(done) {
    request(server)
      .get('/api/tutorials/linear-regression')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.id, 'linear-regression');
        done();
      });
  });
  
  // Test section endpoint.
  it('should return section data for a valid section id', function(done) {
    // Assuming section-3 for linear-regression exists.
    request(server)
      .get('/api/tutorials/section/section-3')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.id, 'section-3');
        done();
      });
  });
  
  // Test that POST /api/execute returns 400 when no code is provided.
  it('should return 400 if no code is provided for execution', function(done) {
    request(server)
      .post('/api/execute')
      .send({})
      .expect(400, done);
  });
  
  // Test that POST /api/execute rejects harmful code.
  it('should return 403 when harmful code patterns are detected', function(done) {
    const harmfulCode = "import os\nos.system('ls')";
    request(server)
      .post('/api/execute')
      .send({ code: harmfulCode })
      .expect(403, done);
  });
  
  // Test that POST /api/execute executes valid Python code.
  it('should execute simple Python code and return expected output', function(done) {
    const validCode = "print('Integration Test')";
    request(server)
      .post('/api/execute')
      .send({ code: validCode })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert(res.body.output.includes("Integration Test"));
        done();
      });
  });
  
  // Test that executing faulty Python code returns an error output.
  it('should return error output for faulty Python code', function(done) {
    const faultyCode = "print('Hello"; // Missing closing quote causes syntax error.
    request(server)
      .post('/api/execute')
      .send({ code: faultyCode })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        // Assuming that the output field will include an error message.
        assert(typeof res.body.output === 'string');
        assert(
          res.body.output.includes('SyntaxError') ||
          res.body.output.toLowerCase().includes('error')
        );
        done();
      });
  });
  
  // Test WebSocket integration.
  it('should register a WebSocket client and receive messages', function(done) {
    this.timeout(5000);
    // Connect to WebSocket on the dedicated '/ws' path.
    const ws = new WebSocket('ws://localhost:5001/ws');
    
    ws.on('open', function() {
      // Register client with a dummy process id.
      ws.send(JSON.stringify({ type: 'register', processId: 'test-ws-id' }));
      // Send dummy input to simulate interaction.
      ws.send(JSON.stringify({ type: 'input', processId: 'test-ws-id', data: 'Hello WS' }));
    });
    
    ws.on('message', function(message) {
      const data = JSON.parse(message);
      if (data.type === 'output' || data.type === 'completed') {
        ws.close();
        done();
      }
    });
    
    ws.on('error', function(err) {
      done(err);
    });
  });

  // Test the error handling middleware by forcing an error in a temporary route.
  it('should trigger error middleware and return 500 error', function(done) {
    // Temporarily add a route that immediately triggers an error.
    app.get('/error-test', (req, res, next) => {
      next(new Error('Forced error'));
    });
    
    request(server)
      .get('/error-test')
      .expect(500)
      .end((err, res) => {
        if (err) return done(err);
        // Verify that the error handler returns the expected JSON response.
        assert.strictEqual(res.body.error, 'Internal Server Error');
        done();
      });
  });

  it('should contain <!DOCTYPE html> in homepage HTML', function(done) {
    request(server)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert(res.text.includes('<!DOCTYPE html>'));
        done();
      });
  });
});
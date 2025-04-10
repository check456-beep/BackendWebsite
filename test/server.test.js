const request = require('supertest');
const http = require('http');
const assert = require('assert');

// Import the server module (ensure your server file exports an Express app).
const { app, server } = require('../server'); // Use the provided server with WebSocket

describe('API Endpoints (Unit Tests)', function() {
  this.timeout(10000); // Increase timeout to 10 seconds

  before(function(done) {
    server.listen(5002, done);
  });
  after(function(done) {
    server.close(done);
  });

  // 1. GET /api/tutorials/:id returns valid tutorial metadata when found.
  it('should return tutorial metadata for a valid tutorial id', function(done) {
    request(server)
      .get('/api/tutorials/linear-regression')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);
        assert.strictEqual(res.body.id, 'linear-regression');
        done();
      });
  });

  // 2. GET /api/tutorials/section/:id returns valid section JSON.
  it('should return section data for a valid section id', function(done) {
    // Assuming section id "section-3" exists for the linear-regression tutorial.
    request(server)
      .get('/api/tutorials/section/section-3')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);
        assert.strictEqual(res.body.id, 'section-3');
        done();
      });
  });

  // 3. POST /api/execute returns 400 when no code is provided.
  it('should return 400 if no code is provided for execution', function(done) {
    request(server)
      .post('/api/execute')
      .send({ })
      .expect(400, done);
  });

  // 4. POST /api/execute returns 403 when harmful code is provided.
  it('should return 403 when harmful code patterns are detected', function(done) {
    request(server)
      .post('/api/execute')
      .send({ code: "import os\nos.system('ls')" })
      .expect(403, done);
  });

  // 5. POST /api/execute executes valid Python code and returns expected output.
  it('should execute simple Python code and return output', function(done) {
    const pythonCode = "print('Hello, Test!')";
    request(server)
      .post('/api/execute')
      .send({ code: pythonCode })
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);
        assert(res.body.output.includes("Hello, Test!"));
        done();
      });
  });
});
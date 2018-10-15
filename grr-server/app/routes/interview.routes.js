
module.exports = function(app) {

    var interviews = require('../controllers/interview.controller.js');
 
    // Create a new interview
    app.post('/api/interviews', interviews.create);

    // Delete an interview with interviewId
    app.delete('/api/interviews/:interviewId', interviews.delete);

    // Retrieve all interviews
    app.get('/api/interviews', interviews.findAll);

    // Retrieve a single interview with interviewId
    app.get('/api/interviews/:interviewId', interviews.findOne);
    
    // Update a interview with interviewId
    app.put('/api/interviews/:interviewId', interviews.update);
    
    // Delete a interview with interviewId
    app.delete('/api/interviews/:interviewId', interviews.delete);

}
const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    incidentId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['Enterprise', 'Government','Individual'],
        required: true
    },
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reporterName: {
        type: String,
        required: true
    },
    incidentDetails: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
    },
    reportedDate: {
        type: Date,
        default: Date.now
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Closed'],
        default: 'Open'
    }
});

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;

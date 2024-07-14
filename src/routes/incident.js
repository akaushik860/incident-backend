const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const Incident = require('../models/incidents');

const router = express.Router();

const generateIncidentId = async () => {
    const currentYear = new Date().getFullYear();
    let incidentId;
    let isUnique = false;

    while (!isUnique) {
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        incidentId = `RMG${randomNum}${currentYear}`;
        const existingIncident = await Incident.findOne({ incidentId });
        if (!existingIncident) {
            isUnique = true;
        }
    }

    return incidentId;
};

// Create Incident Route
router.post('/create', [
    check('type').isIn(['Enterprise', 'Government','Individual']).withMessage('Type must be Enterprise or Government'),
    check('incidentDetails').notEmpty().withMessage('Incident details are required'),
    check('priority').isIn(['High', 'Medium', 'Low']).withMessage('Priority must be High, Medium, or Low'),
    check('status').isIn(['Open', 'In Progress', 'Closed']).withMessage('Status must be Open, In progress, or Closed')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { type, incidentDetails, priority, status } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const incidentId = await generateIncidentId();

        const incident = new Incident({
            incidentId,
            type,
            reporterId: user._id,
            reporterName: `${user.firstname} ${user.lastname}`,
            incidentDetails,
            priority,
            status
        });

        await incident.save();

        res.status(201).json({status:200, message: 'Incident created successfully', incident });
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error ${error}` });
    }
});


// Edit Incident Route
router.put('/edit/:id', [
    check('incidentDetails').optional().notEmpty().withMessage('Incident details are required'),
    check('priority').optional().isIn(['High', 'Medium', 'Low']).withMessage('Priority must be High, Medium, or Low'),
    check('status').optional().isIn(['Open', 'In progress', 'Closed']).withMessage('Status must be Open, In progress, or Closed')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const incidentId = req.params.id;
        const updates = req.body;

        const incident = await Incident.findOneAndUpdate({ incidentId }, updates, { new: true });
        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        res.status(200).json({ message: 'Incident updated successfully', incident });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const incidents = await Incident.find({ incidentId: userId });
        res.status(200).json(incidents);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get Incidents by User ID
router.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const incidents = await Incident.find({ reporterId: userId });
        res.status(200).json(incidents);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

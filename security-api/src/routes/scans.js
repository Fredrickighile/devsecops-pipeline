const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const mongoose = require('mongoose');

router.post('/', async (req, res, next) => {
  try {
    const scan = new Scan(req.body);
    scan.calculateMetrics();
    await scan.save();
    res.status(201).json({ message: 'Scan created', scanId: scan.scanId, metrics: scan.metrics });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Scan already exists' });
    }
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const scans = await Scan.find({ status: 'completed' }).sort({ timestamp: -1 }).skip(skip).limit(limit);
    const total = await Scan.countDocuments({ status: 'completed' });
    res.json({ scans, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

router.get('/latest', async (req, res, next) => {
  try {
    const scan = await Scan.findOne({ status: 'completed' }).sort({ timestamp: -1 });
    if (!scan) return res.status(404).json({ error: 'No scans found' });
    res.json(scan);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const scans = await Scan.find({ status: 'completed' }).sort({ timestamp: -1 }).limit(10);
    const stats = scans.reduce((acc, scan) => {
      acc.critical += scan.metrics.critical;
      acc.high += scan.metrics.high;
      acc.medium += scan.metrics.medium;
      acc.low += scan.metrics.low;
      acc.total += scan.metrics.total;
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0, total: 0 });
    res.json({ stats, recentScans: scans });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    let query;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      query = { $or: [{ _id: req.params.id }, { scanId: req.params.id }] };
    } else {
      query = { scanId: req.params.id };
    }
    
    const scan = await Scan.findOne(query);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json(scan);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    let query;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      query = { $or: [{ _id: req.params.id }, { scanId: req.params.id }] };
    } else {
      query = { scanId: req.params.id };
    }
    
    const scan = await Scan.findOneAndUpdate(query, req.body, { new: true });
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json({ message: 'Scan updated', scan });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

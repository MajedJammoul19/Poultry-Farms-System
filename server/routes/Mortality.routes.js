const express = require('express');
const router = express.Router();
const MortalityRecord = require('../models/MortalityRecord');
const MortalityAlert = require('../models/MortalityAlert');
const { authMiddleware } = require('../middleware/authMiddleware'); // adjust path to match your project
const { MORTALITY_THRESHOLD_PERCENT } = require('../config/alertConfig');

// POST /api/mortality
// Record daily mortality (Vet-06). Also automatically checks the threshold
// and creates an alert for the vet if it's exceeded (Vet-09).
router.post('/', authMiddleware, async (req, res) => {
  try {
    // inline role check - no extra middleware file, just match your real role strings
    if (!['vet'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح لك بالوصول لهذه الصفحة',
      });
    }

    const { batchId, date, totalBirds, deadCount } = req.body;

    if (totalBirds == null || deadCount == null) {
      return res
        .status(400)
        .json({ success: false, message: 'totalBirds and deadCount are required' });
    }

    // calculated here directly, no pre-save hook involved
    const mortalityRate = (Number(deadCount) / Number(totalBirds)) * 100;

    const record = new MortalityRecord({
      batchId,
      date,
      totalBirds,
      deadCount,
      mortalityRate,
      recordedBy: req.userId, // set by authMiddleware
    });

    await record.save();

    // Automatic threshold check - no manual trigger needed
    if (mortalityRate > MORTALITY_THRESHOLD_PERCENT) {
      await MortalityAlert.create({
        type: 'mortality_threshold',
        targetRole: 'vet',
        relatedRecordId: record._id,
        message: `تنبيه: نسبة النفوق لليوم ${mortalityRate.toFixed(
          2
        )}% تجاوزت الحد المسموح (${MORTALITY_THRESHOLD_PERCENT}%) للدفعة ${batchId}.`,
      });
    }

    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/mortality - list records (for history/reporting)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const records = await MortalityRecord.find().sort({ date: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PUT /api/mortality/:id - update an existing record (Vet-08)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!['vet'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح لك بالوصول لهذه الصفحة',
      });
    }

    const { batchId, date, totalBirds, deadCount } = req.body;

    if (totalBirds == null || deadCount == null) {
      return res
        .status(400)
        .json({ success: false, message: 'totalBirds and deadCount are required' });
    }

    const mortalityRate = (Number(deadCount) / Number(totalBirds)) * 100;

    const record = await MortalityRecord.findByIdAndUpdate(
      req.params.id,
      { batchId, date, totalBirds, deadCount, mortalityRate },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Same automatic threshold check as creation (Vet-09) - an edit that
    // pushes the rate above the threshold should also raise an alert.
    if (mortalityRate > MORTALITY_THRESHOLD_PERCENT) {
      await MortalityAlert.create({
        type: 'mortality_threshold',
        targetRole: 'vet',
        relatedRecordId: record._id,
        message: `تنبيه: نسبة النفوق لليوم ${mortalityRate.toFixed(
          2
        )}% تجاوزت الحد المسموح (${MORTALITY_THRESHOLD_PERCENT}%) للدفعة ${batchId} (بعد التعديل).`,
      });
    }

    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// DELETE /api/mortality/:id - delete a record (Vet-08)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!['vet'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح لك بالوصول لهذه الصفحة',
      });
    }

    const record = await MortalityRecord.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.json({ success: true, message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
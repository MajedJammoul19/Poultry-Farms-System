const Task = require('../models/Task');

// POST /api/tasks - add a new mission to the list
exports.createTask = async (req, res) => {
  try {
    const { title, date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'عنوان المهمة مطلوب' });
    }

    const task = await Task.create({
      title: title.trim(),
      date: date ? new Date(date) : new Date(),
      createdBy: req.userId,
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tasks?date=YYYY-MM-DD - list the employee's own missions for one day
// (defaults to today if no date is passed)
exports.getMyTasks = async (req, res) => {
  try {
    const { date } = req.query;
    const base = date ? new Date(date) : new Date();

    const startOfDay = new Date(base);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(base);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      createdBy: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/tasks/:id - rename a mission and/or toggle it complete
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, isCompleted } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;

    // scoped to createdBy so an employee can only touch their own tasks
    const task = await Task.findOneAndUpdate(
      { _id: id, createdBy: req.userId },
      updates,
      { new: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'المهمة غير موجودة' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, createdBy: req.userId });
    if (!task) return res.status(404).json({ success: false, message: 'المهمة غير موجودة' });

    res.json({ success: true, message: 'تم حذف المهمة' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
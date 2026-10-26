// middleware/validateOrder.js
export const validateOrder = (req, res, next) => {
  const errors = {};
  const { name, email, foodType, quantity } = req.body;

  if (!name) errors.name = 'الاسم مطلوب';
  if (!email) errors.email = 'البريد الإلكتروني مطلوب';
  if (!foodType) errors.foodType = 'نوع الطعام مطلوب';
  if (!quantity) errors.quantity = 'الكمية مطلوبة';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};
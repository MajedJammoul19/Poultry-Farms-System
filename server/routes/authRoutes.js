const express = require('express');
const router = express.Router();
// _________________________________________________________________________________________________
const chatController = require('../controllers/Chatcontroller');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const fuelOrderController=  require('../controllers/fuelOrderController');
const foodOrderController=require("../controllers/foodOrderController");
const sanitationReportController= require('../controllers/sanitationReportController');
const preventionPlanController=  require('../controllers/preventionPlanController');
const medicalExaminationController = require('../controllers/medicalExaminationController');
const pricingController = require('../controllers/pricingController');
const managerRecommendationController = require('../controllers/managerRecommendationController');
const feedingPlanController = require('../controllers/feedingPlanController');
const packingOperationController = require('../controllers/packingOperationController');
const foodConsumptionController = require('../controllers/foodConsumptionController');
const FuelConsumptionController= require('../controllers/FuelConsumptionController')
const medicalRequestController = require('../controllers/medicalRequestController');
const alertsController   = require('../controllers/alertsController');
const reportsController  = require('../controllers/reportsController');
const systemSettingsController = require('../controllers/systemSettingsController');
const taskController = require('../controllers/taskController');
// API
router.post('/api/auth/signup', authController.signup);
router.post('/api/auth/login', authController.login);
router.get('/api/auth/me', authMiddleware.authMiddleware, authController.getMe);
router.put('/api/auth/profile', authMiddleware.authMiddleware, authController.updateProfile);
router.put('/api/auth/users/:id/reset-password', authMiddleware.authMiddleware, authController.resetUserPasswordByAdmin);router.get('/api/auth/availability', authMiddleware.authMiddleware, authController.getAvailability);
router.put('/api/auth/availability', authMiddleware.authMiddleware, authController.updateAvailability);
router.get('/api/auth/fuel-suppliers-availability', authMiddleware.authMiddleware, authController.getFuelSuppliersAvailability);
router.get('/api/auth/recent-logins', authMiddleware.authMiddleware, authMiddleware.checkPermission('all'), authController.getRecentLogins);
router.get('/api/auth/users',         authMiddleware.authMiddleware, authController.getAllUsers);
router.put('/api/auth/users/:id',     authMiddleware.authMiddleware, authController.updateUserByAdmin);
router.delete('/api/auth/users/:id',  authMiddleware.authMiddleware, authController.deleteUserByAdmin);
router.get('/api/alerts', authMiddleware.authMiddleware, alertsController.getAlerts);
router.get('/api/system-settings', authMiddleware.authMiddleware, systemSettingsController.getSettings);
router.put('/api/system-settings', authMiddleware.authMiddleware, systemSettingsController.updateSettings);
router.get('/api/reports/quick', authMiddleware.authMiddleware, reportsController.getQuickReport);

router.post('/api/sanitation-reports', sanitationReportController.createReport);
router.get('/api/sanitation-reports', sanitationReportController.getAllReports);
router.put('/api/sanitation-reports/:id', sanitationReportController.updateReport);
router.delete('/api/sanitation-reports/:id', sanitationReportController.deleteReport);

router.post('/api/orders', foodOrderController.createOrder);
router.get('/api/orders', foodOrderController.getAllOrders);
router.post('/api/fuel-orders', authMiddleware.authMiddleware, fuelOrderController.createFuelOrder);
router.get('/api/fuel-orders', fuelOrderController.getAllFuelOrders);
router.get('/api/fuel-orders/invoices', authMiddleware.authMiddleware, fuelOrderController.getInvoices);
router.put('/api/fuel-orders/:id', fuelOrderController.updateFuelOrder);
router.delete('/api/fuel-orders/:id', fuelOrderController.deleteFuelOrder);

router.post('/api/prevention-plans',preventionPlanController.createPreventionPlan)
router.get('/api/prevention-plans',preventionPlanController.getPreventionPlans)
router.put('/api/prevention-plans/:id', preventionPlanController.updatePreventionPlan);
router.delete('/api/prevention-plans/:id',preventionPlanController.deletePreventionPlan)
router.post('/api/medical-examinations',medicalExaminationController.createExamination);
router.get('/api/medical-examinations', medicalExaminationController.getExaminations);
router.delete('/api/medical-examinations/:id',medicalExaminationController.deleteExamination)
router.put('/api/medical-examinations/:id',medicalExaminationController.updateExamination)
router.post('/api/prices', pricingController.createPrice);
router.get('/api/prices', pricingController.getAllPrices);
router.delete('/api/prices/:id', pricingController.deletePrice);
router.put('/api/prices/:id', pricingController.updatePrice);
router.post('/api/manager-recommendations', managerRecommendationController.createRecommendation);
router.post('/api/feeding-plans', feedingPlanController.createFeedingPlan);
router.get('/api/feeding-plans', feedingPlanController.getAllFeedingPlans)
router.post('/api/packing-operations', packingOperationController.createPackingOperation);
router.get('/api/packing-operations', packingOperationController.getAllOperations)
router.post('/api/food-consumption', foodConsumptionController.createConsumption);
router.get('/api/food-consumption', foodConsumptionController.getAllConsumptions);


router.post('/api/fuel-consumption', FuelConsumptionController.createConsumption);

router.get('/api/fuel-consumption', FuelConsumptionController.getAllConsumptions);
router.get('/api/fuel-consumption/:id', FuelConsumptionController.getConsumptionById);
router.put('/api/fuel-consumption/:id', FuelConsumptionController.updateConsumption);

router.delete('/api/fuel-consumption/:id', FuelConsumptionController.deleteConsumption);


router.post('/api/medical-requests', medicalRequestController.createMedicalRequest);
router.get('/api/medical-requests', medicalRequestController.getAllMedicalRequests);

router.post('/api/tasks', authMiddleware.authMiddleware, taskController.createTask);
router.get('/api/tasks', authMiddleware.authMiddleware, taskController.getMyTasks);
router.put('/api/tasks/:id', authMiddleware.authMiddleware, taskController.updateTask);
router.delete('/api/tasks/:id', authMiddleware.authMiddleware, taskController.deleteTask);
router.post('/api/chat', authMiddleware.authMiddleware, chatController.chat);
module.exports = router;

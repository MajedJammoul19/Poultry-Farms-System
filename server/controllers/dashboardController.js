// controllers/dashboardController.js
const DashboardData = require('../models/DashboardData');

// @desc    Data retrieval (always 4 cards)
const getDashboardData = async (req, res) => {
  try {
    const data = await DashboardData.find();
    
    // If there is no data, we return 4 virtual cards.
    if (data.length === 0) {
      const defaultData = [
        { title: 'إجمالي الدواجن', value: '0', change: '0%', icon: 'pets', color: 'bg-blue-100 text-blue-800' },
        { title: 'الإنتاج اليومي', value: '0 كغ', change: '0%', icon: 'show_chart', color: 'bg-green-100 text-green-800' },
        { title: 'المواد الغذائية', value: '0%', change: '0%', icon: 'local_dining', color: 'bg-yellow-100 text-yellow-800' },
        { title: 'الوقود المتاح', value: '0%', change: '0%', icon: 'local_gas_station', color: 'bg-red-100 text-red-800' }
      ];
      
      // Save default data
      await DashboardData.insertMany(defaultData); 
      return res.status(200).json({
        success: true,
        data: defaultData
      });
    }
    
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// _________________________________________________________________________

// @desc    Updating specific card data
const updateDashboardData = async (req, res) => {
  try {
    const { title } = req.params;
    const { value, change } = req.body;
    
    console.log('🔍 البحث عن عنوان:', title); 
    
    // جرب البحث بدون تشكيل ومسافات
    const updatedData = await DashboardData.findOne({
      title: { $regex: new RegExp(title.trim(), 'i') }  // Insensitive to Alphabet's case 
    });
    
    if (!updatedData) {
      // Try searching through all available titles
      const allData = await DashboardData.find();
      console.log('📋 العناوين الموجودة:', allData.map(d => d.title));
      
      return res.status(404).json({
        success: false,
        message: 'الكارد غير موجود',
        availableTitles: allData.map(d => d.title)  // Send available addresses
      });
    }
    
    // update data
    updatedData.value = value;
    updatedData.change = change;
    updatedData.lastUpdated = Date.now();
    await updatedData.save();
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      data: updatedData
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboardData,
  updateDashboardData
};
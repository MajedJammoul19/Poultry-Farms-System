const mongoose = require('mongoose');

// 1. الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/testDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ اتصلت بقاعدة البيانات بنجاح'))
.catch(err => console.error('❌ خطأ في الاتصال:', err));

// 2. تعريف نموذج المستخدم
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['admin', 'employee', 'vet', 'food_supplier', 'fuel_supplier'],
    default: 'employee'
  }
});

const User = mongoose.model('User', userSchema);

// 3. دالة لاختبار إضافة مستخدم
async function testAddUser() {
  try {
    // 4. إنشاء مستخدم جديد
    const newUser = await User.create({
      name: "أحمد أحمد",
      email: "ahmed@test.com",
      password: "123456",
      role: "vet"
    });

    console.log('✅ تم إضافة المستخدم:', newUser);

    // 5. البحث عن المستخدم للتأكد
    const foundUser = await User.findOne({ email: "ahmed@test.com" });
    console.log('🔍 المستخدم الموجود:', foundUser);

  } catch (err) {
    console.error('❌ حدث خطأ:', err.message);
  } finally {
    // 6. إغلاق الاتصال
    mongoose.connection.close();
  }
}

// 7. تشغيل الاختبار
testAddUser();
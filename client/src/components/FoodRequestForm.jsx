import React, { useState } from 'react';
import { createOrder } from '../api/auth';

const FoodRequestForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    quantity: '',
    foodType: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
   
    try {
      await createOrder({
        name: formData.name,
        email: formData.email,
        foodType: formData.foodType,
        quantity: formData.quantity,
        notes: formData.notes
      });

      // إضافة السجل الجديد فقط عند الإرسال الناجح
      const existingReports = JSON.parse(localStorage.getItem('nutritionReports')) || [];
      const newReport = {
        foodType: formData.foodType,
        quantity: `${formData.quantity} كجم`
      };
      
      localStorage.setItem('nutritionReports', JSON.stringify([...existingReports, newReport]));
      
      alert("تم إرسال الطلب بنجاح");

    } catch {
      console.log("حدث خطأ");
    }
  };

  return (
    
    <div className="max-w-md mx-auto mt-10 p-5 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold text-center mb-5">طلب مواد غذائية</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="name">الاسم:</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="email">البريد الإلكتروني:</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="foodType">نوع الطعام:</label>
          <select
            name="foodType"
            id="foodType"
            value={formData.foodType}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          >
            <option value="">اختر نوع الطعام</option>
            <option value="علف للدواجن">علف الدواجن</option>
            <option value="حبوب">حبوب</option>
            <option value="مكملات غذائية">مكملات غذائية</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="quantity">الكمية:</label>
          <input
            type="number"
            name="quantity"
            id="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="remarks">ملاحظات:</label>
          <textarea
            name="remarks"
            id="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          إرسال الطلب
        </button>
      </form>
    </div>
  );
};

export default FoodRequestForm;
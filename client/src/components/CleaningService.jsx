import React, { useState } from 'react';
import {createSanitationReport} from '../api/auth'
const PoultryFarmReportForm = () => {
  const [formData, setFormData] = useState({
    facilityName: '',
    location: '',
    cleanlinessRating: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
        e.preventDefault();
       try {
               await createSanitationReport({
                facilityName: formData.facilityName,
                location: formData.location,
                cleanlinessRating: formData.cleanlinessRating,
                notes: formData.notes,
                
              });
           
              alert("mission done") 
              
            } 
            catch {
              console.log("error")
            }
         //   window.location.reload();
      };
  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">تقرير عن النظافة</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="facilityName">
            اسم المنشأة
          </label>
          <input
            type="text"
            id="facilityName"
            name="facilityName"
            value={formData.facilityName}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="location">
            الموقع
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="cleanlinessRating">
            تقييم النظافة (من 1 إلى 5)
          </label>
          <select
            id="cleanlinessRating"
            name="cleanlinessRating"
            value={formData.cleanlinessRating}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">اختر التقييم</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="comments">
            ملاحظات إضافية
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600" onClick={handleSubmit}>
          إرسال التقرير
        </button>
      </form>
    </div>
  );
};

export default PoultryFarmReportForm;

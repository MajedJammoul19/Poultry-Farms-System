import React, { useState } from 'react';
import {createPreventionPlan} from '../api/auth'
const PoultryHealthPlanForm = () => {
  const [formData, setFormData] = useState({
    facilityName: '',
    location: '',
    date: '',
    preventionPlan: '',
    recommendations: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

   const handleSubmit = async (e) => {
      e.preventDefault();
     try {
             await createPreventionPlan({
              facilityName: formData.facilityName,
              location: formData.location,
              date: formData.date,
              preventionPlan: formData.preventionPlan,
              recommendations: formData.recommendations
            });
         
            alert("mission done") 
            
          } 
          catch {
            console.log("eror")
              }
         window.location.reload();
    };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">خطة الوقاية للدواجن</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="facilityName">اسم المنشأة:</label>
          <input
            type="text"
            id="facilityName"
            name="facilityName"
            value={formData.facilityName}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="location">الموقع:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="date">التاريخ:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="preventionPlan">إجراءات الوقاية:</label>
          <textarea
            id="preventionPlan"
            name="preventionPlan"
            value={formData.preventionPlan}
            onChange={handleChange}
            required
            rows="4"
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="recommendations">توصيات الطبيب البيطري:</label>
          <textarea
            id="recommendations"
            name="recommendations"
            value={formData.recommendations}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
       onClick={handleSubmit} >
          إرسال
        </button>
      </form>
    </div>
  );
};

export default PoultryHealthPlanForm;

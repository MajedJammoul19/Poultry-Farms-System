import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/use-auth';

const Pricing = () => {
  const { user } = useAuth();
  const supplierId = user?._id || user?.id || null;
  const [priceOffers, setPriceOffers] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product: 'دجاج حي',
    type: '',
    weight: '',
    pricePerKg: '',
    minOrder: '',
    date: new Date().toISOString().split('T')[0],
    available: true
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/prices');
      setPriceOffers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (formData._id) {
      await axios.put(
        `http://localhost:5000/api/prices/${formData._id}`,
        { ...formData, supplierId }
      );
    } else {
      await axios.post(
        'http://localhost:5000/api/prices',
        { ...formData, supplierId }
      );
    }

    fetchPrices();
    setShowForm(false);

    // إعادة تعيين الفورم
    setFormData({
      product: 'دجاج حي',
      type: '',
      weight: '',
      pricePerKg: '',
      minOrder: '',
      date: new Date().toISOString().split('T')[0],
      available: true
    });

  } catch (err) {
    console.error(err);
  }
};

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/prices/${id}`);
      fetchPrices();
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-800">عروض أسعار الدجاج والبيض</h1>
      
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-700">قائمة العروض الحالية</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? 'إخفاء النموذج' : 'إضافة عرض جديد'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4 text-right">نموذج إضافة عرض جديد</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">نوع المنتج</label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-right"
                  required
                >
                  <option value="دجاج حي">دجاج حي</option>
                  <option value="بيض مائدة">بيض مائدة</option>
                  <option value="بيض تفقيس">بيض تفقيس</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">النوع/السلالة</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-right"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الوزن/الحجم</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-right"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">السعر للكيلو/الكرتون (ر.س)</label>
                <input
                  type="number"
                  name="pricePerKg"
                  value={formData.pricePerKg}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-right"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الحد الأدنى للطلب</label>
                <input
                  type="number"
                  name="minOrder"
                  value={formData.minOrder}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-right"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">تاريخ العرض</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-right"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ml-2"
                />
                <label className="block text-sm font-medium text-gray-700">متوفر حالياً</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                حفظ العرض
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المواصفات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحد الأدنى</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ العرض</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {priceOffers.map((offer) => (
              <tr key={offer._id} className={offer.available ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{offer.product}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{offer.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{offer.weight}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{offer.pricePerKg} ر.س</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{offer.minOrder} {offer.product.includes('بيض') ? 'كرتون' : 'كجم'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{offer.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offer.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {offer.available ? 'متوفر' : 'غير متوفر'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                  <button onClick={() => {
                     setFormData(offer);
                      setShowForm(true);}}
  className="text-green-600 hover:text-green-900 mr-3">
  تعديل
</button>
                  <button onClick={() => handleDelete(offer._id)} className="text-red-600 hover:text-red-900">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mr-3">
            <p className="text-sm text-yellow-700 text-right">
              ملاحظة: الأسعار قابلة للتغيير حسب السوق وكمية الطلب. للطلبات الكبيرة يرجى الاتصال بنا للتفاوض على السعر.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

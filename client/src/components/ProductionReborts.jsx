import React from 'react';

const ProductionReborts = () => {
  const data = [
    { date: '2025-10-01', eggsProduced:1500, feedUsed: '200kg' },
    { date: '2025-10-02', eggsProduced:1600, feedUsed: '210kg' },
    { date: '2025-10-04', eggsProduced: 1550, feedUsed: '205kg' },
    { date: '2025-11-06', eggsProduced: 1550, feedUsed: '205kg' },
    { date: '2025-11-03', eggsProduced: 1550, feedUsed: '205kg' },
    { date: '2025-12-05', eggsProduced: 1550, feedUsed: '205kg' },
    { date: '2025-12-08', eggsProduced: 1550, feedUsed: '205kg' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">تقرير إنتاج الدواجن</h1>
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">التاريخ</th>
            <th className="py-2 px-4 border-b">عدد البيض المنتج</th>
            <th className="py-2 px-4 border-b">كمية العلف المستخدمة</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{item.date}</td>
              <td className="py-2 px-4 border-b">{item.eggsProduced}</td>
              <td className="py-2 px-4 border-b">{item.feedUsed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductionReborts;

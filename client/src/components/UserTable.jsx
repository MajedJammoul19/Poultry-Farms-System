import React, { useState } from 'react';

const EmployeeTable = () => {
   const [employees] = useState([
      { id: 1, name: 'أحمد محمد', position: 'مطور برمجيات' },
      { id: 2, name: 'سارة علي', position: 'مصممة واجهة مستخدم' },
      { id: 3, name: 'علي حسن', position: 'مدير مشروع' },
    ]);

 const handleSubmit = (e) => {
    e.preventDefault();
    alert('تم قبول الموظف  !');
    
  };
    const rejectEmployee = (e) => {
         e.preventDefault();
    alert('تم رفض الموظف  !');
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">إدارة المستخدمين</h1>
            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2">الرقم</th>
                        <th className="border px-4 py-2">الاسم</th>
                        <th className="border px-4 py-2">الوظيفة</th>
                        <th className="border px-4 py-2">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{employee.id}</td>
                            <td className="border px-4 py-2">{employee.name}</td>
                            <td className="border px-4 py-2">{employee.position}</td>
                            <td className="border px-4 py-2">
                                <button onClick={handleSubmit} className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 mr-1">
                                    قبول
                                </button>
                                <button onClick={rejectEmployee} className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">
                                    رفض
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeTable;

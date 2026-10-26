import React, { useState } from 'react';


const EmployeeForm = ({ onAddEmployee, onClose, employeeToEdit, onEdit }) => {
  const [name, setName] = useState(employeeToEdit ? employeeToEdit.name : '');
  const [position, setPosition] = useState(employeeToEdit ? employeeToEdit.position : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (employeeToEdit) {
      onEdit({ id: employeeToEdit.id, name, position });
    } else {
      onAddEmployee({ name, position });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        placeholder="الاسم"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="border p-2 mr-2"
      />
      <input
        type="text"
        placeholder="الوظيفة"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        required
        className="border p-2 mr-2"
      />
      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        {employeeToEdit ? 'تعديل' : 'إضافة'}
      </button>
      <button type="button" onClick={onClose} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 ml-2">
        إغلاق
      </button>
    </form>
  );
};
export default EmployeeForm;

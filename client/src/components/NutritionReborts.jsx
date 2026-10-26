import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const NutritionReport = () => {
  const reports = JSON.parse(localStorage.getItem('nutritionReports')) || [];

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.text('daily nutrition reports', 14, 15);

    const tableColumn = ['food type ', 'quantity'];
    const tableRows = [];

    reports.forEach((report) => {
      const rowData = [
        report.foodType,
        report.quantity,
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('nutrition-report.pdf');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-right">
          تقارير التغذية اليومية
        </h1>

        <button
          onClick={exportToPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          تصدير PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border-b text-right font-semibold text-gray-700">
                نوع العلف
              </th>
              <th className="py-3 px-4 border-b text-right font-semibold text-gray-700">
                الكمية
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="py-3 px-4 border-b text-right text-gray-800">
                  {report.foodType}
                </td>
                <td className="py-3 px-4 border-b text-right text-gray-800">
                  {report.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NutritionReport;

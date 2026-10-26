import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Form to record daily mortality (Vet-06), plus a table of all existing
// records with edit/delete (Vet-08). The same form is reused for both
// adding a new record and editing an existing one.
const RecordMortality = () => {
  const emptyForm = { batchId: '', totalBirds: '', deadCount: '' };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = creating, otherwise editing this record's id
  const [message, setMessage] = useState('');

  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState('');

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchRecords = async () => {
    try {
      setLoadingRecords(true);
      const res = await axios.get('/api/mortality', authHeader);
      setRecords(res.data.records || []);
    } catch (err) {
      console.error(err.response?.data);
      setRecordsError('حدث خطأ أثناء جلب السجلات');
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // update existing record
        const res = await axios.put(`/api/mortality/${editingId}`, form, authHeader);
        const rate = res.data.record.mortalityRate.toFixed(2);
        setMessage(`تم التحديث بنجاح. نسبة النفوق: ${rate}%`);
      } else {
        // create new record
        const res = await axios.post('/api/mortality', form, authHeader);
        const rate = res.data.record.mortalityRate.toFixed(2);
        setMessage(`تم الحفظ بنجاح. نسبة النفوق: ${rate}%`);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchRecords(); // refresh the table either way
    } catch (err) {
      console.error(err.response?.data);
      setMessage(editingId ? 'حدث خطأ أثناء التحديث' : 'حدث خطأ أثناء حفظ السجل');
    }
  };

  const startEdit = (record) => {
    setEditingId(record._id);
    setForm({
      batchId: record.batchId,
      totalBirds: record.totalBirds,
      deadCount: record.deadCount,
    });
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    try {
      await axios.delete(`/api/mortality/${id}`, authHeader);
      setRecords((prev) => prev.filter((r) => r._id !== id));
      if (editingId === id) cancelEdit(); // if you were editing the row you just deleted
    } catch (err) {
      console.error(err.response?.data);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  // jsPDF's built-in fonts don't support Arabic glyphs, so the PDF uses
  // English labels/content even though the on-screen table stays in Arabic.
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Mortality Records Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 21);

    const tableRows = records.map((r) => [
      new Date(r.date).toLocaleDateString('en-GB'),
      r.batchId,
      r.totalBirds,
      r.deadCount,
      `${r.mortalityRate?.toFixed(2)}%`,
    ]);

    autoTable(doc, {
      startY: 26,
      head: [['Date', 'Batch ID', 'Total Birds', 'Dead Count', 'Mortality Rate']],
      body: tableRows,
      headStyles: { fillColor: [55, 65, 81] }, // matches the gray-700 header on screen
      didParseCell: (data) => {
        // highlight rows above the threshold, same as the red text on screen
        if (data.section === 'body' && data.column.index === 4) {
          const rate = parseFloat(data.cell.raw);
          if (rate > 5) {
            data.cell.styles.textColor = [220, 38, 38]; // red-600
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    doc.save(`mortality-records-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const inputClass =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <div className="space-y-6">
      {/* form - used for both create and edit */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-4 max-w-md space-y-3"
      >
        <h3 className="text-lg font-semibold text-gray-800">
          {editingId ? 'تعديل سجل النفوق' : 'تسجيل النفوق اليومي'}
        </h3>

        <input
          name="batchId"
          placeholder="رقم الدفعة (Batch)"
          value={form.batchId}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <input
          name="totalBirds"
          type="number"
          placeholder="إجمالي عدد الطيور"
          value={form.totalBirds}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <input
          name="deadCount"
          type="number"
          placeholder="عدد النافق اليوم"
          value={form.deadCount}
          onChange={handleChange}
          required
          className={inputClass}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md py-2 transition-colors"
          >
            {editingId ? 'تحديث' : 'حفظ'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md py-2 transition-colors"
            >
              إلغاء
            </button>
          )}
        </div>

        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>

      {/* records table */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            سجلات النفوق
          </h3>
          <button
            onClick={handleExportPDF}
            disabled={records.length === 0}
            className="text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded px-3 py-1.5 transition-colors"
          >
            تصدير PDF
          </button>
        </div>

        {loadingRecords ? (
          <p className="text-gray-500 text-sm">...جاري تحميل السجلات</p>
        ) : recordsError ? (
          <p className="text-red-600 text-sm">{recordsError}</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500 text-sm">لا يوجد سجلات حالياً</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-3 py-2 border-b">التاريخ</th>
                  <th className="px-3 py-2 border-b">رقم الدفعة</th>
                  <th className="px-3 py-2 border-b">إجمالي الطيور</th>
                  <th className="px-3 py-2 border-b">عدد النافق</th>
                  <th className="px-3 py-2 border-b">نسبة النفوق</th>
                  <th className="px-3 py-2 border-b">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border-b">
                      {new Date(r.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-3 py-2 border-b">{r.batchId}</td>
                    <td className="px-3 py-2 border-b">{r.totalBirds}</td>
                    <td className="px-3 py-2 border-b">{r.deadCount}</td>
                    <td
                      className={`px-3 py-2 border-b font-medium ${
                        r.mortalityRate > 5 ? 'text-red-600' : 'text-gray-800'
                      }`}
                    >
                      {r.mortalityRate?.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(r)}
                          className="text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded px-2 py-1 transition-colors"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded px-2 py-1 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordMortality;
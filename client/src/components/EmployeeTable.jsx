import React, { useState, useEffect, useContext } from 'react';
import { Search, Edit2, Trash2, X, RefreshCw, Key } from 'lucide-react';
import { AuthContext } from '../context/auth-context';
import { getAllUsers, updateUserByAdmin, deleteUserByAdmin, resetUserPasswordByAdmin } from '../api/auth';

const ROLE_LABELS = {
  admin:         { label: 'أدمن النظام',       bg: 'bg-slate-200 text-slate-800' },
  manager:       { label: 'مدير المنشأة',      bg: 'bg-indigo-100 text-indigo-800' },
  employee:      { label: 'موظف',              bg: 'bg-sky-100 text-sky-800' },
  vet:           { label: 'طبيب بيطري',        bg: 'bg-teal-100 text-teal-800' },
  food_supplier: { label: 'تاجر مواد غذائية',  bg: 'bg-orange-100 text-orange-800' },
  fuel_supplier: { label: 'تاجر وقود',         bg: 'bg-stone-200 text-stone-700' },
};

const AVATAR_GRADIENTS = [
  'from-blue-400 to-indigo-500',
  'from-green-400 to-emerald-500',
  'from-orange-400 to-amber-500',
  'from-purple-400 to-violet-500',
  'from-pink-400 to-rose-500',
  'from-teal-400 to-cyan-500',
];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const EmployeeTable = () => {
  const { user: currentUser } = useContext(AuthContext);

  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [query, setQuery]           = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [editRole, setEditRole]     = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');

  const [resetTarget, setResetTarget]     = useState(null);
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting]         = useState(false);
  const [resetError, setResetError]       = useState('');
  const [resetSuccess, setResetSuccess]   = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllUsers();
      if (res.success) setEmployees(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const openEdit = (emp) => {
    setEditTarget(emp);
    setEditRole(emp.role);
    setEditActive(emp.isActive !== false);
    setSaveError('');
  };
  const closeEdit = () => { setEditTarget(null); setSaveError(''); };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const res = await updateUserByAdmin(editTarget.id, { role: editRole, isActive: editActive });
      if (res.success) {
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === editTarget.id ? { ...emp, role: editRole, isActive: editActive } : emp
          )
        );
        closeEdit();
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openReset = (emp) => {
    setResetTarget(emp);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess('');
  };
  const closeReset = () => {
    setResetTarget(null);
    setResetError('');
    setResetSuccess('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 6) {
      setResetError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('كلمتا المرور غير متطابقتين');
      return;
    }

    setResetting(true);
    try {
      await resetUserPasswordByAdmin(resetTarget.id, newPassword);
      setResetSuccess('تم إعادة تعيين كلمة المرور بنجاح');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${emp.name}"؟`)) return;
    try {
      await deleteUserByAdmin(emp.id);
      setEmployees(prev => prev.filter(e => e.id !== emp.id));
    } catch (err) {
      alert(err.message);
    }
  };

  const isMe = (emp) =>
    currentUser &&
    (String(currentUser.id) === String(emp.id) || String(currentUser._id) === String(emp.id));

  const filtered = employees.filter(emp => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (emp.name  || '').toLowerCase().includes(q) ||
      (emp.email || '').toLowerCase().includes(q) ||
      (ROLE_LABELS[emp.role]?.label || '').includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-4" dir="rtl">

      {/* Header */}
      <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-5 border border-white/50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">الموظفين</h1>
            <p className="text-sm text-gray-600 mt-1">
              {loading
                ? 'جارٍ التحميل...'
                : `${employees.length} مستخدم مسجّل في النظام`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500 pointer-events-none"
                size={16}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الدور أو البريد"
                className="pr-10 pl-3 py-2 rounded-xl border border-gray-300 bg-white/70
                           text-gray-800 placeholder-gray-500
                           text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent w-64"
              />
            </div>
            <button
              onClick={loadUsers}
              disabled={loading}
              title="تحديث القائمة"
              className="p-2 rounded-xl border border-gray-300 bg-white/70
                         text-gray-600 hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="text-4xl animate-bounce">👤</div>
            <p className="text-gray-600 text-sm">جارٍ تحميل قائمة المستخدمين...</p>
          </div>

        ) : error ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-red-600">{error}</p>
            <button onClick={loadUsers} className="mt-3 text-sm text-blue-600 hover:underline">
              إعادة المحاولة
            </button>
          </div>

        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <div className="text-3xl mb-2">🔍</div>
            <p>{query ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد مستخدمون مسجّلون بعد'}</p>
          </div>

        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-white/50 border-b-2 border-gray-300">
                  <th className="py-3.5 px-5 text-right text-sm font-bold text-gray-700">المستخدم</th>
                  <th className="py-3.5 px-5 text-right text-sm font-bold text-gray-700">الدور</th>
                  <th className="py-3.5 px-5 text-right text-sm font-bold text-gray-700">الحالة</th>
                  <th className="py-3.5 px-5 text-right text-sm font-bold text-gray-700">آخر دخول</th>
                  <th className="py-3.5 px-5 text-right text-sm font-bold text-gray-700">تاريخ التسجيل</th>
                  <th className="py-3.5 px-5 text-right text-sm font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, idx) => {
                  const me       = isMe(emp);
                  const roleInfo = ROLE_LABELS[emp.role] || { label: emp.role, bg: 'bg-gray-200 text-gray-700' };
                  const grad     = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                  const initials = emp.name
                    ? emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')
                    : 'م';

                  return (
                    <tr key={emp.id}
                        className="border-b border-gray-200 hover:bg-white/60 transition-colors">

                      {/* Name + email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center
                                        bg-gradient-to-br ${grad} text-white font-bold text-sm flex-shrink-0 shadow`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                              {emp.name}
                              {me && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                                  أنت
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">{emp.email}</div>
                            {emp.phone && (
                              <div className="text-xs text-gray-600">{emp.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleInfo.bg}`}>
                          {roleInfo.label}
                        </span>
                      </td>

                      {/* Active */}
                      <td className="py-4 px-5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          emp.isActive !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {emp.isActive !== false ? '● فعّال' : '● معطّل'}
                        </span>
                      </td>

                      {/* Last login */}
                      <td className="py-4 px-5 text-sm text-gray-700">
                        {formatDate(emp.lastLogin)}
                      </td>

                      {/* Created */}
                      <td className="py-4 px-5 text-sm text-gray-700">
                        {formatDate(emp.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEdit(emp)}
                            className="flex items-center gap-1 text-amber-700 hover:text-amber-900
                                       text-sm font-medium transition-colors"
                          >
                            <Edit2 size={15} />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => openReset(emp)}
                            className="flex items-center gap-1 text-blue-700 hover:text-blue-900
                                       text-sm font-medium transition-colors"
                          >
                            <Key size={15} />
                            <span>إعادة تعيين كلمة المرور</span>
                          </button>
                          {!me && (
                            <button
                              onClick={() => handleDelete(emp)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-800
                                         text-sm font-medium transition-colors"
                            >
                              <Trash2 size={15} />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl
                          border border-white/60 w-full max-w-md">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4
                            border-b border-gray-200 bg-white/50 rounded-t-2xl">
              <button
                onClick={closeEdit}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-700" />
              </button>
              <div className="text-right">
                <h3 className="font-bold text-gray-800 text-base">تعديل بيانات المستخدم</h3>
                <p className="text-xs text-gray-600 mt-0.5">{editTarget.email}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4" dir="rtl">

              {/* Name — read-only */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم</label>
                <input
                  value={editTarget.name}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300
                             bg-gray-100 text-gray-600 text-sm cursor-not-allowed"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الدور</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300
                             bg-white text-gray-800
                             text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                >
                  <option value="admin">أدمن النظام</option>
                  <option value="manager">مدير المنشأة</option>
                  <option value="employee">موظف</option>
                  <option value="vet">طبيب بيطري</option>
                  <option value="food_supplier">تاجر مواد غذائية</option>
                  <option value="fuel_supplier">تاجر وقود</option>
                </select>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between px-4 py-3
                              bg-gray-100 border border-gray-200 rounded-xl">
                <span className={`text-sm font-semibold ${
                  editActive ? 'text-green-700' : 'text-red-600'
                }`}>
                  {editActive ? 'الحساب فعّال' : 'الحساب معطّل'}
                </span>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    editActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                                transition-transform duration-200 ${
                      editActive ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {saveError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {saveError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 bg-white
                             rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600
                             text-white rounded-xl text-sm font-bold shadow
                             hover:from-green-600 hover:to-emerald-700 disabled:opacity-60 transition-all"
                >
                  {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeReset(); }}
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl
                          border border-white/60 w-full max-w-md">

            <div className="flex items-center justify-between px-6 py-4
                            border-b border-gray-200 bg-white/50 rounded-t-2xl">
              <button
                onClick={closeReset}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-700" />
              </button>
              <div className="text-right">
                <h3 className="font-bold text-gray-800 text-base">إعادة تعيين كلمة المرور</h3>
                <p className="text-xs text-gray-600 mt-0.5">{resetTarget.name} — {resetTarget.email}</p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4" dir="rtl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8 أحرف على الأقل"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300
                             bg-white text-gray-800 text-sm
                             focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300
                             bg-white text-gray-800 text-sm
                             focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
              </div>

              {resetError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {resetError}
                </p>
              )}
              {resetSuccess && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {resetSuccess}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReset}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 bg-white
                             rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  إغلاق
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600
                             text-white rounded-xl text-sm font-bold shadow
                             hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 transition-all"
                >
                  {resetting ? 'جارٍ الحفظ...' : 'إعادة تعيين'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
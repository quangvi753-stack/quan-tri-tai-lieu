import React, { useState, useEffect } from 'react';
import UserManager from './UserManager';
import { User, KeyRound, Shield, Building, Lock, Check, AlertCircle, Loader2, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const SettingsPanel = ({ currentUser, activeWorkspace }) => {
  const isAdmin = currentUser?.role === 'admin';
  const [activeSubTab, setActiveSubTab] = useState(isAdmin ? 'users' : 'profile');

  // Change password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và Xác nhận mật khẩu không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-username': currentUser.username
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Đã đổi mật khẩu thành công!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Mật khẩu hiện tại không chính xác.');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
      
      {/* Settings Sidebar Tabs */}
      <div className="w-full md:w-[260px] bg-slate-50/50 dark:bg-slate-900/20 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-700/60 p-4 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('users')}
            className={`w-full flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shrink-0 ${
              activeSubTab === 'users'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-[inset_3px_0_0_#6366f1]'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <Shield className="size-4 shrink-0" />
            <span>Quản lý Tài khoản</span>
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`w-full flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shrink-0 ${
              activeSubTab === 'logs'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-[inset_3px_0_0_#6366f1]'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <Activity className="size-4 shrink-0" />
            <span>Nhật ký hoạt động</span>
          </button>
        )}
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`w-full flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shrink-0 ${
            activeSubTab === 'profile'
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-[inset_3px_0_0_#6366f1]'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
          }`}
        >
          <User className="size-4 shrink-0" />
          <span>Thông tin & Bảo mật</span>
        </button>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 p-6 sm:p-8 min-w-0 bg-white dark:bg-slate-800">
        
        {/* TAB 1: User management */}
        {isAdmin && activeSubTab === 'users' && (
          <div className="h-full">
            <UserManager currentUser={currentUser} />
          </div>
        )}

        {/* TAB 1.5: Audit Logs */}
        {isAdmin && activeSubTab === 'logs' && (
          <div className="h-full">
            <AuditLogsSection currentUser={currentUser} />
          </div>
        )}

        {/* TAB 2: Personal Profile & Change Password */}
        {activeSubTab === 'profile' && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Thông tin cá nhân & Bảo mật</h3>
            
            {/* Profile Detail List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-8 border-b border-slate-100 dark:border-slate-700/60 mb-8">
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-transparent">
                <User className="size-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Họ và tên</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{currentUser?.fullName}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-transparent">
                <Lock className="size-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Tên đăng nhập</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{currentUser?.username}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-transparent">
                <Shield className="size-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Quyền hạn</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">
                    {currentUser?.role === 'admin' ? 'Quản trị viên' : currentUser?.role === 'staff' ? 'Nhân viên soạn thảo' : 'Khách xem tài liệu'}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-transparent">
                <Building className="size-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Chi nhánh đang làm việc</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white truncate block max-w-[200px]" title={activeWorkspace?.name}>
                    {activeWorkspace?.name || 'Mặc định'}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <KeyRound className="size-4 text-indigo-500" />
                Đổi mật khẩu tài khoản
              </h4>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 border border-red-100 dark:border-transparent">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 border border-emerald-100 dark:border-transparent">
                  <Check className="size-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 font-semibold text-xs sm:text-sm">
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Cập nhật mật khẩu'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

const AuditLogsSection = ({ currentUser }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      if (!currentUser?.username) return;
      setLoading(true);
      try {
        const res = await fetch('/api/audit-logs', {
          headers: { 'x-username': currentUser.username }
        });
        const resData = await res.json();
        if (resData.success) {
          setLogs(resData.data || []);
        } else {
          setError(resData.message || 'Không thể tải nhật ký hoạt động.');
        }
      } catch (err) {
        console.error(err);
        setError('Lỗi kết nối đến máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [currentUser]);

  const filteredLogs = logs.filter(log => {
    const username = (log.username || '').toLowerCase();
    const fullName = (log.fullName || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return username.includes(search) || fullName.includes(search) || action.includes(search);
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nhật ký hoạt động hệ thống</h3>
        <p className="text-xs text-slate-400 mt-1">Ghi lại thời gian thực các thao tác nghiệp vụ và quản trị trên hệ thống.</p>
      </div>

      <div className="flex gap-4">
        <Input 
          type="text" 
          placeholder="Tìm theo người dùng, hành động..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs text-sm rounded-xl"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
          {error}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
          Không tìm thấy nhật ký hoạt động nào.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-700/60 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60">
                <th className="p-4">Thời gian</th>
                <th className="p-4">Người thực hiện</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Hành động</th>
                <th className="p-4">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-slate-600 dark:text-slate-300">
                  <td className="p-4 whitespace-nowrap font-medium">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : '---'}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800 dark:text-white">{log.fullName || 'Hệ thống'}</div>
                    <div className="text-[10px] text-slate-400">@{log.username || 'system'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      log.role === 'admin' ? 'bg-indigo-50 text-indigo-600' :
                      log.role === 'staff' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {log.role === 'admin' ? 'Admin' : log.role === 'staff' ? 'Staff' : log.role === 'viewer' ? 'Viewer' : 'System'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-white">
                    {log.action || 'Thao tác'}
                  </td>
                  <td className="p-4 max-w-[200px] truncate" title={JSON.stringify(log.details)}>
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <span className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 text-slate-500 p-1 rounded block overflow-hidden text-ellipsis">
                        {JSON.stringify(log.details)}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Không có chi tiết</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;

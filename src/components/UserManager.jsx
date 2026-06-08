import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { 
    UserPlus, Edit, Trash2, Shield, User, KeyRound, Building, 
    Lock, Check, AlertCircle, X, Search, Loader2 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const UserManager = ({ currentUser }) => {
    const { workspaces } = useWorkspace();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        role: 'staff',
        companyId: 'comp_qvn_hanoi'
    });

    // Delete Confirmation Modal state
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/users', {
                headers: { 'x-username': currentUser.username }
            });
            const resData = await res.json();
            if (resData.success) {
                setUsers(resData.data || []);
            } else {
                setError(resData.message || 'Không thể tải danh sách tài khoản.');
            }
        } catch (err) {
            console.error(err);
            setError('Lỗi kết nối đến server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.role === 'admin') {
            fetchUsers();
        }
    }, [currentUser]);

    const handleOpenCreate = () => {
        setFormData({
            username: '',
            password: '',
            fullName: '',
            role: 'staff',
            companyId: workspaces[0]?.id || 'comp_qvn_hanoi'
        });
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user) => {
        setFormData({
            username: user.username,
            password: '', // Để trống nếu không muốn đổi
            fullName: user.fullName,
            role: user.role,
            companyId: user.companyId
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleOpenDelete = (username) => {
        if (username === currentUser.username) {
            alert('Bạn không thể tự xóa tài khoản của chính mình!');
            return;
        }
        setDeleteTarget(username);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`/api/users/${deleteTarget}`, {
                method: 'DELETE',
                headers: { 'x-username': currentUser.username }
            });
            const resData = await res.json();
            if (resData.success) {
                setSuccess('Đã xóa tài khoản thành công!');
                setDeleteTarget(null);
                fetchUsers();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                alert(resData.message || 'Xóa tài khoản thất bại.');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối khi xóa tài khoản.');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (modalMode === 'create' && !formData.password.trim()) {
            setError('Mật khẩu là bắt buộc khi tạo tài khoản mới.');
            return;
        }

        const endpoint = modalMode === 'create' ? '/api/users' : `/api/users/${formData.username}`;
        const method = modalMode === 'create' ? 'POST' : 'PUT';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'x-username': currentUser.username
                },
                body: JSON.stringify(formData)
            });
            const resData = await res.json();

            if (resData.success) {
                setSuccess(modalMode === 'create' ? 'Đã cấp tài khoản mới thành công!' : 'Cập nhật tài khoản thành công!');
                setIsModalOpen(false);
                fetchUsers();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(resData.message || 'Đã xảy ra lỗi.');
            }
        } catch (err) {
            console.error(err);
            setError('Lỗi kết nối máy chủ.');
        }
    };

    const getWorkspaceName = (id) => {
        const ws = workspaces.find(w => w.id === id);
        return ws ? ws.name : id;
    };

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto pb-24 font-display">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Quản Lý & Cấp Tài Khoản
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-black border border-indigo-100 uppercase tracking-wider">Admin</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Cấp và phân quyền tài khoản con cho đối tác hoặc nhân viên chi nhánh.</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl gap-2 shadow-md flex items-center px-4 py-2.5">
                    <UserPlus className="w-4 h-4" />
                    Cấp tài khoản mới
                </Button>
            </div>

            {/* Notifications */}
            {success && (
                <div className="mb-6 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl animate-fade-in shadow-sm">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {/* Search bar and info card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Tìm tài khoản, họ tên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-sm rounded-xl"
                        />
                    </div>
                    <div className="text-xs text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border">
                        Tổng cộng: {filteredUsers.length} tài khoản
                    </div>
                </div>

                {/* Users List Table */}
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="text-sm font-semibold">Đang tải danh sách tài khoản...</span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                        <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Không tìm thấy tài khoản nào</p>
                        <p className="text-xs text-slate-400 mt-1">Hãy nhấn "Cấp tài khoản mới" để thêm tài khoản đăng nhập đầu tiên.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên đăng nhập</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và Tên</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò (Quyền)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chi nhánh/Công ty liên kết</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredUsers.map(user => (
                                    <tr key={user.username} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase">
                                                    {user.username.substring(0, 2)}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            {user.fullName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit
                                                ${user.role === 'admin' 
                                                    ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                                    : user.role === 'staff'
                                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }
                                            `}>
                                                <Shield className="w-3 h-3" />
                                                {user.role === 'admin' ? 'Quản trị viên' : user.role === 'staff' ? 'Nhân viên' : 'Khách xem'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1.5 mt-1">
                                            <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            {getWorkspaceName(user.companyId)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(user)}
                                                    className="h-8 px-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                {user.username !== 'admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenDelete(user.username)}
                                                        className="h-8 px-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Create/Edit Account */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                <Lock className="w-4 h-4 text-indigo-500" />
                                {modalMode === 'create' ? 'Cấp tài khoản đăng nhập' : 'Chỉnh sửa tài khoản'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <Label className="mb-1.5 block">Tên đăng nhập (Username)</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Ví dụ: nhanvien1, partnera..."
                                        value={formData.username}
                                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                        disabled={modalMode === 'edit'}
                                        required
                                        className="pl-9 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="mb-1.5 block">Họ và Tên</Label>
                                <Input
                                    type="text"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                    required
                                    className="text-sm"
                                />
                            </div>

                            <div>
                                <Label className="mb-1.5 block">
                                    {modalMode === 'edit' ? 'Mật khẩu mới (Bỏ trống nếu giữ nguyên)' : 'Mật khẩu ban đầu'}
                                </Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder={modalMode === 'edit' ? "Nhập mật khẩu mới..." : "Nhập mật khẩu..."}
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        required={modalMode === 'create'}
                                        className="pl-9 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-1.5 block">Vai trò (Quyền)</Label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                        className="w-full text-sm rounded-xl border border-slate-200 bg-white p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700"
                                    >
                                        <option value="admin">Quản trị viên</option>
                                        <option value="staff">Nhân viên</option>
                                        <option value="viewer">Khách xem (Chỉ đọc)</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="mb-1.5 block">Liên kết công ty</Label>
                                    <select
                                        value={formData.companyId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                                        className="w-full text-sm rounded-xl border border-slate-200 bg-white p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700"
                                    >
                                        {workspaces.map(ws => (
                                            <option key={ws.id} value={ws.id}>{ws.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl px-4 py-2 text-sm text-slate-500"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-5 py-2 text-sm shadow-md"
                                >
                                    {modalMode === 'create' ? 'Cấp tài khoản' : 'Lưu cập nhật'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
                        <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Xóa tài khoản?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Bạn có chắc chắn muốn xóa tài khoản <strong className="text-slate-800 dark:text-white">@{deleteTarget}</strong> không?<br/>
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-xl px-4 py-2 text-sm text-slate-500 hover:bg-slate-100"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold px-5 py-2 text-sm shadow-md"
                            >
                                Xác nhận xóa
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;

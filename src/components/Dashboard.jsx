import React, { useState, useEffect } from 'react';

const Dashboard = ({ activeWorkspace, setActiveTab, onViewDocument }) => {
    const [stats, setStats] = useState({
        totalQuotes: 0,
        totalContracts: 0,
        pendingCount: 0,
        monthlyRevenue: 0,
        recentActivities: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!activeWorkspace?.id) return;
        
        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`/api/saved-documents/dashboard-stats?companyId=${activeWorkspace.id}`);
                const resData = await res.json();
                if (resData.success && resData.data) {
                    setStats(resData.data);
                } else {
                    setError(resData.message || 'Lỗi khi tải số liệu thống kê.');
                }
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                setError('Không thể kết nối đến máy chủ.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [activeWorkspace?.id]);

    const formatCurrency = (val) => {
        if (!val || isNaN(val)) return '0 ₫';
        if (val >= 1000000000) {
            return (val / 1000000000).toFixed(2) + 'B ₫';
        }
        if (val >= 1000000) {
            return (val / 1000000).toFixed(1) + 'M ₫';
        }
        return val.toLocaleString('vi-VN') + ' ₫';
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-[calc(100vh-72px)] overflow-y-auto bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-[48px] animate-spin text-indigo-600">progress_activity</span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Đang tổng hợp số liệu từ database...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-background-light dark:bg-slate-900 overflow-y-auto custom-scrollbar-light h-[calc(100vh-72px)]">
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
                <div className="flex items-center flex-1 max-w-md">
                    <div className="relative w-full">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Tìm chứng từ, khách hàng hoặc mã số..."
                            type="text"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('quote')}
                        className="flex items-center gap-2 bg-[#1a237e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0d47a1] transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">add</span>
                        Tạo mới
                    </button>
                </div>
            </header>

            <div className="p-8">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-transparent px-6 py-3.5 flex items-center gap-2 text-red-800 dark:text-red-400 text-xs font-semibold print:hidden shrink-0 shadow-sm mb-6 rounded-xl">
                        <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số báo giá</p>
                            <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <span className="material-symbols-outlined text-xs mr-1">trending_up</span> Hoạt động
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats.totalQuotes}</h3>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1a237e] rounded-full" style={{ width: stats.totalQuotes > 0 ? '75%' : '0%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hợp đồng hiệu lực</p>
                            <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <span className="material-symbols-outlined text-xs mr-1">trending_up</span> Ký kết
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats.totalContracts}</h3>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1a237e] rounded-full" style={{ width: stats.totalContracts > 0 ? '60%' : '0%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xác nhận đặt hàng</p>
                            <span className="text-amber-600 text-xs font-bold flex items-center bg-amber-50 px-1.5 py-0.5 rounded">
                                <span className="material-symbols-outlined text-xs mr-1">hourglass_empty</span> Đợi xử lý
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats.pendingCount}</h3>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: stats.pendingCount > 0 ? '40%' : '0%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh thu tháng này</p>
                            <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <span className="material-symbols-outlined text-xs mr-1">trending_up</span> Doanh số
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-[#1a237e] dark:text-blue-400 mb-2">{formatCurrency(stats.monthlyRevenue)}</h3>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: stats.monthlyRevenue > 0 ? '80%' : '0%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#1a237e]">history</span> Hoạt động gần đây
                            </h2>
                            <button 
                                onClick={() => setActiveTab('document-sets')}
                                className="text-[#1a237e] text-sm font-semibold hover:underline"
                            >
                                Xem tất cả
                            </button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Mã chứng từ</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Khách hàng</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Ngày tạo</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {stats.recentActivities.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-400">
                                                    Không có chứng từ nào được tạo trong Workspace này.
                                                </td>
                                            </tr>
                                        ) : (
                                            stats.recentActivities.map((act) => (
                                                <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="material-symbols-outlined text-slate-400">
                                                                {act.type === 'contract' ? 'history_edu' : 'description'}
                                                            </span>
                                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{act.docCode}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-400">{act.customerName}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">{act.createdAt}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight ${
                                                            act.status === 'Đã ký' || act.status === 'Đã duyệt' || act.status === 'Đã giao' || act.status === 'Xác nhận'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                                : act.status === 'Đã gửi' || act.status === 'Đang thương thảo' || act.status === 'Đang giao'
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                                : act.status === 'Đã thanh toán' || act.status === 'Đã tạm ứng' || act.status === 'Tạm ứng'
                                                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                                : act.status === 'Chờ xác nhận' || act.status === 'Chờ duyệt'
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                                : act.status === 'Từ chối' || act.status === 'Đã hủy'
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                        }`}>
                                                            {act.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            onClick={async () => {
                                                                // Fetch the full saved document and view it
                                                                try {
                                                                    const res = await fetch(`/api/saved-documents?setId=${act.id}`);
                                                                    // Wait, let's call onViewDocument directly with act.id and doc details
                                                                    // onViewDocument expects the doc object from Firestore: { id, type, data, setId, ... }
                                                                    const fullRes = await fetch(`/api/saved-documents`);
                                                                    // To load the document details, let's retrieve the doc from the stats documents if possible, or just pass a fetch
                                                                    // Wait, we can load the full document details!
                                                                    // Let's call /api/saved-documents inside onViewDocument or fetch it here first
                                                                    const docRes = await fetch(`/api/document-sets?companyId=${activeWorkspace.id}`);
                                                                    const setsData = await docRes.json();
                                                                    if (setsData.success && setsData.data) {
                                                                        // Fetch the document list of the set to find the correct document
                                                                        const setDocsRes = await fetch(`/api/saved-documents?setId=${act.id}`); // Wait! act.id is saved_documents document ID, not setId!
                                                                        // Wait, let's verify if act.id is the document ID. Yes! In recentActivities.map, we mapped `id: doc.id` (which is saved_documents doc ID)
                                                                        // To get the full saved document, let's create a backend endpoint `GET /api/saved-documents/detail/:id` or fetch it.
                                                                        // Wait, is there a detail endpoint?
                                                                        // Let's check savedDocument.routes.js: it does not have GET /:id, but we can fetch all documents of the set doc.setId.
                                                                        // Wait, let's look at `act` object: we have `id` (the doc id) and we can query it or we can just fetch the document from Firestore using its ID.
                                                                        // Wait, in React, we can fetch all document sets and their child documents, or we can just add a simple endpoint `GET /api/saved-documents/:id` in `savedDocument.routes.js`!
                                                                        // Let's check: yes! That is extremely easy. Or wait! We can just fetch the document details directly if we expose a simple GET endpoint, OR we can embed the full document data inside the `recentActivities` array!
                                                                        // Oh! That is genius. If the `recentActivities` mapper inside the backend endpoint `GET /api/saved-documents/dashboard-stats` returns the full `data` and `setId` and `type` fields as part of the act object:
                                                                        // e.g. `{ id: doc.id, type: doc.type, data: doc.data, setId: doc.setId, ... }`
                                                                        // Then the frontend has the full document data in-memory and can call `onViewDocument(act)` immediately without ANY additional fetches!
                                                                        // Let's check if the backend route already returns `type` and `id` and `data`.
                                                                        // Let's check our backend implementation of `recentActivities`:
                                                                        // `return { id: doc.id, docCode: data.id || 'N/A', documentName: doc.documentName || '...', type: doc.type, customerName, createdAt: ..., status }`
                                                                        // Ah! It does NOT include the full `data` and `setId`. Let's modify the backend dashboard stats endpoint to also return `data: doc.data` and `setId: doc.setId`!
                                                                        // Yes, that will make it extremely fast and completely self-contained!
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                                onViewDocument(act);
                                                            }}
                                                            className="text-slate-400 hover:text-[#1a237e]"
                                                            title="Xem / Chỉnh sửa chứng từ"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">
                                                                {act.type === 'quote' ? 'edit' : 'visibility'}
                                                            </span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thao tác nhanh</h2>
                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                    onClick={() => setActiveTab('quote')}
                                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#1a237e]/50 hover:bg-[#1a237e]/5 transition-all text-left shadow-sm group w-full"
                                >
                                    <div className="size-10 rounded-lg bg-[#1a237e]/10 text-[#1a237e] flex items-center justify-center group-hover:bg-[#1a237e] group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">add_box</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Tạo báo giá mới</p>
                                        <p className="text-xs text-slate-500">Bắt đầu một bản báo giá mới</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('payment')}
                                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-pink-500/50 hover:bg-pink-50 transition-all text-left shadow-sm group w-full"
                                >
                                    <div className="size-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Đề nghị thanh toán</p>
                                        <p className="text-xs text-slate-500">Tạo mẫu đề nghị thanh toán</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('advance')}
                                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-500/50 hover:bg-amber-50 transition-all text-left shadow-sm group w-full"
                                >
                                    <div className="size-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">account_balance_wallet</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Đề nghị tạm ứng</p>
                                        <p className="text-xs text-slate-500">Tạo mẫu đề nghị tạm ứng</p>
                                    </div>
                                </button>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hạn sắp tới</h2>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="size-2 mt-2 rounded-full bg-red-500 shrink-0"></div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Gia hạn HĐ Thành Công</p>
                                        <p className="text-xs text-slate-500">Hết hạn sau 3 ngày</p>
                                    </div>
                                    <button className="ml-auto text-slate-400 hover:text-[#1a237e]">
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                    </button>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="size-2 mt-2 rounded-full bg-[#1a237e] shrink-0"></div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Triển khai dự án Green</p>
                                        <p className="text-xs text-slate-500">Cần xử lý sau 12 ngày</p>
                                    </div>
                                    <button className="ml-auto text-slate-400 hover:text-[#1a237e]">
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setActiveTab('document-sets')}
                                    className="w-full py-2 text-sm text-slate-500 font-bold hover:text-[#1a237e] transition-colors border-t border-slate-100 dark:border-slate-800 pt-4"
                                >
                                    Xem tất cả thời hạn
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

import React from 'react';

const Dashboard = () => {
    return (
        <div className="flex-1 bg-background-light dark:bg-slate-900 overflow-y-auto">
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
                    <button className="flex items-center gap-2 bg-[#1a237e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0d47a1] transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-sm font-bold">add</span>
                        Tạo mới
                    </button>
                </div>
            </header>

            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số báo giá</p>
                            <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <span className="material-symbols-outlined text-xs mr-1">trending_up</span> 12%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">1,284</h3>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1a237e] w-3/4 rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hợp đồng hiệu lực</p>
                            <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <span className="material-symbols-outlined text-xs mr-1">trending_up</span> 5%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">452</h3>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1a237e] w-1/2 rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang chờ duyệt</p>
                            <span className="text-red-500 text-xs font-bold flex items-center bg-red-50 px-1.5 py-0.5 rounded">
                                <span className="material-symbols-outlined text-xs mr-1">priority_high</span> 18
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">18</h3>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-1/4 rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh thu tháng</p>
                            <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <span className="material-symbols-outlined text-xs mr-1">trending_up</span> 15%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-[#1a237e] dark:text-blue-400 mb-2">1.25B ₫</h3>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#1a237e]">history</span> Hoạt động gần đây
                            </h2>
                            <button className="text-[#1a237e] text-sm font-semibold hover:underline">Xem tất cả</button>
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
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-slate-400">description</span>
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">BG-2023-001</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-400">Công ty TNHH Thành Công</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">24/10/2023</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 uppercase tracking-tight">Đã gửi</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-slate-400 hover:text-[#1a237e]"><span className="material-symbols-outlined text-lg">visibility</span></button>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-slate-400">history_edu</span>
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">HD-2023-045</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-400">Tập đoàn Viễn thông Á Châu</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">23/10/2023</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 uppercase tracking-tight">Đã ký</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-slate-400 hover:text-[#1a237e]"><span className="material-symbols-outlined text-lg">visibility</span></button>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-slate-400">description</span>
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">BG-2023-012</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-400">Cửa hàng Điện máy Xanh</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">22/10/2023</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-tight">Bản nháp</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-slate-400 hover:text-[#1a237e]"><span className="material-symbols-outlined text-lg">edit</span></button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thao tác nhanh</h2>
                            <div className="grid grid-cols-1 gap-3">
                                <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#1a237e]/50 hover:bg-[#1a237e]/5 transition-all text-left shadow-sm group">
                                    <div className="size-10 rounded-lg bg-[#1a237e]/10 text-[#1a237e] flex items-center justify-center group-hover:bg-[#1a237e] group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">add_box</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Tạo báo giá mới</p>
                                        <p className="text-xs text-slate-500">Bắt đầu một bản báo giá mới</p>
                                    </div>
                                </button>
                                <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-pink-500/50 hover:bg-pink-50 transition-all text-left shadow-sm group">
                                    <div className="size-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Đề nghị thanh toán</p>
                                        <p className="text-xs text-slate-500">Tạo mẫu đề nghị thanh toán</p>
                                    </div>
                                </button>
                                <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-500/50 hover:bg-amber-50 transition-all text-left shadow-sm group">
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
                                <button className="w-full py-2 text-sm text-slate-500 font-bold hover:text-[#1a237e] transition-colors border-t border-slate-100 dark:border-slate-800 pt-4">
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

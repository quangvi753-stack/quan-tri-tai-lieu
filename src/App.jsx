import { useState, useEffect } from 'react'
import QuoteForm from './components/QuoteForm'
import QuotePreview from './components/QuotePreview'
import Dashboard from './components/Dashboard'
import ContractForm from './components/ContractForm'
import ContractPreview from './components/ContractPreview'
import DeliveryReceiptForm from './components/DeliveryReceiptForm'
import DeliveryReceiptPreview from './components/DeliveryReceiptPreview'
import PaymentRequestForm from './components/PaymentRequestForm'
import PaymentRequestPreview from './components/PaymentRequestPreview'
import AdvanceRequestForm from './components/AdvanceRequestForm'
import AdvanceRequestPreview from './components/AdvanceRequestPreview'
import OrderConfirmationForm from './components/OrderConfirmationForm'
import OrderConfirmationPreview from './components/OrderConfirmationPreview'
import { exportHTMLToWord } from './utils/exportToWord'
import { useWorkspace } from './contexts/WorkspaceContext'
import SetList from './components/document-sets/SetList'
import CustomerManager from './components/CustomerManager'
import SaveToSetModal from './components/SaveToSetModal'
import AICopilot from './components/AICopilot'
import AIDocumentStudio from './components/AIDocumentStudio'
import Login from './components/Login'
import SettingsPanel from './components/SettingsPanel'
import { motion, AnimatePresence } from 'framer-motion'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'

import { useQuoteState } from './hooks/useQuoteState'
import { useContractState } from './hooks/useContractState'
import { useDeliveryState } from './hooks/useDeliveryState'
import { usePaymentState } from './hooks/usePaymentState'
import { useAdvanceState } from './hooks/useAdvanceState'
import { useOrderConfirmState } from './hooks/useOrderConfirmState'


function App() {
  const { activeWorkspace, workspaces, switchWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('quote');
  const [previousTab, setPreviousTab] = useState('dashboard');

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveModalType, setSaveModalType] = useState('');
  const [saveModalData, setSaveModalData] = useState(null);

  const [editingDocId, setEditingDocId] = useState(null);
  const [activeSet, setActiveSet] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState('form');

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [authChecking, setAuthChecking] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ documents: [], sets: [], customers: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Debounced search logic
  useEffect(() => {
    if (!searchQuery.trim() || !activeWorkspace?.id) {
      setSearchResults({ documents: [], sets: [], customers: [] });
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&companyId=${activeWorkspace.id}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success && resData.data) {
            setSearchResults(resData.data);
            setShowSearchDropdown(true);
          }
        })
        .catch(err => console.error('Error fetching search results:', err))
        .finally(() => setIsSearching(false));
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeWorkspace?.id]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('currentUser');
      if (!savedUser) {
        setAuthChecking(false);
        return;
      }
      try {
        const parsed = JSON.parse(savedUser);
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          const updatedUser = { ...data.user, token: parsed.token };
          setCurrentUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          if (data.user.role !== 'admin' && data.user.companyId) {
            switchWorkspace(data.user.companyId);
          }
        } else {
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Lỗi xác thực phiên:', err);
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    if (user.role !== 'admin' && user.companyId) {
      switchWorkspace(user.companyId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setActiveTab('quote');
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenSaveModal = async (type, data) => {
    if (currentUser?.role === 'viewer') {
      alert("Tài khoản Khách xem không có quyền lưu hoặc tạo mới chứng từ.");
      return;
    }
    if (editingDocId && activeSet) {
      try {
        const res = await fetch(`/api/saved-documents/${editingDocId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentName: activeSet.title,
            data: data
          })
        });
        const resData = await res.json();
        if (resData.success) {
          alert("Cập nhật chứng từ thành công!");
        } else {
          alert("Lỗi khi cập nhật: " + resData.message);
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật", error);
        alert("Đã xảy ra lỗi kết nối khi lưu chứng từ.");
      }
      return;
    }
    setSaveModalType(type);
    setSaveModalData(data);
    setIsSaveModalOpen(true);
  };

  const handleEditDocument = (doc, setObj) => {
    setPreviousTab(activeTab);
    setEditingDocId(doc.id);
    setActiveSet(setObj);
    
    let tabMap = {
      quote: 'quote',
      contract: 'contract',
      delivery: 'delivery',
      payment: 'payment',
      advance: 'advance',
      order_confirm: 'order-confirm'
    };
    
    const tabId = tabMap[doc.type] || 'quote';
    setActiveTab(tabId);
    
    if (doc.type === 'quote') setQuoteData(doc.data);
    else if (doc.type === 'contract') setContractData(doc.data);
    else if (doc.type === 'delivery') setDeliveryData(doc.data);
    else if (doc.type === 'payment') setPaymentData(doc.data);
    else if (doc.type === 'advance') setAdvanceData(doc.data);
  };

  const handleViewDocument = (doc) => {
    setPreviousTab(activeTab);
    let tabMap = {
      quote: 'quote',
      contract: 'contract',
      delivery: 'delivery',
      payment: 'payment',
      advance: 'advance',
      order_confirm: 'order-confirm'
    };
    const tabId = tabMap[doc.type] || 'quote';
    setActiveTab(tabId);
    setEditingDocId(doc.id);
    
    // Tìm và đặt activeSet nếu có
    if (doc.setId) {
      fetch(`/api/document-sets?companyId=${activeWorkspace?.id}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success && resData.data) {
            const matchedSet = resData.data.find(s => s.id === doc.setId);
            if (matchedSet) {
              setActiveSet(matchedSet);
            }
          }
        })
        .catch(err => console.error("Error setting active set in dashboard navigation", err));
    }
    
    if (doc.type === 'quote') setQuoteData(doc.data);
    else if (doc.type === 'contract') setContractData(doc.data);
    else if (doc.type === 'delivery') setDeliveryData(doc.data);
    else if (doc.type === 'payment') setPaymentData(doc.data);
    else if (doc.type === 'advance') setAdvanceData(doc.data);
    else if (doc.type === 'order_confirm') setOrderConfirmData(doc.data);
  };

  const handleNavigateWithPrefill = (tabId, data, setObj) => {
    setPreviousTab(activeTab);
    setEditingDocId(null);
    setActiveSet(setObj);
    setActiveTab(tabId);
    
    if (!data) return; // Không có data prefill → chỉ chuyển tab
    
    // Merge data prefill vào state hiện tại (không replace hoàn toàn)
    // Tránh crash khi data chỉ là partial (thiếu items, companyName, v.v.)
    if (tabId === 'quote') setQuoteData(prev => ({ ...prev, ...data }));
    else if (tabId === 'contract') setContractData(prev => ({ ...prev, ...data }));
    else if (tabId === 'delivery') setDeliveryData(prev => ({ ...prev, ...data }));
    else if (tabId === 'payment') setPaymentData(prev => ({ ...prev, ...data }));
    else if (tabId === 'advance') setAdvanceData(prev => ({ ...prev, ...data }));
    else if (tabId === 'order-confirm') setOrderConfirmData(prev => ({ ...prev, ...data }));
  };

  // --- Document States & Handlers from Custom Hooks ---
  const [quoteData, setQuoteData, quoteHandlers] = useQuoteState(activeWorkspace?.id);
  const {
    updateData: handleUpdateData,
    updateItem: handleUpdateItem,
    addItem: handleAddItem,
    removeItem: handleRemoveItem
  } = quoteHandlers;

  const [deliveryData, setDeliveryData, deliveryHandlers] = useDeliveryState(activeWorkspace?.id);
  const {
    updateData: handleUpdateDeliveryData,
    updateItem: handleUpdateDeliveryItem,
    addItem: handleAddDeliveryItem,
    removeItem: handleRemoveDeliveryItem
  } = deliveryHandlers;

  const [contractData, setContractData, contractHandlers] = useContractState(activeWorkspace?.id);
  const {
    updateData: handleUpdateContractData,
    updateItem: handleUpdateContractItem,
    addItem: handleAddContractItem,
    removeItem: handleRemoveContractItem,
    updateClause: handleUpdateContractClause,
    addClause: handleAddContractClause,
    removeClause: handleRemoveContractClause
  } = contractHandlers;

  const [paymentData, setPaymentData, paymentHandlers] = usePaymentState(activeWorkspace?.id);
  const {
    updateData: handleUpdatePaymentData,
    updateItem: handleUpdatePaymentItem,
    addItem: handleAddPaymentItem,
    removeItem: handleRemovePaymentItem
  } = paymentHandlers;

  const [advanceData, setAdvanceData, advanceHandlers] = useAdvanceState(activeWorkspace?.id);
  const {
    updateData: handleUpdateAdvanceData
  } = advanceHandlers;

  const [orderConfirmData, setOrderConfirmData, orderConfirmHandlers] = useOrderConfirmState(activeWorkspace?.id);
  const {
    updateData: handleUpdateOrderConfirmData,
    updateItem: handleUpdateOrderConfirmItem,
    addItem: handleAddOrderConfirmItem,
    removeItem: handleRemoveOrderConfirmItem,
    updateClause: handleUpdateOrderConfirmClause,
    addClause: handleAddOrderConfirmClause,
    removeClause: handleRemoveOrderConfirmClause
  } = orderConfirmHandlers;

  const getCurrentContextData = () => {
    switch (activeTab) {
      case 'quote': return { type: 'Báo Giá', data: quoteData };
      case 'contract': return { type: 'Hợp Đồng', data: contractData };
      case 'delivery': return { type: 'Phiếu Xuất Kho', data: deliveryData };
      case 'payment': return { type: 'Đề Nghị Thanh Toán', data: paymentData };
      case 'advance': return { type: 'Đề Nghị Tạm Ứng', data: advanceData };
      case 'order-confirm': return { type: 'Xác Nhận Đặt Hàng', data: orderConfirmData };
      default: return { type: null, data: null };
    }
  };

  const currentContext = getCurrentContextData();
  const handlePrint = () => {
    window.print();
  };

  const handleCreateDocumentFromCustomer = async (type, customer) => {
    setActiveTab(type);
    
    let nextId = '';
    try {
      const apiTypeMap = { 'order-confirm': 'order_confirm', 'quote': 'quote', 'contract': 'contract', 'delivery': 'delivery' };
      const apiType = apiTypeMap[type] || type;
      const res = await fetch(`/api/saved-documents/next-id?companyId=${activeWorkspace.id}&type=${apiType}`);
      const resData = await res.json();
      if (resData.success && resData.nextId) {
        nextId = resData.nextId;
      }
    } catch (err) {
      console.error("Failed to fetch next sequential ID:", err);
    }
    
    if (type === 'quote') {
      setQuoteData(prev => ({
        ...prev,
        id: nextId || prev.id,
        customerName: customer.fullName,
        customerAddress: customer.address || '',
        customerTax: customer.taxCode || '',
        representative: customer.representative || '',
        customerPhone: customer.phone || '',
      }));
    } else if (type === 'contract') {
      setContractData(prev => ({
        ...prev,
        id: nextId || prev.id,
        partyB: customer.fullName,
        partyBAddress: customer.address,
        partyBTaxCode: customer.taxCode,
        partyBRep: customer.representative,
        partyBPosition: customer.position,
        partyBPhone: customer.phone,
        partyBAccount: customer.bankAccount,
      }));
    } else if (type === 'delivery') {
      setDeliveryData(prev => ({
        ...prev,
        id: nextId || prev.id,
        customerName: customer.fullName,
        customerAddress: customer.address,
      }));
    } else if (type === 'order-confirm') {
      setOrderConfirmData(prev => ({
        ...prev,
        id: nextId || prev.id,
        partyBName: customer.fullName,
        partyBAddress: customer.address,
        partyBTax: customer.taxCode,
        partyBRep: customer.representative,
        partyBRole: customer.position,
        partyBPhone: customer.phone,
      }));
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-indigo-500">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[48px] animate-spin">progress_activity</span>
          <span className="text-sm font-semibold tracking-wider">Đang xác thực hệ thống...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-slate-900 font-display">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Modern Premium UI */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-[#0b0f19] text-slate-300 flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.08)] z-50 overflow-y-auto print:hidden border-r border-white/5 transition-transform duration-300 md:translate-x-0 md:static md:flex ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/10 blur-[40px] pointer-events-none"></div>
        
        <div className="p-6 pb-2 relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2.5 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="material-symbols-outlined block text-[24px]">description</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-[19px] leading-tight tracking-tight font-display">DocManager</h1>
              <p className="text-indigo-200/70 text-[11px] font-medium tracking-wider uppercase mt-0.5">Enterprise</p>
            </div>
          </div>

          {currentUser?.role === 'admin' ? (
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Chi nhánh / Workspace</label>
              <select
                value={activeWorkspace?.id || ''}
                onChange={(e) => switchWorkspace(e.target.value)}
                className="w-full text-xs rounded-xl border border-white/10 bg-[#151b2c] text-white p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              >
                {workspaces.map(ws => (
                  <option key={ws.id} value={ws.id} className="bg-[#0b0f19]">
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mb-4 px-3 py-2 bg-slate-800/30 border border-white/5 rounded-xl">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Chi nhánh liên kết</label>
              <span className="text-xs font-semibold text-indigo-300 block truncate" title={activeWorkspace?.name}>
                {activeWorkspace?.name}
              </span>
            </div>
          )}
        </div>

          <nav className="flex flex-col gap-1.5 px-4 relative z-10">
            <button
              onClick={() => { setActiveTab('document-sets'); setIsSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'document-sets' ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white shadow-[inset_2px_0_0_#6366f1] border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === 'document-sets' ? 'text-indigo-400' : ''}`}>folder_copy</span>
              <span className="font-semibold text-sm tracking-wide">Bộ Chứng Từ</span>
            </button>
            <div className="h-px bg-white/5 my-3 mx-2"></div>
            
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === 'dashboard' ? 'text-white' : ''}`}>dashboard</span>
              <span className="text-sm">Tổng quan</span>
            </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'quote' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => { setActiveTab('quote'); setIsSidebarOpen(false); }}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'quote' ? 'text-white' : ''}`}>request_quote</span>
            <span className="text-sm">Báo giá</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'contract' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => { setActiveTab('contract'); setIsSidebarOpen(false); }}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'contract' ? 'text-white' : ''}`}>history_edu</span>
            <span className="text-sm">Hợp đồng</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'delivery' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => { setActiveTab('delivery'); setIsSidebarOpen(false); }}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'delivery' ? 'text-white' : ''}`}>local_shipping</span>
            <span className="text-sm">Phiếu xuất kho</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'payment' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => { setActiveTab('payment'); setIsSidebarOpen(false); }}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'payment' ? 'text-white' : ''}`}>payments</span>
            <span className="text-sm">Thanh toán</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'advance' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => { setActiveTab('advance'); setIsSidebarOpen(false); }}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'advance' ? 'text-white' : ''}`}>account_balance_wallet</span>
            <span className="text-sm">Tạm ứng</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'order-confirm' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => { setActiveTab('order-confirm'); setIsSidebarOpen(false); }}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'order-confirm' ? 'text-white' : ''}`}>fact_check</span>
            <span className="text-sm">Xác nhận đặt hàng</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'customer' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => { setActiveTab('customer'); setIsSidebarOpen(false); }}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'customer' ? 'text-white' : ''}`}>group</span>
            <span className="text-sm">Khách hàng</span>
          </button>
          

          
          <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Công cụ nâng cao</div>
          {currentUser?.role !== 'viewer' && (
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${activeTab === 'ai-studio' ? 'text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
              onClick={() => { setActiveTab('ai-studio'); setIsSidebarOpen(false); }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-opacity duration-300 ${activeTab === 'ai-studio' ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'}`}></div>
              <span className="material-symbols-outlined text-[20px] relative z-10 text-indigo-300">auto_awesome</span>
              <span className="text-sm font-semibold relative z-10">Soạn thảo AI</span>
              {activeTab !== 'ai-studio' && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>}
            </button>
          )}
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'settings' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-sm">Cài đặt</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto relative z-10">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/20 border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0 shadow-md shadow-indigo-600/20">
                {currentUser?.username.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">{currentUser?.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentUser?.role === 'admin' ? 'Quản trị viên' : currentUser?.role === 'staff' ? 'Nhân viên' : 'Khách xem'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              title="Đăng xuất"
            >
              <span className="material-symbols-outlined text-[18px] block">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#f8fafc]">
        {/* Global Top Search Bar */}
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 print:hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] sticky top-0">
          <div className="flex items-center flex-1 max-w-lg">
            {/* Burger menu button for mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-indigo-600 md:hidden mr-2 rounded-lg hover:bg-slate-100 flex items-center justify-center shrink-0"
              title="Mở menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-indigo-500 transition-colors">
                {isSearching ? 'progress_activity' : 'search'}
              </span>
              <input
                id="global-search-input"
                className={`w-full pl-12 pr-12 py-2.5 bg-slate-100/50 border border-slate-200/80 rounded-full text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 shadow-sm ${isSearching ? 'animate-pulse' : ''}`}
                placeholder="Tìm kiếm tài liệu, khách hàng..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 250)}
              />
              {searchQuery ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
                  title="Xoá tìm kiếm"
                >
                  <span className="material-symbols-outlined text-[18px] block">close</span>
                </button>
              ) : (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-400 bg-white shadow-sm hidden sm:block">Ctrl K</div>
              )}

              {/* Modern drop-down Search Results Panel */}
              <AnimatePresence>
                {showSearchDropdown && (searchResults.documents.length > 0 || searchResults.sets.length > 0 || searchResults.customers.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[380px] overflow-y-auto custom-scrollbar-light"
                  >
                    <div className="p-2.5 space-y-3">
                      {/* Section: Documents */}
                      {searchResults.documents.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tài liệu lưu trữ</div>
                          <div className="mt-1 space-y-0.5">
                            {searchResults.documents.map((doc) => (
                              <button
                                key={doc.id}
                                onClick={() => handleViewDocument(doc)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100/80 text-slate-700 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="material-symbols-outlined text-indigo-500 text-[20px] bg-indigo-50 p-1.5 rounded-lg">description</span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{doc.documentName}</p>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                      <span>Mã: {doc.docCode}</span>
                                      <span>•</span>
                                      <span className="uppercase text-[9px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{doc.type.replace('_', ' ')}</span>
                                    </p>
                                  </div>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section: Document Sets */}
                      {searchResults.sets.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bộ chứng từ</div>
                          <div className="mt-1 space-y-0.5">
                            {searchResults.sets.map((set) => (
                              <button
                                key={set.id}
                                onClick={() => {
                                  setActiveSet(set);
                                  setActiveTab('document-sets');
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100/80 text-slate-700 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="material-symbols-outlined text-purple-500 text-[20px] bg-purple-50 p-1.5 rounded-lg">folder</span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-purple-600 transition-colors">{set.title}</p>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{set.description || 'Không có mô tả'}</p>
                                  </div>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section: Customers */}
                      {searchResults.customers.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khách hàng</div>
                          <div className="mt-1 space-y-0.5">
                            {searchResults.customers.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => setActiveTab('customer')}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100/80 text-slate-700 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="material-symbols-outlined text-amber-500 text-[20px] bg-amber-50 p-1.5 rounded-lg">group</span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-amber-600 transition-colors">{c.fullName}</p>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">MST: {c.taxCode || 'N/A'} - ĐT: {c.phone || 'N/A'}</p>
                                  </div>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden lg:flex items-center gap-1.5 mr-4 p-1 bg-slate-100/80 rounded-lg shadow-inner">
              {['dashboard', 'quote', 'contract', 'delivery', 'payment', 'order-confirm'].map((tabId) => {
                const labels = { dashboard: 'Tổng quan', quote: 'Báo giá', contract: 'Hợp đồng', delivery: 'Xuất kho', payment: 'Thanh toán', 'order-confirm': 'Xác nhận đặt hàng' };
                return (
                  <button
                    key={tabId}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${activeTab === tabId ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
                    onClick={() => setActiveTab(tabId)}
                  >
                    {labels[tabId]}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 sm:border-l sm:border-slate-200 sm:pl-6">
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full relative transition-colors">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button 
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                onClick={() => setActiveTab('settings')}
              >
                <span className="material-symbols-outlined text-[22px]">settings</span>
              </button>
            </div>
          </div>
        </header>

        {currentUser?.role === 'viewer' && (
          <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-2.5 flex items-center justify-between text-indigo-800 text-xs font-semibold print:hidden shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500 text-[18px] animate-pulse">lock</span>
              <span>
                Bạn đang đăng nhập với quyền <strong>Khách xem (Chỉ đọc)</strong>. Bạn có thể xem tài liệu, tải file Word/PDF nhưng không thể sửa đổi dữ liệu hoặc sử dụng AI.
              </span>
            </div>
          </div>
        )}

        {editingDocId && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex justify-between items-center text-amber-800 text-sm font-medium print:hidden shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">edit_document</span>
              <span>
                {activeSet 
                  ? <>Bạn đang chỉnh sửa chứng từ thuộc Bộ: <strong>{activeSet.title}</strong>. Khi lưu, dữ liệu sẽ được cập nhật trực tiếp vào tệp cũ.</>
                  : <>Bạn đang chỉnh sửa chứng từ. Khi lưu, dữ liệu sẽ được cập nhật trực tiếp vào tệp cũ.</>
                }
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setEditingDocId(null);
                  setActiveTab(previousTab);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                Quay lại {previousTab === 'dashboard' ? 'Tổng quan' : 'Bộ chứng từ'}
              </button>
              <button 
                onClick={() => {
                  setEditingDocId(null);
                }}
                className="text-amber-600 hover:text-amber-800 text-xs font-bold hover:underline"
              >
                Thoát chế độ sửa
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
        {activeTab === 'document-sets' ? (
          <motion.div key="sets" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
            <SetList 
              currentUser={currentUser}
              onEditDocument={handleEditDocument}
              onNavigateWithPrefill={handleNavigateWithPrefill}
              initialSelectedSet={activeSet}
              onSelectSet={setActiveSet}
            />
          </motion.div>
        ) : activeTab === 'dashboard' ? (
          <motion.div key="dash" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
            <Dashboard 
              activeWorkspace={activeWorkspace} 
              setActiveTab={setActiveTab} 
              onViewDocument={handleViewDocument} 
            />
          </motion.div>
        ) : activeTab === 'quote' ? (
          <motion.div 
            key="quote"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="h-[calc(100vh-72px)] w-full overflow-hidden"
          >
            {isMobile ? (
              <div className="h-full w-full overflow-y-auto pb-24">
                {mobileView === 'form' ? (
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-[#f8fafc] print:hidden border-none p-0 m-0">
                    <QuoteForm
                      data={quoteData}
                      onUpdate={handleUpdateData}
                      onUpdateItem={handleUpdateItem}
                      onAddItem={handleAddItem}
                      onRemoveItem={handleRemoveItem}
                      activeWorkspace={activeWorkspace}
                    />
                  </fieldset>
                ) : (
                  <div className="h-full bg-[#1e293b] p-4 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('quote', quoteData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('quote-preview-content', `BaoGia_${quoteData.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <QuotePreview data={quoteData} />
                  </div>
                )}
              </div>
            ) : (
              <PanelGroup direction="horizontal">
                <Panel defaultSize={55} minSize={30}>
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-[#f8fafc] print:hidden border-none p-0 m-0">
                    <QuoteForm
                      data={quoteData}
                      onUpdate={handleUpdateData}
                      onUpdateItem={handleUpdateItem}
                      onAddItem={handleAddItem}
                      onRemoveItem={handleRemoveItem}
                      activeWorkspace={activeWorkspace}
                    />
                  </fieldset>
                </Panel>

                {/* Resize Handle - Professional look */}
                <PanelResizeHandle className="w-1 bg-slate-200 hover:bg-blue-500 hover:w-1.5 transition-all cursor-col-resize z-40 flex flex-col justify-center items-center group print:hidden">
                  <div className="h-8 w-1 bg-slate-300 rounded-full group-hover:bg-white transition-colors" />
                </PanelResizeHandle>

                <Panel defaultSize={45} minSize={30}>
                  <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('quote', quoteData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('quote-preview-content', `BaoGia_${quoteData.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <QuotePreview data={quoteData} />
                  </div>
                </Panel>
              </PanelGroup>
            )}
          </motion.div>
        ) : activeTab === 'contract' ? (
          <motion.div key="contract" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            {isMobile ? (
              <div className="h-full w-full overflow-y-auto pb-24">
                {mobileView === 'form' ? (
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative border-none p-0 m-0">
                    <ContractForm
                      data={contractData}
                      onUpdate={handleUpdateContractData}
                      onUpdateItem={handleUpdateContractItem}
                      onAddItem={handleAddContractItem}
                      onRemoveItem={handleRemoveContractItem}
                      onUpdateClause={handleUpdateContractClause}
                      onAddClause={handleAddContractClause}
                      onRemoveClause={handleRemoveContractClause}
                      activeWorkspace={activeWorkspace}
                    />
                  </fieldset>
                ) : (
                  <div className="h-full bg-[#1e293b] p-4 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('contract', contractData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('contract-preview-content', `${contractData.documentType === 'appendix' ? 'PhuLuc' : 'HopDong'}_${contractData.id.replace(/\//g, '_')}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <ContractPreview data={contractData} />
                  </div>
                )}
              </div>
            ) : (
              <PanelGroup direction="horizontal" className="h-full w-full">
                <Panel defaultSize={55} minSize={30}>
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative border-none p-0 m-0">
                    <ContractForm
                      data={contractData}
                      onUpdate={handleUpdateContractData}
                      onUpdateItem={handleUpdateContractItem}
                      onAddItem={handleAddContractItem}
                      onRemoveItem={handleRemoveContractItem}
                      onUpdateClause={handleUpdateContractClause}
                      onAddClause={handleAddContractClause}
                      onRemoveClause={handleRemoveContractClause}
                      activeWorkspace={activeWorkspace}
                    />
                  </fieldset>
                </Panel>
                
                <PanelResizeHandle className="w-1.5 bg-slate-200/50 hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500" />
                
                <Panel defaultSize={45} minSize={30}>
                  <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('contract', contractData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('contract-preview-content', `${contractData.documentType === 'appendix' ? 'PhuLuc' : 'HopDong'}_${contractData.id.replace(/\//g, '_')}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <ContractPreview data={contractData} />
                  </div>
                </Panel>
              </PanelGroup>
            )}
          </motion.div>
        ) : activeTab === 'delivery' ? (
          <motion.div key="delivery" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            {isMobile ? (
              <div className="h-full w-full overflow-y-auto pb-24">
                {mobileView === 'form' ? (
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative border-none p-0 m-0">
                    <DeliveryReceiptForm
                      data={deliveryData}
                      onUpdate={handleUpdateDeliveryData}
                      onUpdateItem={handleUpdateDeliveryItem}
                      onAddItem={handleAddDeliveryItem}
                      onRemoveItem={handleRemoveDeliveryItem}
                    />
                  </fieldset>
                ) : (
                  <div className="h-full bg-[#1e293b] p-4 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('delivery', deliveryData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('delivery-preview-content', `PhieuXuatKho_${deliveryData.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <DeliveryReceiptPreview data={deliveryData} />
                  </div>
                )}
              </div>
            ) : (
              <PanelGroup direction="horizontal" className="h-full w-full">
                <Panel defaultSize={55} minSize={30}>
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative border-none p-0 m-0">
                    <DeliveryReceiptForm
                      data={deliveryData}
                      onUpdate={handleUpdateDeliveryData}
                      onUpdateItem={handleUpdateDeliveryItem}
                      onAddItem={handleAddDeliveryItem}
                      onRemoveItem={handleRemoveDeliveryItem}
                    />
                  </fieldset>
                </Panel>
                
                <PanelResizeHandle className="w-1.5 bg-slate-200/50 hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500" />
                
                <Panel defaultSize={45} minSize={30}>
                  <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('delivery', deliveryData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('delivery-preview-content', `PhieuXuatKho_${deliveryData.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <DeliveryReceiptPreview data={deliveryData} />
                  </div>
                </Panel>
              </PanelGroup>
            )}
          </motion.div>
        ) : activeTab === 'payment' ? (
          <motion.div key="payment" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            {isMobile ? (
              <div className="h-full w-full overflow-y-auto pb-24">
                {mobileView === 'form' ? (
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative border-none p-0 m-0">
                    <PaymentRequestForm
                      data={paymentData}
                      onUpdate={handleUpdatePaymentData}
                      onUpdateItem={handleUpdatePaymentItem}
                      onAddItem={handleAddPaymentItem}
                      onRemoveItem={handleRemovePaymentItem}
                      activeWorkspace={activeWorkspace}
                    />
                  </fieldset>
                ) : (
                  <div className="h-full bg-[#1e293b] p-4 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('payment', paymentData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('payment-preview-content', `DeNghiThanhToan_${paymentData.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <PaymentRequestPreview data={paymentData} />
                  </div>
                )}
              </div>
            ) : (
              <PanelGroup direction="horizontal" className="h-full w-full">
                <Panel defaultSize={55} minSize={30}>
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative border-none p-0 m-0">
                    <PaymentRequestForm
                      data={paymentData}
                      onUpdate={handleUpdatePaymentData}
                      onUpdateItem={handleUpdatePaymentItem}
                      onAddItem={handleAddPaymentItem}
                      onRemoveItem={handleRemovePaymentItem}
                      activeWorkspace={activeWorkspace}
                    />
                  </fieldset>
                </Panel>
                
                <PanelResizeHandle className="w-1.5 bg-slate-200/50 hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500" />
                
                <Panel defaultSize={45} minSize={30}>
                  <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('payment', paymentData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('payment-preview-content', `DeNghiThanhToan_${paymentData.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <PaymentRequestPreview data={paymentData} />
                  </div>
                </Panel>
              </PanelGroup>
            )}
          </motion.div>
        ) : activeTab === 'advance' ? (
          <motion.div key="advance" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            {isMobile ? (
              <div className="h-full w-full overflow-y-auto pb-24">
                {mobileView === 'form' ? (
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative border-none p-0 m-0">
                    <AdvanceRequestForm
                      data={advanceData}
                      onUpdate={handleUpdateAdvanceData}
                      activeWorkspace={activeWorkspace}
                    />
                  </fieldset>
                ) : (
                  <div className="h-full bg-[#1e293b] p-4 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('advance', advanceData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('advance-preview-content', `DeNghiTamUng_${advanceData.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <AdvanceRequestPreview data={advanceData} />
                  </div>
                )}
              </div>
            ) : (
              <PanelGroup direction="horizontal" className="h-full w-full">
                <Panel defaultSize={55} minSize={30}>
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative border-none p-0 m-0">
                    <AdvanceRequestForm
                      data={advanceData}
                      onUpdate={handleUpdateAdvanceData}
                      activeWorkspace={activeWorkspace}
                    />
                  </fieldset>
                </Panel>
                
                <PanelResizeHandle className="w-1.5 bg-slate-200/50 hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500" />
                
                <Panel defaultSize={45} minSize={30}>
                  <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('advance', advanceData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('advance-preview-content', `DeNghiTamUng_${advanceData.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <AdvanceRequestPreview data={advanceData} />
                  </div>
                </Panel>
              </PanelGroup>
            )}
          </motion.div>
        ) : activeTab === 'order-confirm' ? (
          <motion.div key="order-confirm" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            {isMobile ? (
              <div className="h-full w-full overflow-y-auto pb-24">
                {mobileView === 'form' ? (
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative border-none p-0 m-0">
                    <OrderConfirmationForm
                      data={orderConfirmData}
                      onUpdate={handleUpdateOrderConfirmData}
                      onUpdateItem={handleUpdateOrderConfirmItem}
                      onAddItem={handleAddOrderConfirmItem}
                      onRemoveItem={handleRemoveOrderConfirmItem}
                      onUpdateClause={handleUpdateOrderConfirmClause}
                      onAddClause={handleAddOrderConfirmClause}
                      onRemoveClause={handleRemoveOrderConfirmClause}
                      activeWorkspace={activeWorkspace}
                    />
                  </fieldset>
                ) : (
                  <div className="h-full bg-[#1e293b] p-4 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('order_confirm', orderConfirmData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('order-confirm-preview-content', `XacNhanDatHang_${orderConfirmData.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <OrderConfirmationPreview data={orderConfirmData} />
                  </div>
                )}
              </div>
            ) : (
              <PanelGroup direction="horizontal" className="h-full w-full">
                <Panel defaultSize={55} minSize={30}>
                  <fieldset disabled={currentUser?.role === 'viewer'} className="h-full w-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative border-none p-0 m-0">
                    <OrderConfirmationForm
                      data={orderConfirmData}
                      onUpdate={handleUpdateOrderConfirmData}
                      onUpdateItem={handleUpdateOrderConfirmItem}
                      onAddItem={handleAddOrderConfirmItem}
                      onRemoveItem={handleRemoveOrderConfirmItem}
                      onUpdateClause={handleUpdateOrderConfirmClause}
                      onAddClause={handleAddOrderConfirmClause}
                      onRemoveClause={handleRemoveOrderConfirmClause}
                      activeWorkspace={activeWorkspace}
                    />
                  </fieldset>
                </Panel>
                
                <PanelResizeHandle className="w-1.5 bg-slate-200/50 hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500" />
                
                <Panel defaultSize={45} minSize={30}>
                  <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                      <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                      <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                          title="Lưu vào Bộ Chứng từ"
                          onClick={() => handleOpenSaveModal('order_confirm', orderConfirmData)}
                        >
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                        </button>
                      )}
                      <button
                        className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                        title="Tải xuống Word"
                        onClick={() => exportHTMLToWord('order-confirm-preview-content', `XacNhanDatHang_${orderConfirmData.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                        <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                      </button>
                    </div>
                    <OrderConfirmationPreview data={orderConfirmData} />
                  </div>
                </Panel>
              </PanelGroup>
            )}
          </motion.div>
        ) : activeTab === 'settings' ? (
          <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 custom-scrollbar-light">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col gap-1 mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Cài Đặt Hệ Thống</h2>
                <p className="text-slate-500 text-sm">Quản lý tài khoản, phân quyền không gian làm việc và cấu hình thông tin cá nhân.</p>
              </div>
              <SettingsPanel currentUser={currentUser} activeWorkspace={activeWorkspace} />
            </div>
          </motion.div>
        ) : activeTab === 'customer' ? (
          <motion.div key="customer" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
            <CustomerManager onCreateDocument={handleCreateDocumentFromCustomer} />
          </motion.div>
        ) : activeTab === 'ai-studio' ? (
          <motion.div key="ai-studio" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            <AIDocumentStudio 
              onSaveToSet={(type, data) => handleOpenSaveModal(type, data)} 
            />
          </motion.div>
        ) : (
          <motion.div key="default" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center h-[calc(100vh-72px)] overflow-y-auto bg-slate-50">
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full">
              <span className="material-symbols-outlined text-[64px] text-slate-300 mb-6 block">construction</span>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Tính năng đang phát triển</h2>
              <p className="text-slate-500 text-sm">Vui lòng chọn "Tổng quan" hoặc "Báo Giá" ở menu bên trái để trải nghiệm công cụ làm chứng từ chuyên nghiệp.</p>
              <button
                className="mt-8 px-6 py-2.5 bg-[#0e7490] hover:bg-[#164e63] text-white font-medium rounded-lg shadow-sm transition-colors w-full"
                onClick={() => setActiveTab('quote')}
              >
                Trở về Bảng Báo Giá
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* Mobile view switcher for editing panels */}
      {isMobile && ['quote', 'contract', 'delivery', 'payment', 'advance', 'order-confirm'].includes(activeTab) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full shadow-xl px-2 py-1.5 flex items-center gap-1.5 z-40 print:hidden animate-slide-up">
          <button 
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${mobileView === 'form' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setMobileView('form')}
          >
            Nhập liệu
          </button>
          <button 
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${mobileView === 'preview' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setMobileView('preview')}
          >
            Xem trước
          </button>
        </div>
      )}

      {/* Modal Lưu Chứng Từ */}
      <SaveToSetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        documentType={saveModalType}
        documentData={saveModalData}
        defaultSetId={activeSet?.id}
      />

      {/* Trợ lý AI toàn cầu */}
      <AICopilot contextType={currentContext.type} contextData={currentContext.data} />
    </div>
  )
}

export default App

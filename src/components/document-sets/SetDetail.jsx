import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import QuotePreview from '../QuotePreview';
import ContractPreview from '../ContractPreview';
import DeliveryReceiptPreview from '../DeliveryReceiptPreview';
import PaymentRequestPreview from '../PaymentRequestPreview';
import AdvanceRequestPreview from '../AdvanceRequestPreview';
import OrderConfirmationPreview from '../OrderConfirmationPreview';
import AIDocumentStudio from '../AIDocumentStudio';
import { exportHTMLToWord } from '../../utils/exportToWord';
import { performSync, prefillFromSetCustomer } from '../../utils/documentMapper';

export default function SetDetail({ currentUser, set, onBack, onEditDocument, onNavigateWithPrefill }) {
  const { activeWorkspace } = useWorkspace();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [isAiMode, setIsAiMode] = useState(false);

  // Thông tin đối tác header
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);

  // Accordion: set các orderNumber đang mở
  const [openOrders, setOpenOrders] = useState(new Set([1]));

  // Di chuyển chứng từ nội bộ (đổi đơn hàng)
  const [movingDocId, setMovingDocId] = useState(null);

  // Chế độ chọn nhiều & di chuyển sang bộ khác
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState(new Set());
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [allSets, setAllSets] = useState([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [targetSetId, setTargetSetId] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [moveResult, setMoveResult] = useState(null);

  // Modal đồng bộ
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncTargetOrder, setSyncTargetOrder] = useState(1);
  const [targetType, setTargetType] = useState('contract');
  const [selectedSourceId, setSelectedSourceId] = useState('');

  // Modal ký số
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signingParty, setSigningParty] = useState('A');
  const [signatureType, setSignatureType] = useState('draw');
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState('Great Vibes');

  // Modal Email
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ toEmail: '', subject: '', messageBody: '' });
  const [emailLogs, setEmailLogs] = useState([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailLogsLoading, setEmailLogsLoading] = useState(false);

  // Batch sync
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);

  /* ========== DATA FETCHING ========== */
  const fetchDocuments = () => {
    setLoading(true);
    fetch(`/api/saved-documents?setId=${set.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDocuments(data.data);
          // Mở tất cả đơn hàng lúc đầu
          const orders = [...new Set(data.data.map(d => d.orderNumber || 1))];
          setOpenOrders(new Set(orders));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchAllSets = () => {
    if (!activeWorkspace) return;
    setLoadingSets(true);
    fetch(`/api/document-sets?companyId=${activeWorkspace.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAllSets(data.data.filter(s => s.id !== set.id));
        setLoadingSets(false);
      })
      .catch(() => setLoadingSets(false));
  };

  useEffect(() => { if (set) fetchDocuments(); }, [set]);
  useEffect(() => { if (!isSelectMode) setSelectedDocIds(new Set()); }, [isSelectMode]);

  // Canvas drawing logic for digital signature
  const isDrawing = React.useRef(false);
  const lastX = React.useRef(0);
  const lastY = React.useRef(0);

  const startDrawing = (e) => {
    isDrawing.current = true;
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    lastX.current = clientX - rect.left;
    lastY.current = clientY - rect.top;
  };

  const drawSignaturePoint = (e) => {
    if (!isDrawing.current) return;
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = '#1e3a8a'; // Xanh mực bút ký
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    lastX.current = currentX;
    lastY.current = currentY;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignature = async () => {
    let base64 = '';
    if (signatureType === 'draw') {
      const canvas = document.getElementById('signature-canvas');
      if (canvas) {
        base64 = canvas.toDataURL('image/png');
      }
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let fontName = 'Great Vibes';
        if (selectedFont === 'Caveat') fontName = 'Caveat';
        else if (selectedFont === 'Pacifico') fontName = 'Pacifico';
        
        ctx.font = `italic 48px "${fontName}", cursive`;
        ctx.fillStyle = '#1e3a8a'; // Ink color
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName || currentUser?.fullName || 'Bút ký', canvas.width / 2, canvas.height / 2);
        base64 = canvas.toDataURL('image/png');
      }
    }

    if (!base64 || base64.length < 1000) {
      alert('Vui lòng vẽ chữ ký hoặc nhập họ tên hợp lệ.');
      return;
    }

    try {
      const updatedData = {
        ...viewingDoc.data,
        [`signature${signingParty}`]: base64
      };

      const res = await fetch(`/api/saved-documents/${viewingDoc.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-username': currentUser.username
        },
        body: JSON.stringify({ data: updatedData })
      });
      const resData = await res.json();
      if (resData.success) {
        alert('Đã ký số thành công!');
        setIsSignModalOpen(false);
        fetchDocuments();
        setViewingDoc(prev => ({ ...prev, data: updatedData }));
      } else {
        alert('Lỗi lưu chữ ký: ' + resData.message);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi lưu chữ ký.');
    }
  };

  const openEmailModal = async (doc) => {
    let clientEmail = '';
    if (set.customerInfo?.email) {
      clientEmail = set.customerInfo.email;
    }
    
    setEmailForm({
      toEmail: clientEmail,
      subject: `[DocManager] Chứng từ ${getTypeLabel(doc.type).label} - Số: ${doc.data.id || doc.id}`,
      messageBody: `Kính gửi đối tác,\n\nChúng tôi xin gửi tài liệu "${doc.documentName}" thuộc bộ hồ sơ "${set.title}".\n\nTrạng thái hiện tại: ${doc.status}.\nVui lòng kiểm tra thông tin đính kèm.\n\nTrân trọng,\nĐội ngũ QVN.`
    });
    setIsEmailModalOpen(true);
    fetchEmailLogs(doc.id);
  };

  const fetchEmailLogs = async (docId) => {
    setEmailLogsLoading(true);
    try {
      const res = await fetch(`/api/saved-documents/${docId}/email-logs`);
      const resData = await res.json();
      if (resData.success) {
        setEmailLogs(resData.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEmailLogsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.toEmail) {
      alert('Vui lòng nhập địa chỉ email người nhận.');
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await fetch(`/api/saved-documents/${viewingDoc.id}/send-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-username': currentUser.username
        },
        body: JSON.stringify(emailForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Gửi email thành công (Mô phỏng)!');
        fetchEmailLogs(viewingDoc.id);
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi mạng khi gửi email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleBatchSync = async () => {
    const quoteDoc = documents.find(d => d.type === 'quote');
    if (!quoteDoc) return;

    if (!window.confirm('Hệ thống sẽ tự động tạo các chứng từ liên kết còn thiếu (Xác nhận đặt hàng, Hợp đồng, Đề nghị tạm ứng, Phiếu xuất kho, Đề nghị thanh toán) lấy dữ liệu từ Báo giá. Bạn có chắc muốn tiếp tục?')) {
      return;
    }

    setIsBatchSyncing(true);
    try {
      const flow = [
        { type: 'order_confirm', name: `Xác nhận đặt hàng theo BG-${quoteDoc.data.id}` },
        { type: 'contract', name: `Hợp đồng kinh tế theo BG-${quoteDoc.data.id}` },
        { type: 'advance', name: `Đề nghị tạm ứng theo BG-${quoteDoc.data.id}` },
        { type: 'delivery', name: `Phiếu xuất kho theo BG-${quoteDoc.data.id}` },
        { type: 'payment', name: `Đề nghị thanh toán theo BG-${quoteDoc.data.id}` }
      ];

      const companyId = set.companyId || activeWorkspace?.id;
      if (!companyId) throw new Error('Không xác định được Workspace');

      let createdCount = 0;

      for (const step of flow) {
        const exists = documents.some(d => d.type === step.type);
        if (exists) continue;

        let prefilledData = performSync(quoteDoc.type, step.type, quoteDoc.data);
        if (!prefilledData) {
          if (step.type === 'advance' || step.type === 'payment') {
            const mockContractData = performSync('quote', 'contract', quoteDoc.data);
            prefilledData = performSync('contract', step.type, mockContractData);
          } else {
            prefilledData = performSync(quoteDoc.type, step.type, quoteDoc.data);
          }
        }

        if (prefilledData) {
          const apiTypeMap = { 'order-confirm': 'order_confirm', 'quote': 'quote', 'contract': 'contract', 'delivery': 'delivery', 'advance': 'advance', 'payment': 'payment' };
          const apiType = apiTypeMap[step.type] || step.type;
          
          const nextIdRes = await fetch(`/api/saved-documents/next-id?companyId=${companyId}&type=${apiType}`);
          const nextIdData = await nextIdRes.json();
          if (nextIdData.success && nextIdData.nextId) {
            prefilledData.id = nextIdData.nextId;
          }

          const createRes = await fetch('/api/saved-documents', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-username': currentUser.username
            },
            body: JSON.stringify({
              setId: set.id,
              companyId,
              type: step.type,
              documentName: step.name,
              data: prefilledData,
              orderNumber: 1,
              status: step.type === 'order_confirm' ? 'Chờ xác nhận' :
                      step.type === 'contract' ? 'Đang soạn' :
                      step.type === 'delivery' ? 'Nháp' : 'Chờ duyệt'
            })
          });
          const createResult = await createRes.json();
          if (createResult.success) {
            createdCount++;
          }
        }
      }

      alert(`Đã tự động tạo thành công ${createdCount} chứng từ liên kết!`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi tạo chuỗi chứng từ liên kết.');
    } finally {
      setIsBatchSyncing(false);
    }
  };

  /* ========== GROUPING ========== */
  const groupedByOrder = documents.reduce((acc, doc) => {
    const order = doc.orderNumber || 1;
    if (!acc[order]) acc[order] = [];
    acc[order].push(doc);
    return acc;
  }, {});
  const orderNumbers = Object.keys(groupedByOrder).map(Number).sort((a, b) => a - b);
  const maxOrderNumber = orderNumbers.length > 0 ? Math.max(...orderNumbers) : 0;

  /* ========== HANDLERS ========== */
  const toggleOrder = (n) => {
    setOpenOrders(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chứng từ này khỏi bộ?')) return;
    await fetch(`/api/saved-documents/${docId}`, { method: 'DELETE' });
    fetchDocuments();
    if (viewingDoc?.id === docId) setViewingDoc(null);
  };

  const handleChangeOrder = async (docId, newOrder) => {
    await fetch(`/api/saved-documents/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber: newOrder })
    });
    setMovingDocId(null);
    fetchDocuments();
  };

  const toggleSelectDoc = (docId) => {
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      next.has(docId) ? next.delete(docId) : next.add(docId);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedDocIds(prev =>
      prev.size === documents.length ? new Set() : new Set(documents.map(d => d.id))
    );
  };

  const openMoveModal = () => {
    if (selectedDocIds.size === 0) return;
    fetchAllSets();
    setTargetSetId('');
    setMoveResult(null);
    setIsMoveModalOpen(true);
  };

  const handleBatchMove = async () => {
    if (!targetSetId || selectedDocIds.size === 0) return;
    setIsMoving(true);
    try {
      const res = await fetch('/api/saved-documents/batch-move', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docIds: Array.from(selectedDocIds), targetSetId })
      });
      const data = await res.json();
      setMoveResult({ success: data.success, message: data.message });
      if (data.success) {
        fetchDocuments();
        setSelectedDocIds(new Set());
        setIsSelectMode(false);
        if (viewingDoc && selectedDocIds.has(viewingDoc.id)) setViewingDoc(null);
      }
    } catch {
      setMoveResult({ success: false, message: 'Lỗi kết nối khi di chuyển chứng từ.' });
    } finally {
      setIsMoving(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const defaultStyle = 'bg-slate-800 text-slate-300 border-slate-700';
    const styles = {
      'Đã ký': 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
      'Đã duyệt': 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
      'Đã giao': 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
      'Xác nhận': 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
      'Đã gửi': 'bg-blue-950/40 text-blue-400 border-blue-800',
      'Đang thương thảo': 'bg-indigo-950/40 text-indigo-400 border-indigo-800',
      'Đang giao': 'bg-cyan-950/40 text-cyan-400 border-cyan-800',
      'Đã thanh toán': 'bg-violet-950/40 text-violet-400 border-violet-800',
      'Đã tạm ứng': 'bg-violet-950/40 text-violet-400 border-violet-800',
      'Chờ xác nhận': 'bg-amber-950/40 text-amber-400 border-amber-800',
      'Chờ duyệt': 'bg-amber-950/40 text-amber-400 border-amber-800',
      'Từ chối': 'bg-rose-950/40 text-rose-400 border-rose-800',
      'Đã hủy': 'bg-rose-950/40 text-rose-400 border-rose-800',
      'Đang soạn': 'bg-slate-800 text-slate-400 border-slate-700',
      'Nháp': 'bg-slate-800 text-slate-400 border-slate-700'
    };
    return styles[status] || defaultStyle;
  };

  const handleUpdateStatus = async (docId, newStatus) => {
    try {
      const res = await fetch(`/api/saved-documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchDocuments();
        setViewingDoc(prev => prev && prev.id === docId ? { ...prev, status: newStatus } : prev);
      } else {
        alert('Lỗi khi cập nhật trạng thái: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ để cập nhật trạng thái.');
    }
  };

  const renderStatusActions = (doc) => {
    if (currentUser?.role === 'viewer') return null;

    const currentStatus = doc.status;
    const type = doc.type;

    const actionBtn = (label, targetStatus, colorClass, icon) => (
      <button
        key={targetStatus}
        onClick={() => handleUpdateStatus(doc.id, targetStatus)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${colorClass}`}
      >
        {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
        {label}
      </button>
    );

    const buttons = [];

    if (type === 'quote') {
      if (currentStatus === 'Đang soạn') {
        buttons.push(actionBtn('Gửi Báo Giá', 'Đã gửi', 'bg-blue-600 hover:bg-blue-700 text-white', 'send'));
      } else if (currentStatus === 'Đã gửi') {
        buttons.push(actionBtn('Duyệt', 'Đã duyệt', 'bg-emerald-600 hover:bg-emerald-700 text-white', 'check_circle'));
        buttons.push(actionBtn('Từ Chối', 'Từ chối', 'bg-rose-600 hover:bg-rose-700 text-white', 'cancel'));
      } else {
        buttons.push(actionBtn('Soạn Lại', 'Đang soạn', 'bg-slate-600 hover:bg-slate-700 text-white', 'restart_alt'));
      }
    } else if (type === 'contract') {
      if (currentStatus === 'Đang soạn') {
        buttons.push(actionBtn('Thương Thảo', 'Đang thương thảo', 'bg-indigo-600 hover:bg-indigo-700 text-white', 'forum'));
      } else if (currentStatus === 'Đang thương thảo') {
        buttons.push(actionBtn('Ký Hợp Đồng', 'Đã ký', 'bg-emerald-600 hover:bg-emerald-700 text-white', 'draw'));
        buttons.push(actionBtn('Hủy Hợp Đồng', 'Đã hủy', 'bg-rose-600 hover:bg-rose-700 text-white', 'cancel'));
      } else {
        buttons.push(actionBtn('Soạn Lại', 'Đang soạn', 'bg-slate-600 hover:bg-slate-700 text-white', 'restart_alt'));
      }
    } else if (type === 'order_confirm') {
      if (currentStatus === 'Chờ xác nhận') {
        buttons.push(actionBtn('Xác Nhận Đơn', 'Xác nhận', 'bg-emerald-600 hover:bg-emerald-700 text-white', 'check_circle'));
        buttons.push(actionBtn('Hủy Đơn', 'Đã hủy', 'bg-rose-600 hover:bg-rose-700 text-white', 'cancel'));
      } else {
        buttons.push(actionBtn('Soạn Lại', 'Chờ xác nhận', 'bg-slate-600 hover:bg-slate-700 text-white', 'restart_alt'));
      }
    } else if (type === 'delivery') {
      if (currentStatus === 'Nháp') {
        buttons.push(actionBtn('Bắt Đầu Giao', 'Đang giao', 'bg-blue-600 hover:bg-blue-700 text-white', 'local_shipping'));
      } else if (currentStatus === 'Đang giao') {
        buttons.push(actionBtn('Đã Giao', 'Đã giao', 'bg-emerald-600 hover:bg-emerald-700 text-white', 'check_circle'));
        buttons.push(actionBtn('Hủy Giao', 'Đã hủy', 'bg-rose-600 hover:bg-rose-700 text-white', 'cancel'));
      } else {
        buttons.push(actionBtn('Soạn Lại', 'Nháp', 'bg-slate-600 hover:bg-slate-700 text-white', 'restart_alt'));
      }
    } else if (type === 'payment') {
      if (currentStatus === 'Chờ duyệt') {
        buttons.push(actionBtn('Duyệt Chi', 'Đã duyệt', 'bg-emerald-600 hover:bg-emerald-700 text-white', 'check_circle'));
        buttons.push(actionBtn('Từ Chối', 'Từ chối', 'bg-rose-600 hover:bg-rose-700 text-white', 'cancel'));
      } else if (currentStatus === 'Đã duyệt') {
        buttons.push(actionBtn('Hoàn Thành Chi', 'Đã thanh toán', 'bg-indigo-600 hover:bg-indigo-700 text-white', 'payments'));
      } else {
        buttons.push(actionBtn('Soạn Lại', 'Chờ duyệt', 'bg-slate-600 hover:bg-slate-700 text-white', 'restart_alt'));
      }
    } else if (type === 'advance') {
      if (currentStatus === 'Chờ duyệt') {
        buttons.push(actionBtn('Duyệt Tạm Ứng', 'Đã duyệt', 'bg-emerald-600 hover:bg-emerald-700 text-white', 'check_circle'));
        buttons.push(actionBtn('Từ Chối', 'Từ chối', 'bg-rose-600 hover:bg-rose-700 text-white', 'cancel'));
      } else if (currentStatus === 'Đã duyệt') {
        buttons.push(actionBtn('Hoàn Thành Chi', 'Đã tạm ứng', 'bg-indigo-600 hover:bg-indigo-700 text-white', 'payments'));
      } else {
        buttons.push(actionBtn('Soạn Lại', 'Chờ duyệt', 'bg-slate-600 hover:bg-slate-700 text-white', 'restart_alt'));
      }
    }

    return (
      <div className="flex gap-1.5 items-center">
        {buttons}
      </div>
    );
  };

  /* ========== UTILITIES ========== */
  const getTypeLabel = (type) => {
    const map = {
      quote: { label: 'Báo giá', color: 'bg-blue-100 text-blue-700' },
      contract: { label: 'Hợp đồng', color: 'bg-purple-100 text-purple-700' },
      delivery: { label: 'Xuất kho', color: 'bg-emerald-100 text-emerald-700' },
      payment: { label: 'Thanh toán', color: 'bg-pink-100 text-pink-700' },
      advance: { label: 'Tạm ứng', color: 'bg-amber-100 text-amber-700' },
      order_confirm: { label: 'Đơn hàng', color: 'bg-cyan-100 text-cyan-700' },
      custom_doc: { label: 'Văn bản AI', color: 'bg-indigo-100 text-indigo-700' }
    };
    return map[type] || { label: 'Khác', color: 'bg-slate-100 text-slate-700' };
  };

  const getMappingPreview = (source, target) => {
    if (!source) {
      if (set.customerInfo?.name) {
        return [
          `Tự động điền tên: "${set.customerInfo.name}"`,
          set.customerInfo.address ? `Điền địa chỉ: "${set.customerInfo.address}"` : 'Điền địa chỉ từ hồ sơ bộ',
          set.customerInfo.taxId ? `Điền MST: ${set.customerInfo.taxId}` : 'Điền thông tin liên hệ',
        ].filter(Boolean);
      }
      return ['Tạo chứng từ nháp trắng mới hoàn toàn.'];
    }
    const MAP = {
      'quote-contract': ['Đồng bộ tên khách hàng ➔ Bên B Hợp đồng', 'Ánh xạ danh sách sản phẩm, số lượng, đơn giá', 'Thiết lập điều khoản giao hàng & thanh toán mặc định'],
      'quote-order_confirm': ['Đồng bộ tên đối tác ➔ Bên B (Xác nhận đặt hàng)', 'Sao chép toàn bộ hàng hóa và đơn giá', 'Lấy số Báo giá gốc làm số căn cứ'],
      'contract-advance': ['Đồng bộ Số hợp đồng gốc làm căn cứ tạm ứng', 'Tính toán tổng giá trị đơn hàng sau thuế', 'Tự động tính tiền tạm ứng (mặc định 50%)'],
      'contract-payment': ['Đồng bộ số hợp đồng, bên A, bên B', 'Tính toán tổng giá trị sau thuế', 'Tự động tính phần đã tạm ứng (50%) và số còn lại'],
      'contract-delivery': ['Đồng bộ thông tin khách hàng và địa điểm nhận hàng', 'Sao chép danh sách sản phẩm sang định dạng Xuất kho'],
      'quote-delivery': ['Đồng bộ khách hàng nhận hàng', 'Sao chép danh sách sản phẩm từ Báo giá'],
      'order_confirm-contract': ['Đồng bộ Bên B và đại diện ký kết', 'Sao chép danh sách sản phẩm đặt hàng'],
    };
    return MAP[`${source}-${target}`] || ['Chỉ đồng bộ thông tin khách hàng (nếu có sẵn).'];
  };

  const renderPreview = (doc) => {
    switch (doc.type) {
      case 'quote': return <QuotePreview data={doc.data} />;
      case 'contract': return <ContractPreview data={doc.data} />;
      case 'delivery': return <DeliveryReceiptPreview data={doc.data} />;
      case 'payment': return <PaymentRequestPreview data={doc.data} />;
      case 'advance': return <AdvanceRequestPreview data={doc.data} />;
      case 'order_confirm': return <OrderConfirmationPreview data={doc.data} />;
      case 'custom_doc': return <div className="bg-white p-10 shadow-lg min-h-[297mm] w-[210mm] font-serif text-[14pt]"><div dangerouslySetInnerHTML={{ __html: doc.data.html }} /></div>;
      default: return <div className="text-slate-400 p-8">Không hỗ trợ xem trước loại chứng từ này.</div>;
    }
  };

  const allSelected = documents.length > 0 && selectedDocIds.size === documents.length;
  const someSelected = selectedDocIds.size > 0 && selectedDocIds.size < documents.length;
  const ci = set.customerInfo;

  /* ========== RENDER ========== */
  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50">

      {/* ===== CỘT TRÁI ===== */}
      <div className="w-[360px] min-w-[320px] border-r border-slate-200 bg-white flex flex-col h-full z-10 shadow-[4px_0_15px_rgba(0,0,0,0.02)]">

        {/* Header bộ */}
        <div className="p-4 border-b border-slate-100 flex-shrink-0">
          <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-xs font-medium mb-3 transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Quay lại danh sách Bộ
          </button>

          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-amber-500 flex-shrink-0">folder_open</span>
              <h2 className="text-base font-bold text-slate-800 truncate">{set.title}</h2>
            </div>
          </div>

          {/* Thông tin đơn vị đối tác */}
          {ci?.name ? (
            <div className="mb-3">
              <button
                onClick={() => setShowCustomerInfo(v => !v)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-all text-left"
              >
                <span className="material-symbols-outlined text-blue-500 text-[16px]">business</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-blue-700 truncate">{ci.name}</div>
                  {!showCustomerInfo && ci.phone && (
                    <div className="text-[10px] text-blue-500">{ci.phone}{ci.taxId ? ` • MST: ${ci.taxId}` : ''}</div>
                  )}
                </div>
                <span className="material-symbols-outlined text-blue-400 text-[16px] flex-shrink-0">
                  {showCustomerInfo ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showCustomerInfo && (
                <div className="mt-1.5 px-3 py-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col gap-1.5 text-xs text-slate-600">
                  {ci.address && <div className="flex gap-2"><span className="material-symbols-outlined text-[12px] text-slate-400 mt-0.5">location_on</span>{ci.address}</div>}
                  {ci.taxId && <div className="flex gap-2"><span className="material-symbols-outlined text-[12px] text-slate-400 mt-0.5">receipt</span>MST: {ci.taxId}</div>}
                  {ci.contactPerson && <div className="flex gap-2"><span className="material-symbols-outlined text-[12px] text-slate-400 mt-0.5">person</span>{ci.contactPerson}</div>}
                  {ci.phone && <div className="flex gap-2"><span className="material-symbols-outlined text-[12px] text-slate-400 mt-0.5">phone</span>{ci.phone}</div>}
                  {ci.email && <div className="flex gap-2"><span className="material-symbols-outlined text-[12px] text-slate-400 mt-0.5">mail</span>{ci.email}</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-3 px-3 py-2 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">business</span>
              Chưa có thông tin đơn vị đối tác
            </div>
          )}

          {/* Actions */}
          {currentUser?.role !== 'viewer' && (
            <div className="flex flex-col gap-2">
              <button onClick={() => { setViewingDoc(null); setIsAiMode(true); }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Soạn văn bản AI
              </button>

              <div className="flex gap-2">
                <button onClick={() => { setSelectedSourceId(''); setSyncTargetOrder(maxOrderNumber + 1); setIsSyncModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-xs font-bold">
                  <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                  Đồng bộ & Tạo mới
                </button>

                <button onClick={() => setIsSelectMode(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all
                    ${isSelectMode ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  <span className="material-symbols-outlined text-[14px]">drive_file_move</span>
                  {isSelectMode ? 'Thoát' : 'Di chuyển'}
                </button>
              </div>

              {documents.some(d => d.type === 'quote') && currentUser?.role !== 'viewer' && (
                <button onClick={handleBatchSync} disabled={isBatchSyncing}
                  className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all text-xs font-black uppercase tracking-wider mt-2.5">
                  {isBatchSyncing ? (
                    <>
                      <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                      Đang tạo chuỗi liên kết...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[15px]">auto_stories</span>
                      Tạo nhanh chuỗi chứng từ liên kết
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Thanh chọn nhiều */}
        {isSelectMode && (
          <div className="px-3 py-2 bg-orange-50 border-b border-orange-100 flex items-center justify-between flex-shrink-0">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-orange-700 select-none">
              <input type="checkbox" checked={allSelected} ref={el => { if (el) el.indeterminate = someSelected; }}
                onChange={handleSelectAll} className="w-3.5 h-3.5 rounded accent-orange-500" />
              {selectedDocIds.size > 0 ? `Đã chọn ${selectedDocIds.size}/${documents.length}` : 'Chọn tất cả'}
            </label>
            <button onClick={openMoveModal} disabled={selectedDocIds.size === 0}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all
                ${selectedDocIds.size > 0 ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
              <span className="material-symbols-outlined text-[13px]">drive_file_move</span>
              Chuyển ({selectedDocIds.size})
            </button>
          </div>
        )}

        {/* Danh sách nhóm theo Đơn hàng */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Đang tải chứng từ...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <span className="material-symbols-outlined text-[40px] text-slate-200 block mb-2">inbox</span>
              Bộ chứng từ này đang trống
            </div>
          ) : (
            <>
              {orderNumbers.map(orderNum => {
                const docs = groupedByOrder[orderNum] || [];
                const isOpen = openOrders.has(orderNum);
                return (
                  <div key={orderNum} className="rounded-xl border border-slate-200 bg-white">
                    {/* Header đơn hàng */}
                    <button
                      onClick={() => toggleOrder(orderNum)}
                      className={`w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-xl ${!isOpen ? 'rounded-b-xl' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-500">inventory_2</span>
                        <span className="font-bold text-slate-700 text-sm">Đơn hàng {orderNum}</span>
                        <span className="text-xs text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full">
                          {docs.length} chứng từ
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Nút đồng bộ từ đơn hàng này */}
                        {currentUser?.role !== 'viewer' && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedSourceId('');
                              setSyncTargetOrder(orderNum);
                              setIsSyncModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2 py-0.5 rounded-full transition-colors"
                            title="Thêm chứng từ vào đơn hàng này"
                          >
                            + Thêm vào đây
                          </button>
                        )}
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">
                          {isOpen ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </button>

                    {/* Danh sách chứng từ trong đơn hàng */}
                    {isOpen && (
                      <div className="divide-y divide-slate-100">
                        {docs.map(doc => {
                          const typeInfo = getTypeLabel(doc.type);
                          const isSelected = selectedDocIds.has(doc.id);
                          const isViewing = viewingDoc?.id === doc.id && !isAiMode;
                          return (
                            <div
                              key={doc.id}
                              className={`px-4 py-3 cursor-pointer transition-colors group last:rounded-b-xl
                                ${isSelectMode && isSelected ? 'bg-orange-50' : ''}
                                ${!isSelectMode && isViewing ? 'bg-cyan-50' : ''}
                                ${!isSelected && !isViewing ? 'hover:bg-slate-50' : ''}
                              `}
                              onClick={() => {
                                if (isSelectMode) toggleSelectDoc(doc.id);
                                else { setIsAiMode(false); setViewingDoc(doc); }
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {isSelectMode && (
                                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelectDoc(doc.id)}
                                      onClick={e => e.stopPropagation()} className="w-3.5 h-3.5 accent-orange-500 flex-shrink-0" />
                                  )}
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${typeInfo.color}`}>
                                    {typeInfo.label}
                                  </span>
                                  <span className="text-sm font-semibold text-slate-700 truncate" title={doc.documentName}>
                                    {doc.documentName}
                                  </span>
                                </div>

                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ml-auto mr-1 group-hover:hidden ${
                                  doc.status === 'Đã ký' || doc.status === 'Đã duyệt' || doc.status === 'Đã giao' || doc.status === 'Xác nhận' || doc.status === 'Đã thanh toán' || doc.status === 'Đã tạm ứng'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                                    : doc.status === 'Từ chối' || doc.status === 'Đã hủy'
                                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                                    : doc.status === 'Đang soạn' || doc.status === 'Nháp'
                                    ? 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
                                }`}>
                                  {doc.status}
                                </span>

                                {!isSelectMode && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    {currentUser?.role !== 'viewer' && (
                                      <>
                                        {/* Chuyển đơn hàng */}
                                        <div className="relative">
                                          <button
                                            onClick={e => { e.stopPropagation(); setMovingDocId(movingDocId === doc.id ? null : doc.id); }}
                                            className="text-slate-400 hover:text-amber-500 transition-colors p-0.5"
                                            title="Chuyển sang đơn hàng khác"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">swap_vert</span>
                                          </button>
                                          {movingDocId === doc.id && (
                                            <div className="absolute right-0 top-6 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 flex flex-col gap-1 min-w-[160px]"
                                              onClick={e => e.stopPropagation()}>
                                              <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">Chuyển sang đơn hàng:</div>
                                              {orderNumbers.filter(n => n !== orderNum).map(n => (
                                                <button key={n} onClick={() => handleChangeOrder(doc.id, n)}
                                                  className="text-left px-3 py-1.5 text-xs hover:bg-blue-50 text-blue-600 rounded-lg font-medium flex items-center gap-1.5">
                                                  <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                                                  Đơn hàng {n}
                                                </button>
                                              ))}
                                              <button onClick={() => handleChangeOrder(doc.id, maxOrderNumber + 1)}
                                                className="text-left px-3 py-1.5 text-xs hover:bg-emerald-50 text-emerald-600 rounded-lg font-medium flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[12px]">add_box</span>
                                                + Đơn hàng {maxOrderNumber + 1} (mới)
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        {/* Chuyển sang bộ khác */}
                                        <button onClick={e => { e.stopPropagation(); setSelectedDocIds(new Set([doc.id])); setIsSelectMode(true); setTimeout(openMoveModal, 50); }}
                                          className="text-slate-400 hover:text-orange-500 transition-colors p-0.5" title="Chuyển sang bộ khác">
                                          <span className="material-symbols-outlined text-[14px]">drive_file_move</span>
                                        </button>
                                        {/* Sửa */}
                                        <button onClick={e => { e.stopPropagation(); onEditDocument(doc, set); }}
                                          className="text-slate-400 hover:text-[#0ea5e9] transition-colors p-0.5" title="Sửa chứng từ">
                                          <span className="material-symbols-outlined text-[14px]">edit</span>
                                        </button>
                                        {/* Xóa */}
                                        <button onClick={e => { e.stopPropagation(); handleDeleteDoc(doc.id); }}
                                          className="text-slate-400 hover:text-red-500 transition-colors p-0.5" title="Xóa khỏi bộ">
                                          <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 pl-0">
                                {new Date(doc.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit' })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Nút tạo đơn hàng mới */}
              {currentUser?.role !== 'viewer' && (
                <button
                  onClick={() => { setSyncTargetOrder(maxOrderNumber + 1); setSelectedSourceId(''); setIsSyncModalOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">add_box</span>
                  + Tạo Đơn hàng {maxOrderNumber + 1}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== CỘT PHẢI: XEM TRƯỚC ===== */}
      <div className="flex-1 bg-slate-800 flex flex-col h-full overflow-hidden relative">
        {isAiMode ? (
          <AIDocumentStudio
            defaultSetId={set.id}
            onClose={() => setIsAiMode(false)}
            onSaveToSet={async (type, data, setId) => {
              try {
                const res = await fetch('/api/saved-documents', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ companyId: set.companyId, setId: setId || set.id, type, data, documentName: 'Tài liệu AI tự tạo', orderNumber: maxOrderNumber + 1 })
                });
                const result = await res.json();
                if (result.success) { alert('Đã lưu tài liệu thành công!'); setIsAiMode(false); fetchDocuments(); }
                else alert('Lỗi khi lưu: ' + result.message);
              } catch { alert('Lỗi mạng khi lưu tài liệu'); }
            }}
          />
        ) : !viewingDoc ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            {isSelectMode ? (
              <>
                <span className="material-symbols-outlined text-[64px] mb-4 text-orange-200">drive_file_move</span>
                <p className="font-medium text-slate-500">Đang ở chế độ chọn</p>
                <p className="text-sm mt-1">Chọn chứng từ bên trái rồi nhấn <strong>"Chuyển"</strong></p>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[64px] mb-4 text-slate-200">document_scanner</span>
                <p className="text-sm">Chọn một chứng từ bên trái để xem trước</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex justify-center items-start p-6 lg:p-8 custom-scrollbar-dark relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2.5 items-center bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-xl">
              {/* Badge hiển thị trạng thái hiện tại */}
              <div className="flex items-center gap-1.5 border-r border-slate-700/50 pr-3 mr-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái:</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadgeStyle(viewingDoc.status)}`}>
                  {viewingDoc.status}
                </span>
              </div>

              {/* Các nút hành động trực quan để cập nhật trạng thái */}
              {renderStatusActions(viewingDoc)}

              {/* Nút Ký Số */}
              {currentUser?.role !== 'viewer' && ['quote', 'contract', 'order_confirm', 'delivery', 'payment', 'advance'].includes(viewingDoc.type) && (
                <button
                  onClick={() => {
                    if (['contract', 'order_confirm', 'delivery'].includes(viewingDoc.type)) {
                      const ans = window.confirm('Bấm OK để ký với tư cách BÊN BÁN (Bên A), hoặc Cancel để ký với tư cách BÊN MUA (Bên B)?');
                      setSigningParty(ans ? 'A' : 'B');
                    } else {
                      setSigningParty('A');
                    }
                    setTypedName(currentUser?.fullName || '');
                    setIsSignModalOpen(true);
                  }}
                  className="bg-amber-600/20 text-amber-500 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-amber-500/30 hover:bg-amber-600 hover:text-white shadow-sm text-xs font-bold transition-all ml-1"
                  title="Vẽ chữ ký tay hoặc tạo chữ ký tự động"
                >
                  <span className="material-symbols-outlined text-sm font-bold">draw</span>
                  Ký Số
                </button>
              )}

              {/* Nút Gửi Email */}
              {currentUser?.role !== 'viewer' && (
                <button
                  onClick={() => openEmailModal(viewingDoc)}
                  className="bg-emerald-600/20 text-emerald-500 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white shadow-sm text-xs font-bold transition-all ml-1"
                  title="Gửi email chứng từ cho đối tác"
                >
                  <span className="material-symbols-outlined text-sm font-bold">mail</span>
                  Gửi Email
                </button>
              )}

              {/* Nút xuất Word */}
              <button
                className="bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm text-xs font-bold transition-all ml-1"
                onClick={() => { exportHTMLToWord(`preview-container-${viewingDoc.id}`, `${getTypeLabel(viewingDoc.type).label}_${viewingDoc.documentName.replace(/ /g, '_')}`); }}
              >
                <span className="material-symbols-outlined text-sm font-bold">download</span>
                Word
              </button>
            </div>
            <div id={`preview-container-${viewingDoc.id}`} className="w-full max-w-4xl">
              {renderPreview(viewingDoc)}
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL DI CHUYỂN SANG BỘ KHÁC ===== */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-w-[90vw] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-amber-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">drive_file_move</span>
                Chuyển chứng từ sang bộ khác
              </h3>
              <button onClick={() => { setIsMoveModalOpen(false); setMoveResult(null); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Danh sách chứng từ */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chứng từ sẽ được chuyển ({selectedDocIds.size})</div>
                <div className="bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                  {documents.filter(d => selectedDocIds.has(d.id)).map(doc => {
                    const ti = getTypeLabel(doc.type);
                    return (
                      <div key={doc.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-0">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${ti.color}`}>{ti.label}</span>
                        <span className="text-sm text-slate-700 font-medium truncate">{doc.documentName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chọn bộ đích */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn bộ chứng từ đích</div>
                {loadingSets ? (
                  <div className="text-center py-4 text-slate-400 text-sm">Đang tải...</div>
                ) : allSets.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">Không có bộ nào khác.</div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-44 overflow-y-auto">
                    {allSets.map(s => (
                      <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                        ${targetSetId === s.id ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                        <input type="radio" name="targetSet" value={s.id} checked={targetSetId === s.id} onChange={() => setTargetSetId(s.id)} className="accent-orange-500 w-4 h-4" />
                        <span className="material-symbols-outlined text-amber-500 text-[18px]">folder</span>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{s.title}</div>
                          {s.customerInfo?.name && <div className="text-xs text-slate-400">{s.customerInfo.name}</div>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {moveResult && (
                <div className={`flex items-start gap-3 p-4 rounded-xl text-sm font-medium
                  ${moveResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  <span className="material-symbols-outlined text-[20px]">{moveResult.success ? 'check_circle' : 'error'}</span>
                  {moveResult.message}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => { setIsMoveModalOpen(false); setMoveResult(null); }}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                {moveResult?.success ? 'Đóng' : 'Hủy'}
              </button>
              {!moveResult?.success && (
                <button onClick={handleBatchMove} disabled={!targetSetId || isMoving}
                  className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl flex items-center gap-2
                    ${!targetSetId || isMoving ? 'bg-slate-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}>
                  {isMoving
                    ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Đang chuyển...</>
                    : <><span className="material-symbols-outlined text-[16px]">drive_file_move</span> Xác nhận chuyển</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL ĐỒNG BỘ & TẠO CHỨNG TỪ MỚI ===== */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-[550px] max-w-[90vw] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">sync_alt</span>
                Đồng bộ & Tạo chứng từ mới
              </h3>
              <button onClick={() => setIsSyncModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
              {/* Thuộc đơn hàng */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">0. Thuộc Đơn hàng số</label>
                <div className="flex flex-wrap gap-2">
                  {orderNumbers.map(n => (
                    <button key={n} type="button" onClick={() => setSyncTargetOrder(n)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all
                        ${syncTargetOrder === n ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                      Đơn hàng {n}
                    </button>
                  ))}
                  <button type="button" onClick={() => setSyncTargetOrder(maxOrderNumber + 1)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all
                      ${syncTargetOrder === maxOrderNumber + 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-emerald-600 border-emerald-200 hover:border-emerald-400'}`}>
                    + Đơn hàng {maxOrderNumber + 1} (mới)
                  </button>
                </div>
              </div>

              {/* Loại chứng từ */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Chọn loại chứng từ cần tạo</label>
                <select value={targetType} onChange={e => setTargetType(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                  <option value="quote">Báo giá (Quote)</option>
                  <option value="order_confirm">Xác nhận đặt hàng</option>
                  <option value="contract">Hợp đồng (Contract)</option>
                  <option value="advance">Đề nghị tạm ứng</option>
                  <option value="delivery">Phiếu xuất kho</option>
                  <option value="payment">Đề nghị thanh toán</option>
                </select>
              </div>

              {/* Chứng từ nguồn */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Nguồn đồng bộ</label>
                {documents.length === 0 ? (
                  <div className="p-3 bg-slate-50 text-slate-400 text-xs rounded-xl text-center border border-dashed border-slate-200">
                    {set.customerInfo?.name ? `Sẽ dùng thông tin đối tác: "${set.customerInfo.name}"` : 'Tạo tài liệu nháp trắng mới.'}
                  </div>
                ) : (
                  <select value={selectedSourceId} onChange={e => setSelectedSourceId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    <option value="">
                      {set.customerInfo?.name ? `Dùng thông tin bộ: "${set.customerInfo.name}"` : 'Không đồng bộ (Tạo nháp trắng)'}
                    </option>
                    {documents.map(d => (
                      <option key={d.id} value={d.id}>[ĐH{d.orderNumber||1}][{getTypeLabel(d.type).label}] {d.documentName}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Preview */}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  Nội dung sẽ được điền sẵn
                </div>
                <ul className="text-xs text-slate-600 flex flex-col gap-1.5">
                  {getMappingPreview(
                    documents.find(d => d.id === selectedSourceId)?.type,
                    targetType
                  ).map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-green-500 text-[14px] flex-shrink-0 mt-0.5">check_circle</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsSyncModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Hủy
              </button>
              <button
                onClick={async () => {
                  const sourceDoc = documents.find(d => d.id === selectedSourceId);
                  let prefilledData = null;
                  if (sourceDoc) {
                    prefilledData = performSync(sourceDoc.type, targetType, sourceDoc.data);
                  } else if (set.customerInfo?.name) {
                    prefilledData = prefillFromSetCustomer(set.customerInfo, targetType);
                  }
                  
                  if (prefilledData) {
                    try {
                      const apiTypeMap = { 'order-confirm': 'order_confirm', 'quote': 'quote', 'contract': 'contract', 'delivery': 'delivery', 'advance': 'advance', 'payment': 'payment' };
                      const apiType = apiTypeMap[targetType] || targetType;
                      const companyId = set.companyId || activeWorkspace?.id;
                      if (companyId) {
                        const res = await fetch(`/api/saved-documents/next-id?companyId=${companyId}&type=${apiType}`);
                        const resData = await res.json();
                        if (resData.success && resData.nextId) {
                          prefilledData.id = resData.nextId;
                        }
                      }
                    } catch (err) {
                      console.error("Failed to fetch next sequential ID:", err);
                    }
                  }

                  const tabMap = { quote: 'quote', contract: 'contract', delivery: 'delivery', payment: 'payment', advance: 'advance', order_confirm: 'order-confirm' };
                  onNavigateWithPrefill(tabMap[targetType] || 'quote', prefilledData, set);
                  setIsSyncModalOpen(false);
                }}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">done</span>
                Xác nhận & Soạn thảo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL KÝ SỐ ===== */}
      {isSignModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center backdrop-blur-sm animate-fade-in text-slate-800">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-[90vw] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">draw</span>
                Ký số điện tử ({signingParty === 'A' ? 'Bên Bán - Bên A' : 'Bên Mua - Bên B'})
              </h3>
              <button onClick={() => setIsSignModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setSignatureType('draw')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${signatureType === 'draw' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  Vẽ chữ ký tay
                </button>
                <button onClick={() => setSignatureType('text')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${signatureType === 'text' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  Nhập họ tên (Sinh tự động)
                </button>
              </div>

              {signatureType === 'draw' ? (
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-slate-400 italic">Vẽ chữ ký của bạn vào khung bên dưới:</div>
                  <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <canvas
                      id="signature-canvas"
                      width="450"
                      height="200"
                      className="cursor-crosshair w-full"
                      style={{ touchAction: 'none' }}
                      onMouseDown={startDrawing}
                      onMouseMove={drawSignaturePoint}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={drawSignaturePoint}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <button onClick={clearCanvas}
                    className="self-end text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Xóa vẽ lại
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nhập họ tên của bạn</label>
                    <input
                      type="text"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Nguyễn Văn A"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Chọn kiểu chữ ký</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Great Vibes', 'Caveat', 'Pacifico'].map(font => (
                        <button
                          key={font}
                          onClick={() => setSelectedFont(font)}
                          className={`p-2 border rounded-xl text-center text-sm transition-all ${selectedFont === font ? 'border-indigo-500 bg-indigo-50 font-bold shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview typed name */}
                  <div className="border border-dashed border-slate-200 bg-slate-50 rounded-xl p-6 flex items-center justify-center min-h-[100px]">
                    <span style={{ fontFamily: selectedFont, fontSize: '32px', color: '#1e3a8a' }}>
                      {typedName || 'Chữ ký mẫu'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsSignModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Hủy
              </button>
              <button onClick={handleSaveSignature}
                className="px-6 py-2.5 text-sm font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 flex items-center gap-2 shadow-sm transition-all">
                <span className="material-symbols-outlined text-[16px]">draw</span>
                Lưu chữ ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL GỬI EMAIL ===== */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center backdrop-blur-sm animate-fade-in text-slate-800">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-w-[90vw] flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">mail</span>
                Gửi Email Chứng Từ
              </h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 overflow-y-auto text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ email người nhận</label>
                <input
                  type="email"
                  value={emailForm.toEmail}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, toEmail: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="partner@company.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tiêu đề thư</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nội dung email</label>
                <textarea
                  value={emailForm.messageBody}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, messageBody: e.target.value }))}
                  rows="6"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                />
              </div>

              {/* Lịch sử gửi email */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">history</span>
                  Nhật ký gửi thư của chứng từ này
                </div>
                
                {emailLogsLoading ? (
                  <div className="text-center py-4 text-slate-400 text-xs">Đang tải lịch sử gửi thư...</div>
                ) : emailLogs.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">Chưa từng gửi email cho chứng từ này.</div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {emailLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-700">Đến: {log.toEmail}</div>
                          <div className="text-slate-500 truncate mt-0.5" title={log.subject}>Tiêu đề: {log.subject}</div>
                          <div className="text-[10px] text-slate-400 mt-1">Người gửi: @{log.sender} • {new Date(log.sentAt).toLocaleString('vi-VN')}</div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase flex-shrink-0">
                          Đã chuyển
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setIsEmailModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Hủy
              </button>
              <button onClick={handleSendEmail} disabled={isSendingEmail}
                className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all disabled:bg-slate-300">
                {isSendingEmail ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Gửi thư
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

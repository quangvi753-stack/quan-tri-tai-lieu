const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const tabs = [
  { id: 'contract', form: 'ContractForm', data: 'contractData', preview: 'ContractPreview', props: 'onUpdate={handleUpdateContractData} onUpdateItem={handleUpdateContractItem} onAddItem={handleAddContractItem} onRemoveItem={handleRemoveContractItem} onUpdateClause={handleUpdateContractClause} onAddClause={handleAddContractClause} onRemoveClause={handleRemoveContractClause}', exportArg: '`${contractData.documentType === \'appendix\' ? \'PhuLuc\' : \'HopDong\'}_${contractData.id.replace(/\\//g, \'_\')}`' },
  { id: 'delivery', form: 'DeliveryReceiptForm', data: 'deliveryData', preview: 'DeliveryReceiptPreview', props: 'onUpdate={handleUpdateDeliveryData} onUpdateItem={handleUpdateDeliveryItem} onAddItem={handleAddDeliveryItem} onRemoveItem={handleRemoveDeliveryItem}', exportArg: '`PhieuXuatKho_${deliveryData.id}`' },
  { id: 'payment', form: 'PaymentRequestForm', data: 'paymentData', preview: 'PaymentRequestPreview', props: 'onUpdate={handleUpdatePaymentData} onUpdateItem={handleUpdatePaymentItem} onAddItem={handleAddPaymentItem} onRemoveItem={handleRemovePaymentItem}', exportArg: '`DeNghiThanhToan_${paymentData.id}`' },
  { id: 'advance', form: 'AdvanceRequestForm', data: 'advanceData', preview: 'AdvanceRequestPreview', props: 'onUpdate={handleUpdateAdvanceData}', exportArg: '`DeNghiTamUng_${advanceData.id}`' }
];

tabs.forEach(t => {
  const regex = new RegExp(`\\) : activeTab === '${t.id}' \\? \\([\\s\\S]*?<${t.preview} data=\\{${t.data}\\} />\\s*</div>\\s*</motion\\.div>`, 'm');
  
  const replacement = `) : activeTab === '${t.id}' ? (
          <motion.div key="${t.id}" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            <PanelGroup direction="horizontal" className="h-full w-full">
              <Panel defaultSize={55} minSize={30}>
                <div className="h-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative">
                  <${t.form}
                    data={${t.data}}
                    ${t.props.split(' ').join('\n                    ')}
                  />
                </div>
              </Panel>
              
              <PanelResizeHandle className="w-1.5 bg-slate-200/50 hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500" />
              
              <Panel defaultSize={45} minSize={30}>
                <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                  <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                    <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                    <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                    <button
                      className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                      title="Lưu vào Bộ Chứng từ"
                      onClick={() => handleOpenSaveModal('${t.id}', ${t.data})}
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                    </button>
                    <button
                      className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                      title="Tải xuống Word"
                      onClick={() => exportHTMLToWord('${t.id}-preview-content', ${t.exportArg})}
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                      <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                    </button>
                  </div>
                  <${t.preview} data={${t.data}} />
                </div>
              </Panel>
            </PanelGroup>
          </motion.div>`;
  
  if (!regex.test(content)) {
    console.error(`Regex not found for ${t.id}`);
  }
  content = content.replace(regex, replacement);
});

content = content.replace(/h-\[calc\(100vh-60px\)\]/g, 'h-[calc(100vh-72px)]');

fs.writeFileSync('src/App.jsx', content);
console.log('Successfully replaced all document tabs to uniform PanelGroup layout.');

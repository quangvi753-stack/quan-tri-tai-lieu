import React, { createContext, useState, useContext, useEffect } from 'react';

const WorkspaceContext = createContext();

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children }) => {
  // Danh sách các công ty/chi nhánh ảo để demo
  const mockWorkspaces = [
    { id: 'comp_qvn_hanoi', name: 'Công ty TNHH QVN (Hà Nội)', role: 'admin' },
    { id: 'comp_qvn_thanhhoa', name: 'Chi nhánh QVN Thanh Hóa', role: 'staff' },
    { id: 'comp_partner_a', name: 'Đối tác - Công ty TNHH A', role: 'viewer' },
  ];

  const [workspaces] = useState(mockWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    // Lấy workspace đã lưu từ lần trước, nếu không có thì lấy cái đầu tiên
    const saved = localStorage.getItem('activeWorkspace');
    return saved ? JSON.parse(saved) : mockWorkspaces[0];
  });

  // Lưu workspace khi người dùng thay đổi
  useEffect(() => {
    localStorage.setItem('activeWorkspace', JSON.stringify(activeWorkspace));
  }, [activeWorkspace]);

  const switchWorkspace = (workspaceId) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (ws) {
      setActiveWorkspace(ws);
    }
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, switchWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

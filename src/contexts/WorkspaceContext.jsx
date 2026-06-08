import React, { createContext, useState, useContext, useEffect } from 'react';

const WorkspaceContext = createContext();

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children }) => {
  // Danh sách các công ty/chi nhánh mặc định để demo
  const defaultWorkspaces = [
    { id: 'comp_qvn_hanoi', name: 'Công ty TNHH QVN (Hà Nội)', role: 'admin' },
    { id: 'comp_qvn_thanhhoa', name: 'Chi nhánh QVN Thanh Hóa', role: 'staff' },
    { id: 'comp_partner_a', name: 'Đối tác - Công ty TNHH A', role: 'viewer' },
  ];

  const [workspaces, setWorkspaces] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.role !== 'admin' && user.companyId) {
          const exists = defaultWorkspaces.some(w => w.id === user.companyId);
          if (!exists) {
            const readableName = `Chi nhánh ${user.companyId.replace('comp_', '').toUpperCase()}`;
            const newWs = { id: user.companyId, name: readableName, role: 'staff' };
            return [...defaultWorkspaces, newWs];
          }
        }
      } catch (e) {
        console.error('Error parsing currentUser for workspaces init:', e);
      }
    }
    return defaultWorkspaces;
  });

  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.role !== 'admin' && user.companyId) {
          const matched = defaultWorkspaces.find(w => w.id === user.companyId);
          if (matched) return matched;
          return { 
            id: user.companyId, 
            name: `Chi nhánh ${user.companyId.replace('comp_', '').toUpperCase()}`, 
            role: 'staff' 
          };
        }
      } catch (e) {
        console.error('Error parsing currentUser for activeWorkspace init:', e);
      }
    }
    const saved = localStorage.getItem('activeWorkspace');
    return saved ? JSON.parse(saved) : defaultWorkspaces[0];
  });

  // Lưu workspace khi người dùng thay đổi
  useEffect(() => {
    if (activeWorkspace) {
      localStorage.setItem('activeWorkspace', JSON.stringify(activeWorkspace));
    }
  }, [activeWorkspace]);

  const switchWorkspace = (workspaceId, workspaceName = null) => {
    if (!workspaceId) return;
    
    setWorkspaces(prev => {
      const exists = prev.some(w => w.id === workspaceId);
      if (!exists) {
        const readableName = workspaceName || `Chi nhánh ${workspaceId.replace('comp_', '').toUpperCase()}`;
        const newWs = { id: workspaceId, name: readableName, role: 'staff' };
        setActiveWorkspace(newWs);
        return [...prev, newWs];
      } else {
        const ws = prev.find(w => w.id === workspaceId);
        setActiveWorkspace(ws);
        return prev;
      }
    });
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, switchWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

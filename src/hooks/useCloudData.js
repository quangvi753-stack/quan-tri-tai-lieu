import { useState, useEffect, useRef, useCallback } from 'react';

export function useCloudData(type, defaultData, companyId) {
  const [data, setData] = useState(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);
  const isDirtyRef = useRef(false);

  // Load data
  useEffect(() => {
    if (!companyId) return;
    
    setIsLoaded(false);
    isDirtyRef.current = false;
    
    fetch(`/api/documents/${type}?companyId=${companyId}`)
      .then(res => res.json())
      .then(async (resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        } else {
          // Nếu không có data thì dùng default và nạp mã số tự tăng
          const defaultWithNextId = { ...defaultData };
          try {
            const nextRes = await fetch(`/api/saved-documents/next-id?companyId=${companyId}&type=${type}`);
            const nextData = await nextRes.json();
            if (nextData.success && nextData.nextId) {
              defaultWithNextId.id = nextData.nextId;
            }
          } catch (err) {
            console.error('Failed to fetch next ID for default state:', err);
          }
          setData(defaultWithNextId);
        }
        setIsLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load', type, err);
        setIsLoaded(true);
      });
  }, [type, companyId]);

  // Save data
  useEffect(() => {
    if (!isLoaded || !companyId || !isDirtyRef.current) return;

    // Do not auto-save for viewers
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.role === 'viewer') return;
      } catch {}
    }

    const timeoutId = setTimeout(() => {
      fetch(`/api/documents/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, companyId })
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          isDirtyRef.current = false;
        }
      })
      .catch(err => console.error('Failed to save', type, err));
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [data, type, isLoaded, companyId]);

  const updateData = useCallback((newDataOrFn) => {
    isDirtyRef.current = true;
    setData(newDataOrFn);
  }, []);

  return [data, updateData];
}

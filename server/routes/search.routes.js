import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/search
// Search across saved_documents, customers, and document_sets for the active companyId
router.get('/', async (req, res) => {
  try {
    const { query, companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Thiếu companyId' });
    }
    
    if (!query || !query.trim()) {
      return res.status(200).json({ 
        success: true, 
        data: { documents: [], sets: [], customers: [] } 
      });
    }

    // Hàm loại bỏ dấu tiếng Việt để tìm kiếm không dấu
    const removeAccents = (str) => {
      if (!str) return '';
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D')
        .toLowerCase();
    };

    const cleanQuery = query.trim().toLowerCase();
    const queryNoAccent = removeAccents(cleanQuery);

    // 1. Fetch saved_documents (filtered by companyId)
    const docsSnap = await db.collection('saved_documents')
      .where('companyId', '==', companyId)
      .get();
    
    // 2. Fetch customers (filtered by companyId)
    const custsSnap = await db.collection('customers')
      .where('companyId', '==', companyId)
      .get();

    // 3. Fetch document_sets (filtered by companyId)
    const setsSnap = await db.collection('document_sets')
      .where('companyId', '==', companyId)
      .get();

    const matchedDocs = [];
    docsSnap.forEach(doc => {
      const data = doc.data();
      const documentName = (data.documentName || '').toLowerCase();
      const docCode = (data.data?.id || '').toLowerCase();
      
      const docNameNoAccent = removeAccents(documentName);
      const docCodeNoAccent = removeAccents(docCode);

      if (documentName.includes(cleanQuery) || docCode.includes(cleanQuery) || 
          docNameNoAccent.includes(queryNoAccent) || docCodeNoAccent.includes(queryNoAccent)) {
        matchedDocs.push({
          id: doc.id,
          documentName: data.documentName,
          type: data.type,
          docCode: data.data?.id || 'N/A',
          createdAt: data.createdAt,
          setId: data.setId,
          data: data.data
        });
      }
    });

    const matchedCustomers = [];
    custsSnap.forEach(doc => {
      const data = doc.data();
      const fullName = (data.fullName || '').toLowerCase();
      const shortName = (data.shortName || '').toLowerCase();
      const taxCode = (data.taxCode || '').toLowerCase();
      const phone = (data.phone || '').toLowerCase();
      
      const fullNameNoAccent = removeAccents(fullName);
      const shortNameNoAccent = removeAccents(shortName);

      if (fullName.includes(cleanQuery) || shortName.includes(cleanQuery) || 
          taxCode.includes(cleanQuery) || phone.includes(cleanQuery) ||
          fullNameNoAccent.includes(queryNoAccent) || shortNameNoAccent.includes(queryNoAccent)) {
        matchedCustomers.push({
          id: doc.id,
          ...data
        });
      }
    });

    const matchedSets = [];
    setsSnap.forEach(doc => {
      const data = doc.data();
      const title = (data.title || '').toLowerCase();
      const desc = (data.description || '').toLowerCase();
      
      const titleNoAccent = removeAccents(title);
      const descNoAccent = removeAccents(desc);

      if (title.includes(cleanQuery) || desc.includes(cleanQuery) ||
          titleNoAccent.includes(queryNoAccent) || descNoAccent.includes(queryNoAccent)) {
        matchedSets.push({
          id: doc.id,
          ...data
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        documents: matchedDocs.slice(0, 5),
        customers: matchedCustomers.slice(0, 5),
        sets: matchedSets.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('❌ [GET Search] Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tìm kiếm.' });
  }
});

export default router;

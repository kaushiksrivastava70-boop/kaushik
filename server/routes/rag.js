const express = require('express');
const { queryAll, queryOne, runSql } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// List all documents
router.get('/documents', (req, res) => {
  const docs = queryAll('SELECT * FROM documents ORDER BY uploaded_at DESC');
  res.json(docs);
});

// Get document with chunks
router.get('/documents/:docId', (req, res) => {
  const doc = queryOne('SELECT * FROM documents WHERE id = ?', [req.params.docId]);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  const chunks = queryAll(
    'SELECT * FROM document_chunks WHERE document_id = ? ORDER BY chunk_index',
    [req.params.docId]
  );
  res.json({ ...doc, chunks });
});

// Search documents (TF-IDF-like keyword matching)
router.post('/search', (req, res) => {
  const { query, documentId } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  let chunks;
  if (documentId) {
    chunks = queryAll('SELECT dc.*, d.title as doc_title FROM document_chunks dc JOIN documents d ON dc.document_id = d.id WHERE dc.document_id = ?', [documentId]);
  } else {
    chunks = queryAll('SELECT dc.*, d.title as doc_title FROM document_chunks dc JOIN documents d ON dc.document_id = d.id');
  }

  // Score each chunk by keyword overlap
  const scored = chunks.map(chunk => {
    const content = (chunk.content + ' ' + chunk.keywords + ' ' + chunk.section_title).toLowerCase();
    let score = 0;
    const matchedTerms = [];

    for (const term of queryTerms) {
      const regex = new RegExp(term, 'gi');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length;
        matchedTerms.push(term);
      }
    }

    // Boost for section title match
    const titleLower = (chunk.section_title || '').toLowerCase();
    for (const term of queryTerms) {
      if (titleLower.includes(term)) score += 3;
    }

    return {
      ...chunk,
      relevanceScore: score,
      matchedTerms,
      matchPercentage: queryTerms.length > 0 ? Math.round((matchedTerms.length / queryTerms.length) * 100) : 0
    };
  })
  .filter(c => c.relevanceScore > 0)
  .sort((a, b) => b.relevanceScore - a.relevanceScore)
  .slice(0, 5);

  res.json({
    query,
    totalResults: scored.length,
    results: scored,
    hasResults: scored.length > 0,
  });
});

// RAG-grounded Q&A
router.post('/ask', (req, res) => {
  const { query, documentId, action } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  let chunks;
  if (documentId) {
    chunks = queryAll('SELECT dc.*, d.title as doc_title FROM document_chunks dc JOIN documents d ON dc.document_id = d.id WHERE dc.document_id = ?', [documentId]);
  } else {
    chunks = queryAll('SELECT dc.*, d.title as doc_title FROM document_chunks dc JOIN documents d ON dc.document_id = d.id');
  }

  // Find best matching chunks
  const scored = chunks.map(chunk => {
    const content = (chunk.content + ' ' + chunk.keywords + ' ' + chunk.section_title).toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      const regex = new RegExp(term, 'gi');
      const matches = content.match(regex);
      if (matches) score += matches.length;
    }
    const titleLower = (chunk.section_title || '').toLowerCase();
    for (const term of queryTerms) {
      if (titleLower.includes(term)) score += 3;
    }
    return { ...chunk, relevanceScore: score };
  })
  .filter(c => c.relevanceScore > 0)
  .sort((a, b) => b.relevanceScore - a.relevanceScore)
  .slice(0, 3);

  if (scored.length === 0) {
    return res.json({
      answer: 'I could not find sufficient evidence in the uploaded documents to answer this question accurately. Please try rephrasing your query or uploading additional relevant documents.',
      sources: [],
      confidence: 0,
      grounded: false,
    });
  }

  // Generate grounded response based on action type
  const topChunk = scored[0];
  let answer = '';
  const actionType = action || 'explain';

  switch (actionType) {
    case 'simple':
      // Simplify the content
      answer = `In simple terms: ${topChunk.content.split('.').slice(0, 2).join('.')}. This means that the key concepts you need to understand are the fundamentals described in "${topChunk.section_title}" (Page ${topChunk.page_number}).`;
      break;
    case 'example':
      answer = `Here's a practical example based on "${topChunk.section_title}":\n\n${topChunk.content}\n\nTo apply this practically, consider how these concepts work together in a real-world scenario. The document "${topChunk.doc_title}" (Page ${topChunk.page_number}) provides detailed guidance on implementation.`;
      break;
    case 'quiz':
      answer = `Based on "${topChunk.section_title}" from "${topChunk.doc_title}" (Page ${topChunk.page_number}), here's a quick knowledge check:\n\n**Question:** Based on the content about ${topChunk.section_title.toLowerCase()}, what are the key concepts mentioned?\n\n**Key Points to Consider:**\n${topChunk.content.split('.').filter(s => s.trim()).slice(0, 3).map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')}\n\nTry to recall these without looking at the source material!`;
      break;
    case 'deeper':
      const additionalContext = scored.length > 1 ? `\n\nAdditionally, "${scored[1].section_title}" (Page ${scored[1].page_number}) provides related context:\n${scored[1].content}` : '';
      answer = `**Deep Dive: ${topChunk.section_title}**\n\nFrom "${topChunk.doc_title}" (Page ${topChunk.page_number}):\n\n${topChunk.content}${additionalContext}\n\nThis connects to broader concepts in the ${topChunk.doc_title} curriculum.`;
      break;
    default: // 'explain'
      answer = `Based on "${topChunk.doc_title}" — **${topChunk.section_title}** (Page ${topChunk.page_number}):\n\n${topChunk.content}`;
      if (scored.length > 1) {
        answer += `\n\n**Related:** "${scored[1].section_title}" (Page ${scored[1].page_number}) in "${scored[1].doc_title}" also covers related concepts.`;
      }
  }

  const sources = scored.map(s => ({
    document: s.doc_title,
    documentId: s.document_id,
    section: s.section_title,
    page: s.page_number,
    relevanceScore: s.relevanceScore,
    excerpt: s.content.substring(0, 150) + '...',
  }));

  res.json({
    answer,
    sources,
    confidence: Math.min(0.95, topChunk.relevanceScore * 0.1),
    grounded: true,
    action: actionType,
  });
});

module.exports = router;

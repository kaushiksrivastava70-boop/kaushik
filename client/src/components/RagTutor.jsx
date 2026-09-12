import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  ExternalLink, 
  Layers, 
  Quote, 
  Send,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export default function RagTutor({ currentUser }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [docDetails, setDocDetails] = useState(null);

  // Load pre-seeded official curriculum documents
  useEffect(() => {
    fetch('/api/rag/documents')
      .then(r => r.json())
      .then(data => {
        setDocuments(Array.isArray(data) ? data : []);
        if (data && data.length > 0) {
          setSelectedDocId(data[0].id);
        }
      })
      .catch(err => console.error('Error loading documents:', err));
  }, []);

  // Fetch document chunks when document is selected
  useEffect(() => {
    if (!selectedDocId) return;
    fetch(`/api/rag/documents/${selectedDocId}`)
      .then(r => r.json())
      .then(data => {
        setDocDetails(data);
        if (data.chunks && data.chunks.length > 0) {
          setSelectedChunk(data.chunks[0]);
        }
      })
      .catch(err => console.error('Error loading doc details:', err));
  }, [selectedDocId]);

  // Execute RAG Grounded Search
  const handleSearch = (customQuery = null, action = null) => {
    const q = customQuery || query;
    if (!q) return;
    setIsSearching(true);

    fetch('/api/rag/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: q,
        documentId: selectedDocId || undefined,
        action: action || undefined
      })
    })
      .then(r => r.json())
      .then(data => {
        setIsSearching(false);
        setSearchResult(data);
      })
      .catch(err => {
        console.error('RAG search error:', err);
        setIsSearching(false);
      });
  };

  // Quick Action Buttons
  const handleAction = (actionType) => {
    if (!query) {
      setQuery('What are the core requirements for National Data Analytics competency?');
      handleSearch('What are the core requirements for National Data Analytics competency?', actionType);
    } else {
      handleSearch(query, actionType);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(37, 99, 235, 0.15))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #8b5cf6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
          }}>
            <BookOpen size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                RAG AI Tutor & Document Vault
              </h1>
              <span className="badge badge-purple">Grounded Citations</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Retrieval-Augmented Generation referencing official government curricula, technical standards, and indexed passage chunks.
            </p>
          </div>
        </div>

        {/* Document Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Target Corpus:</span>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: 12,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="">All Indexed Documents</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.total_pages} Pages)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Query & Citations (Left) + Document Inspector (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* Left Column: Q&A Query Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Query Input Box */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="#c084fc" />
              Ask Grounded Question
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Ask any conceptual or practical question. Answers cite document title, page number, and paragraph excerpt.
            </p>

            <div style={{ position: 'relative' }}>
              <textarea
                rows={3}
                placeholder="e.g. What are the key data quality validation rules under MoE framework? Or explain Window Functions in SQL."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 13,
                  borderRadius: 'var(--radius-md)',
                  resize: 'none'
                }}
              />
            </div>

            {/* Action Pills & Submit */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleAction('explain_simply')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    background: 'rgba(139, 92, 246, 0.12)',
                    color: '#c084fc',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}
                >
                  💡 Explain Simply
                </button>
                <button
                  onClick={() => handleAction('give_example')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    background: 'rgba(37, 99, 235, 0.12)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                >
                  💻 Give Code Example
                </button>
                <button
                  onClick={() => handleAction('ask_quiz')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  ❓ Ask Quiz
                </button>
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={!query.trim() || isSearching}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #2563eb)' }}
              >
                {isSearching ? 'Retrieving Chunks...' : 'Retrieve & Answer'}
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* RAG Answer Display */}
          {searchResult && (
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
                <span className="badge badge-purple" style={{ fontSize: 11 }}>
                  RAG Grounded Response
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {searchResult.matchedChunks?.length || 0} Passages Cited
                </span>
              </div>

              {/* Synthesized Response Text */}
              <div style={{ fontSize: 14, color: '#fff', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {searchResult.answer || searchResult.response}
              </div>

              {/* Verified Citations List */}
              {searchResult.citations && searchResult.citations.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Verified Document Citations
                  </div>

                  {searchResult.citations.map((cite, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid rgba(139, 92, 246, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#c084fc' }}>
                          [{idx + 1}] {cite.docTitle || 'Curriculum Specification'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Page {cite.pageNumber || 1} • Section: {cite.sectionTitle || 'Overview'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '2px solid #8b5cf6', paddingLeft: 8 }}>
                        "{cite.snippet || cite.content?.substring(0, 160)}..."
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Chunk Inspector & Document Viewer */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Indexed Document Chunks</h3>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Inspect raw passage representations</p>
            </div>
            <span className="badge badge-teal">
              {docDetails?.chunks?.length || 0} Chunks
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
            {docDetails?.chunks?.map((chunk, idx) => {
              const isSelected = selectedChunk?.id === chunk.id;
              return (
                <div
                  key={chunk.id || idx}
                  onClick={() => setSelectedChunk(chunk)}
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-surface-elevated)',
                    border: isSelected ? '1px solid #8b5cf6' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: isSelected ? '#c084fc' : 'var(--text-primary)' }}>
                      Chunk #{chunk.chunk_index + 1}: {chunk.section_title || 'Section'}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>P.{chunk.page_number}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {chunk.content.substring(0, 110)}...
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed View of Selected Chunk */}
          {selectedChunk && (
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 14,
              fontSize: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileCheck size={14} /> Full Chunk Preview (P.{selectedChunk.page_number})
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                fontSize: 11,
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)'
              }}>
                {selectedChunk.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

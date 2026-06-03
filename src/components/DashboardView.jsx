import React from 'react';

export default function DashboardView({ overviewText, repoId, onStartChat }) {
  
  /**
   * High-fidelity layout engine that isolates structural report sections
   * and preserves raw code blocks / ASCII flowcharts perfectly.
   */
/**
   * High-fidelity layout engine that isolates structural report sections,
   * completely cleans standalone padding lines, and preserves ASCII charts.
   */
const processReportSections = (rawText) => {
    if (!rawText) return [];

    // Step 1: Pre-process lines to completely eliminate standalone markdown formatting markers
    const filteredLines = rawText
      .split('\n')
      .filter(line => {
        const cleanLine = line.trim();
        // Drop lines that are just '###', '##', or structural artifact noise
        if (cleanLine === '###' || cleanLine === '##' || cleanLine === '---') return false;
        if (cleanLine.toLowerCase().startsWith('## architecture report')) return false;
        return true;
      });

    // Re-unify clean lines back into a block string
    const cleanText = filteredLines.join('\n').trim();
    
    // Step 2: Split text into arrays based on numbered sections (e.g., 1. CODEBASE SUMMARY)
    const rawBlocks = cleanText.split(/(?=\d\.\s[A-Z\s]+)/g);

    return rawBlocks.map(block => {
      const lines = block.split('\n');
      const headerLine = lines[0] || '';
      
      const sectionTitle = headerLine.replace(/^\d\.\s*/, '').replace(/:/g, '').trim();
      const remainingLines = lines.slice(1);
      
      const elements = [];
      let currentListItems = [];
      let isInsideAsciiBlock = false;
      let asciiBuffer = [];

      for (let i = 0; i < remainingLines.length; i++) {
        const line = remainingLines[i];
        const trimmedLine = line.trim();

        // Detect code/diagram blocks
        if (trimmedLine.startsWith('```')) {
          if (isInsideAsciiBlock) {
            elements.push({ type: 'ascii', text: asciiBuffer.join('\n') });
            asciiBuffer = [];
            isInsideAsciiBlock = false;
          } else {
            if (currentListItems.length > 0) {
              elements.push({ type: 'list', items: [...currentListItems] });
              currentListItems = [];
            }
            isInsideAsciiBlock = true;
          }
          continue;
        }

        // Inside an ASCII block, preserve all literal white spaces
        if (isInsideAsciiBlock) {
          asciiBuffer.push(line);
          continue;
        }

        if (!trimmedLine) continue;

        // Process bullet items
        if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
          const cleanListItem = trimmedLine
            .replace(/^[\*\-\s]*/, '')
            .replace(/\*\*/g, '')
            .trim();
          
          if (cleanListItem) {
            currentListItems.push(cleanListItem);
          }
        } else {
          if (currentListItems.length > 0) {
            elements.push({ type: 'list', items: [...currentListItems] });
            currentListItems = [];
          }
          elements.push({ type: 'paragraph', text: trimmedLine.replace(/\*\*/g, '') });
        }
      }

      // Flush remaining components
      if (isInsideAsciiBlock && asciiBuffer.length > 0) {
        elements.push({ type: 'ascii', text: asciiBuffer.join('\n') });
      }
      if (currentListItems.length > 0) {
        elements.push({ type: 'list', items: currentListItems });
      }

      return {
        title: sectionTitle || "Project Details",
        contentNodes: elements
      };
    }).filter(section => section.title && section.contentNodes.length > 0);
  };
  const processedSections = processReportSections(overviewText);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F19] p-6 lg:p-8 flex flex-col items-center justify-start h-full min-h-0 select-text">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-[#161F30] border border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Project Architecture Report</h2>
            <p className="text-xs text-gray-400 mt-0.5">Automated technical analysis and workspace mapping</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-mono text-xs bg-[#0B0F19] text-[#8B5CF6] border border-gray-800 px-3 py-1.5 rounded-lg shadow-inner">
              id: {repoId}
            </span>
            <button
              onClick={onStartChat}
              className="bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-[#8B5CF6]/10"
            >
              Open Code Assist
            </button>
          </div>
        </div>

        {/* Structured Grid Panels */}
        {processedSections.length === 0 ? (
          <div className="bg-[#161F30] border border-gray-800 rounded-xl p-12 text-center text-sm text-gray-400">
            Generating project overview mapping details...
          </div>
        ) : (
          <div className="space-y-6">
            {processedSections.map((section, idx) => (
              <div 
                key={idx} 
                className="bg-[#161F30] border border-gray-800 rounded-xl p-6 lg:p-8 shadow-md"
              >
                {/* Title Badge */}
                <h3 className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider mb-4 pb-2 border-b border-gray-800/60">
                  {section.title}
                </h3>
                
                {/* Custom Content Containers */}
                <div className="space-y-4">
                  {section.contentNodes.map((node, nodeIdx) => {
                    if (node.type === 'paragraph') {
                      return (
                        <p key={nodeIdx} className="text-sm text-gray-300 leading-relaxed font-sans">
                          {node.text}
                        </p>
                      );
                    }
                    
                    if (node.type === 'ascii') {
                      return (
                        <div key={nodeIdx} className="my-4 bg-[#0B0F19] border border-gray-800 rounded-xl p-5 overflow-x-auto shadow-inner">
                          {/* Locked fixed-width font display context */}
                          <pre className="text-xs font-mono text-[#34D399] leading-relaxed whitespace-pre font-semibold">
                            {node.text}
                          </pre>
                        </div>
                      );
                    }

                    if (node.type === 'list') {
                      return (
                        <ul key={nodeIdx} className="space-y-3 pl-2 border-l-2 border-gray-800 my-2">
                          {node.items.map((item, itemIdx) => {
                            const colonIndex = item.indexOf(':');
                            if (colonIndex !== -1) {
                              const pathKey = item.substring(0, colonIndex);
                              const pathDesc = item.substring(colonIndex);
                              return (
                                <li key={itemIdx} className="text-sm text-gray-300 font-sans leading-relaxed pl-2">
                                  <span className="font-mono text-xs text-[#A78BFA] bg-[#0B0F19] px-1.5 py-0.5 rounded border border-gray-800/60 mr-1.5 font-semibold">
                                    {pathKey}
                                  </span>
                                  <span className="text-gray-300">{pathDesc}</span>
                                </li>
                              );
                            }
                            return (
                              <li key={itemIdx} className="text-sm text-gray-300 font-sans leading-relaxed list-disc pl-2 ml-4">
                                {item}
                              </li>
                            );
                          })}
                        </ul>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
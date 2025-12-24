import { useState, useMemo, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';

// ═══════════════════════════════════════════════════════════════════════════
// DR THOMAS STEVENSON - LABORATORY CALCULATIONS SUITE
// A prestigious scientific calculator for laboratory professionals
// ═══════════════════════════════════════════════════════════════════════════

// Common molecular weights database
const MOLECULAR_WEIGHTS: Record<string, { name: string; mw: number; formula: string }> = {
  'nacl': { name: 'Sodium Chloride', mw: 58.44, formula: 'NaCl' },
  'kcl': { name: 'Potassium Chloride', mw: 74.55, formula: 'KCl' },
  'glucose': { name: 'D-Glucose', mw: 180.16, formula: 'C₆H₁₂O₆' },
  'sucrose': { name: 'Sucrose', mw: 342.30, formula: 'C₁₂H₂₂O₁₁' },
  'tris': { name: 'Tris Base', mw: 121.14, formula: 'C₄H₁₁NO₃' },
  'edta': { name: 'EDTA Disodium', mw: 372.24, formula: 'C₁₀H₁₄N₂Na₂O₈·2H₂O' },
  'hepes': { name: 'HEPES', mw: 238.30, formula: 'C₈H₁₈N₂O₄S' },
  'sds': { name: 'SDS', mw: 288.38, formula: 'C₁₂H₂₅NaO₄S' },
  'mgcl2': { name: 'Magnesium Chloride', mw: 95.21, formula: 'MgCl₂' },
  'cacl2': { name: 'Calcium Chloride', mw: 110.98, formula: 'CaCl₂' },
  'naoh': { name: 'Sodium Hydroxide', mw: 40.00, formula: 'NaOH' },
  'hcl': { name: 'Hydrochloric Acid', mw: 36.46, formula: 'HCl' },
  'bsa': { name: 'Bovine Serum Albumin', mw: 66430, formula: 'Protein' },
  'ethanol': { name: 'Ethanol', mw: 46.07, formula: 'C₂H₅OH' },
  'methanol': { name: 'Methanol', mw: 32.04, formula: 'CH₃OH' },
  'glycerol': { name: 'Glycerol', mw: 92.09, formula: 'C₃H₈O₃' },
  'urea': { name: 'Urea', mw: 60.06, formula: 'CH₄N₂O' },
  'nacitrate': { name: 'Sodium Citrate', mw: 294.10, formula: 'Na₃C₆H₅O₇' },
  'nh4cl': { name: 'Ammonium Chloride', mw: 53.49, formula: 'NH₄Cl' },
  'kh2po4': { name: 'Potassium Phosphate Mono', mw: 136.09, formula: 'KH₂PO₄' },
  'k2hpo4': { name: 'Potassium Phosphate Di', mw: 174.18, formula: 'K₂HPO₄' },
  'na2hpo4': { name: 'Sodium Phosphate Di', mw: 141.96, formula: 'Na₂HPO₄' },
  'nah2po4': { name: 'Sodium Phosphate Mono', mw: 119.98, formula: 'NaH₂PO₄' },
  'imidazole': { name: 'Imidazole', mw: 68.08, formula: 'C₃H₄N₂' },
  'dtt': { name: 'DTT (Dithiothreitol)', mw: 154.25, formula: 'C₄H₁₀O₂S₂' },
  'bmercaptoethanol': { name: 'β-Mercaptoethanol', mw: 78.13, formula: 'C₂H₆OS' },
  'pmsf': { name: 'PMSF', mw: 174.19, formula: 'C₇H₇FO₂S' },
  'iptg': { name: 'IPTG', mw: 238.30, formula: 'C₉H₁₈O₅S' },
  'xgal': { name: 'X-Gal', mw: 408.63, formula: 'C₁₄H₁₅BrClNO₆' },
  'atp': { name: 'ATP Disodium', mw: 551.14, formula: 'C₁₀H₁₄N₅Na₂O₁₃P₃' },
  'dntps': { name: 'dNTP Mix', mw: 487.15, formula: 'Average' },
  'sodium acetate': { name: 'Sodium Acetate', mw: 82.03, formula: 'CH₃COONa' },
  'ammonium sulfate': { name: 'Ammonium Sulfate', mw: 132.14, formula: '(NH₄)₂SO₄' },
  'sodium bicarbonate': { name: 'Sodium Bicarbonate', mw: 84.01, formula: 'NaHCO₃' },
  'potassium acetate': { name: 'Potassium Acetate', mw: 98.14, formula: 'CH₃COOK' },
  'magnesium sulfate': { name: 'Magnesium Sulfate', mw: 120.37, formula: 'MgSO₄' },
  'lithium chloride': { name: 'Lithium Chloride', mw: 42.39, formula: 'LiCl' },
  'cesium chloride': { name: 'Cesium Chloride', mw: 168.36, formula: 'CsCl' },
  'sodium azide': { name: 'Sodium Azide', mw: 65.01, formula: 'NaN₃' },
  'triton x-100': { name: 'Triton X-100', mw: 625, formula: 'C₁₄H₂₂O(C₂H₄O)ₙ' },
  'tween 20': { name: 'Tween 20', mw: 1228, formula: 'C₅₈H₁₁₄O₂₆' },
};

// Common buffer pKa values
const BUFFER_PKA: Record<string, { name: string; pka: number; range: string }> = {
  'phosphate': { name: 'Phosphate', pka: 7.2, range: '5.8–8.0' },
  'tris': { name: 'Tris', pka: 8.1, range: '7.0–9.0' },
  'hepes': { name: 'HEPES', pka: 7.5, range: '6.8–8.2' },
  'mes': { name: 'MES', pka: 6.1, range: '5.5–6.7' },
  'mops': { name: 'MOPS', pka: 7.2, range: '6.5–7.9' },
  'pipes': { name: 'PIPES', pka: 6.8, range: '6.1–7.5' },
  'bicine': { name: 'Bicine', pka: 8.3, range: '7.6–9.0' },
  'tricine': { name: 'Tricine', pka: 8.1, range: '7.4–8.8' },
  'acetate': { name: 'Acetate', pka: 4.76, range: '3.6–5.6' },
  'citrate': { name: 'Citrate', pka: 6.4, range: '3.0–6.2' },
  'glycine': { name: 'Glycine', pka: 9.6, range: '8.6–10.6' },
  'borate': { name: 'Borate', pka: 9.2, range: '8.5–10.0' },
  'caps': { name: 'CAPS', pka: 10.4, range: '9.7–11.1' },
};

type CalculatorTab = 
  | 'molarity' 
  | 'dilution' 
  | 'serial' 
  | 'percent' 
  | 'conversion' 
  | 'stock' 
  | 'buffer' 
  | 'osmolarity';

interface CalculationHistory {
  id: string;
  type: CalculatorTab;
  timestamp: Date;
  inputs: Record<string, string | number>;
  result: string;
  equation?: string;
}

interface Project {
  id: string;
  name: string;
  calculations: CalculationHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function LabCalculationsSuite() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('molarity');
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showMWDatabase, setShowMWDatabase] = useState(false);
  const [mwSearch, setMwSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Projects feature
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showProjects, setShowProjects] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Load projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('labcalcs-projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed.map((p: Project) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        calculations: p.calculations.map((c: CalculationHistory) => ({
          ...c,
          timestamp: new Date(c.timestamp)
        }))
      })));
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('labcalcs-projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const addToHistory = (type: CalculatorTab, inputs: Record<string, string | number>, result: string, equation?: string) => {
    const entry: CalculationHistory = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date(),
      inputs,
      result,
      equation,
    };
    setHistory(prev => [entry, ...prev].slice(0, 50));
    
    // Also add to active project if one is selected
    if (activeProjectId) {
      setProjects(prev => prev.map(p => 
        p.id === activeProjectId 
          ? { ...p, calculations: [...p.calculations, entry], updatedAt: new Date() }
          : p
      ));
    }
  };

  const createProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: newProjectName.trim(),
      calculations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setNewProjectName('');
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  };

  const removeCalculationFromProject = (projectId: string, calcId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, calculations: p.calculations.filter(c => c.id !== calcId), updatedAt: new Date() }
        : p
    ));
  };

  const exportProjectPDF = (project: Project) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Laboratory Calculations Report', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(project.name, pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 36, { align: 'center' });

    y = 55;
    doc.setTextColor(30, 41, 59);

    // Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Calculations: ${project.calculations.length}`, 20, y);
    y += 5;
    doc.text(`Project Created: ${project.createdAt.toLocaleDateString()}`, 20, y);
    y += 15;

    // Calculations
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Calculations', 20, y);
    y += 10;

    project.calculations.forEach((calc, i) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, pageWidth - 30, calc.equation ? 40 : 30, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y - 5, pageWidth - 30, calc.equation ? 40 : 30, 'S');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`${i + 1}. ${calc.type.charAt(0).toUpperCase() + calc.type.slice(1)}`, 20, y + 3);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Result: ${calc.result}`, 20, y + 12);
      
      if (calc.equation) {
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        const eqLines = doc.splitTextToSize(`Equation: ${calc.equation}`, pageWidth - 50);
        doc.text(eqLines, 20, y + 21);
        y += 47;
      } else {
        y += 37;
      }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${i} of ${pageCount} | Dr Thomas Stevenson Laboratory Calculations Suite`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`${project.name.replace(/\s+/g, '_')}_calculations.pdf`);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMW = useMemo(() => {
    if (!mwSearch) return Object.entries(MOLECULAR_WEIGHTS);
    const search = mwSearch.toLowerCase();
    return Object.entries(MOLECULAR_WEIGHTS).filter(
      ([key, val]) => 
        key.includes(search) || 
        val.name.toLowerCase().includes(search) ||
        val.formula.toLowerCase().includes(search)
    );
  }, [mwSearch]);

  const tabs: { id: CalculatorTab; label: string; icon: string }[] = [
    { id: 'molarity', label: 'Molarity', icon: 'M' },
    { id: 'dilution', label: 'Dilution', icon: 'C₁V₁' },
    { id: 'serial', label: 'Serial', icon: '∿' },
    { id: 'percent', label: 'Percent', icon: '%' },
    { id: 'conversion', label: 'Convert', icon: '⇄' },
    { id: 'stock', label: 'Stock', icon: 'S' },
    { id: 'buffer', label: 'Buffer', icon: 'pH' },
    { id: 'osmolarity', label: 'Osm', icon: 'Ω' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-amber-500/30">
      {/* Header */}
      <header className="relative border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-light tracking-tight">
                  <span className="font-semibold text-slate-900">Dr Thomas Stevenson</span>
                </h1>
              </div>
              <p className="text-sm text-slate-500 tracking-wide uppercase">Laboratory Calculations Suite</p>
            </div>
          </div>
          
          {/* Action buttons - stacked for mobile */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setShowProjects(!showProjects)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              showProjects 
                  ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              Projects {activeProject && `(${activeProject.name})`}
            </button>
            <button
              onClick={() => setShowMWDatabase(!showMWDatabase)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              showMWDatabase 
                  ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              MW Database
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              showHistory 
                  ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History ({history.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Projects Panel */}
        {showProjects && (
          <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-900 mb-3">Projects</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="New project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createProject()}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
                <button
                  onClick={createProject}
                  disabled={!newProjectName.trim()}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </div>

            {activeProject && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-amber-700">Calculations will be saved to: <strong>{activeProject.name}</strong></span>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => setActiveProjectId(null)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  !activeProjectId 
                    ? 'bg-slate-100 border-slate-300' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-sm font-medium text-slate-700">No Project (Quick Calculations)</span>
              </button>
              
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-3 rounded-lg border transition-all ${
                    activeProjectId === project.id 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setActiveProjectId(project.id)}
                      className="text-left flex-1"
                    >
                      <span className="text-sm font-medium text-slate-900">{project.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({project.calculations.length} calculations)</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportProjectPDF(project)}
                        disabled={project.calculations.length === 0}
                        className="px-3 py-1 text-xs font-medium text-amber-600 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        PDF
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this project?')) deleteProject(project.id); }}
                        className="px-3 py-1 text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {activeProjectId === project.id && project.calculations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200 space-y-1 max-h-32 overflow-y-auto">
                      {project.calculations.map((calc) => (
                        <div key={calc.id} className="flex items-center justify-between text-xs p-2 bg-white rounded border border-amber-100">
                          <span className="text-slate-600">
                            <span className="font-mono text-amber-600 uppercase">{calc.type}</span>: {calc.result}
                          </span>
                          <button
                            onClick={() => removeCalculationFromProject(project.id, calc.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MW Database Panel */}
        {showMWDatabase && (
          <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Molecular Weight Reference</h3>
              <input
                type="text"
                placeholder="Search compounds..."
                value={mwSearch}
                onChange={(e) => setMwSearch(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 w-64"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
              {filteredMW.map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => copyToClipboard(val.mw.toString(), key)}
                  className="group text-left p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-amber-600 font-mono">{val.formula}</span>
                    {copiedId === key && <span className="text-[10px] text-emerald-600">Copied!</span>}
                  </div>
                  <div className="text-sm text-slate-900 group-hover:text-amber-700 transition-colors">{val.name}</div>
                  <div className="text-lg font-semibold text-slate-600 font-mono mt-1">{val.mw.toLocaleString()} g/mol</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && history.length > 0 && (
          <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Calculation History</h3>
              <button 
                onClick={() => setHistory([])}
                className="text-xs text-slate-500 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {history.map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-amber-600 uppercase">{entry.type}</span>
                    <span className="text-sm text-slate-900">{entry.result}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => copyToClipboard(entry.result, entry.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-600 transition-all"
                    >
                      {copiedId === entry.id ? (
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs opacity-70 mb-0.5 font-mono">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calculator Panels */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {activeTab === 'molarity' && <MolarityCalculator onCalculate={addToHistory} />}
            {activeTab === 'dilution' && <DilutionCalculator onCalculate={addToHistory} />}
            {activeTab === 'serial' && <SerialDilutionCalculator onCalculate={addToHistory} />}
            {activeTab === 'percent' && <PercentSolutionCalculator onCalculate={addToHistory} />}
            {activeTab === 'conversion' && <UnitConverter onCalculate={addToHistory} />}
            {activeTab === 'stock' && <StockSolutionCalculator onCalculate={addToHistory} />}
            {activeTab === 'buffer' && <BufferCalculator onCalculate={addToHistory} />}
            {activeTab === 'osmolarity' && <OsmolarityCalculator onCalculate={addToHistory} />}
          </div>

          {/* Quick Reference Panel */}
          <div className="space-y-6">
            <QuickReference activeTab={activeTab} />
            <CommonRecipes />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Dr Thomas Stevenson • Laboratory Calculations Suite
          </p>
          <p className="text-xs text-slate-400">
            Always verify critical calculations independently
          </p>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CALCULATOR COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface CalculatorProps {
  onCalculate: (type: CalculatorTab, inputs: Record<string, string | number>, result: string, equation?: string) => void;
}

function InputField({ 
  label, 
  value, 
  onChange, 
  unit, 
  placeholder = '0',
  helper,
  isCalculated = false
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  unit?: string; 
  placeholder?: string;
  helper?: string;
  isCalculated?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isCalculated ? 'Leave blank to calculate' : placeholder}
          className={`w-full px-4 py-3 border rounded-lg text-lg font-mono placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all ${
            isCalculated && value 
              ? 'bg-amber-50 border-amber-300 text-amber-700' 
              : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
          }`}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">{unit}</span>
        )}
      </div>
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
      {isCalculated && value && <p className="text-xs text-amber-600">← Calculated</p>}
    </div>
  );
}

// MW Input Field with inline search
function MWInputField({ 
  value, 
  onChange,
  label = "Molecular weight",
  isCalculated = false
}: { 
  value: string; 
  onChange: (v: string) => void;
  label?: string;
  isCalculated?: boolean;
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCompound, setSelectedCompound] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCompounds = useMemo(() => {
    if (!search) return Object.entries(MOLECULAR_WEIGHTS).slice(0, 8);
    const searchLower = search.toLowerCase();
    return Object.entries(MOLECULAR_WEIGHTS).filter(
      ([key, val]) => 
        key.includes(searchLower) || 
        val.name.toLowerCase().includes(searchLower) ||
        val.formula.toLowerCase().includes(searchLower)
    ).slice(0, 8);
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCompound = (mw: number, name: string) => {
    onChange(mw.toString());
    setSelectedCompound(name);
    setShowSearch(false);
    setSearch('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setSelectedCompound(null);
              }}
              placeholder={isCalculated ? 'Leave blank to calculate' : '0'}
              className={`w-full px-4 py-3 border rounded-lg text-lg font-mono placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-16 ${
                isCalculated && value 
                  ? 'bg-amber-50 border-amber-300 text-amber-700' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">g/mol</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className={`px-4 py-3 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
              showSearch 
                ? 'bg-amber-50 border-amber-300 text-amber-600' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600'
            }`}
            title="Search compound database"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Selected compound indicator */}
        {selectedCompound && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {selectedCompound}
          </p>
        )}
        {isCalculated && value && !selectedCompound && <p className="text-xs text-amber-600 mt-1">← Calculated</p>}

        {/* Search dropdown */}
        {showSearch && (
          <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search compounds (e.g., NaCl, glucose)..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredCompounds.length > 0 ? (
                filteredCompounds.map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => selectCompound(val.mw, val.name)}
                    className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors border-b border-slate-100 last:border-0 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">{val.name}</div>
                      <div className="text-xs text-amber-600 font-mono">{val.formula}</div>
                    </div>
                    <div className="text-lg font-semibold text-slate-600 font-mono">{val.mw.toLocaleString()}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  No compounds found
                </div>
              )}
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-500">Click a compound to auto-fill MW</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultDisplay({ label, value, unit, onCopy }: { label: string; value: string; unit: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">{label}</span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-amber-600 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-amber-600 font-mono tracking-tight">
          {value || '—'}
        </span>
        <span className="text-lg text-slate-600">{unit}</span>
      </div>
    </div>
  );
}

// Molarity Calculator - Flexible 4-field solver
function MolarityCalculator({ onCalculate }: CalculatorProps) {
  const [mass, setMass] = useState('');
  const [mw, setMw] = useState('');
  const [volume, setVolume] = useState('');
  const [molarity, setMolarity] = useState('');

  const result = useMemo(() => {
    const m = parseFloat(mass);
    const w = parseFloat(mw);
    const v = parseFloat(volume);
    const M = parseFloat(molarity);

    const filled = [!isNaN(m), !isNaN(w), !isNaN(v), !isNaN(M)];
    const filledCount = filled.filter(Boolean).length;

    if (filledCount !== 3) return null;

    // mass = M × V × MW
    if (isNaN(m) && w > 0 && v > 0 && M > 0) {
      const calc = M * (v / 1000) * w;
      return { 
        value: calc.toPrecision(4), 
        unit: 'g', 
        label: 'Mass needed',
        field: 'mass',
        equation: `mass = ${M} M × ${v/1000} L × ${w} g/mol = ${calc.toPrecision(4)} g`
      };
    }
    // MW = mass / (M × V)
    if (isNaN(w) && m > 0 && v > 0 && M > 0) {
      const calc = m / (M * (v / 1000));
      return { 
        value: calc.toPrecision(4), 
        unit: 'g/mol', 
        label: 'Molecular weight',
        field: 'mw',
        equation: `MW = ${m} g / (${M} M × ${v/1000} L) = ${calc.toPrecision(4)} g/mol`
      };
    }
    // V = mass / (M × MW)
    if (isNaN(v) && m > 0 && w > 0 && M > 0) {
      const calc = (m / (M * w)) * 1000;
      return { 
        value: calc.toPrecision(4), 
        unit: 'mL', 
        label: 'Volume',
        field: 'volume',
        equation: `V = ${m} g / (${M} M × ${w} g/mol) × 1000 = ${calc.toPrecision(4)} mL`
      };
    }
    // M = mass / (MW × V)
    if (isNaN(M) && m > 0 && w > 0 && v > 0) {
      const moles = m / w;
      const calc = moles / (v / 1000);
      return { 
        value: calc.toPrecision(4), 
        unit: 'M', 
        label: 'Molarity',
        field: 'molarity',
        equation: `M = (${m} g / ${w} g/mol) / ${v/1000} L = ${calc.toPrecision(4)} M`
      };
    }
    return null;
  }, [mass, mw, volume, molarity]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('molarity', { mass, mw, volume, molarity }, `${result.value} ${result.unit}`, result.equation);
    }
  };

  const getIsCalculated = (field: string) => {
    const m = parseFloat(mass);
    const w = parseFloat(mw);
    const v = parseFloat(volume);
    const M = parseFloat(molarity);
    const filled = [!isNaN(m), !isNaN(w), !isNaN(v), !isNaN(M)].filter(Boolean).length;
    
    if (filled === 3) {
      if (field === 'mass' && isNaN(m)) return true;
      if (field === 'mw' && isNaN(w)) return true;
      if (field === 'volume' && isNaN(v)) return true;
      if (field === 'molarity' && isNaN(M)) return true;
    }
    return false;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-slate-900">Molarity Calculator</h2>
        <span className="text-sm text-slate-500 font-mono">m = M × V × MW</span>
      </div>
      <p className="text-sm text-slate-500 mb-6">Enter any 3 values to calculate the 4th</p>

      <div className="grid gap-4 mb-6">
        <InputField 
          label="Mass of solute" 
          value={mass} 
          onChange={setMass} 
          unit="g" 
          isCalculated={getIsCalculated('mass')}
        />
        <MWInputField 
          value={mw} 
          onChange={setMw} 
          isCalculated={getIsCalculated('mw')}
        />
        <InputField 
          label="Volume of solution" 
          value={volume} 
          onChange={setVolume} 
          unit="mL" 
          isCalculated={getIsCalculated('volume')}
        />
        <InputField 
          label="Molarity" 
          value={molarity} 
          onChange={setMolarity} 
          unit="M" 
          isCalculated={getIsCalculated('molarity')}
        />
      </div>

      {result && (
        <ResultDisplay 
          label={result.label} 
          value={result.value} 
          unit={result.unit} 
          onCopy={handleCalculate}
        />
      )}
    </div>
  );
}

// Dilution Calculator - Flexible 4-field solver
function DilutionCalculator({ onCalculate }: CalculatorProps) {
  const [c1, setC1] = useState('');
  const [v1, setV1] = useState('');
  const [c2, setC2] = useState('');
  const [v2, setV2] = useState('');

  const result = useMemo(() => {
    const C1 = parseFloat(c1);
    const V1 = parseFloat(v1);
    const C2 = parseFloat(c2);
    const V2 = parseFloat(v2);

    const filled = [!isNaN(C1), !isNaN(V1), !isNaN(C2), !isNaN(V2)];
    const filledCount = filled.filter(Boolean).length;

    if (filledCount !== 3) return null;

    if (isNaN(C1) && V1 > 0 && C2 > 0 && V2 > 0) {
      const calc = (C2 * V2) / V1;
      return { 
        value: calc.toPrecision(4), 
        unit: 'M', 
        label: 'Stock concentration (C₁)',
        field: 'c1',
        equation: `C₁ = (${C2} × ${V2}) / ${V1} = ${calc.toPrecision(4)} M`
      };
    }
    if (isNaN(V1) && C1 > 0 && C2 > 0 && V2 > 0) {
      const calc = (C2 * V2) / C1;
      return { 
        value: calc.toPrecision(4), 
        unit: 'mL', 
        label: 'Stock volume needed (V₁)',
        field: 'v1',
        equation: `V₁ = (${C2} × ${V2}) / ${C1} = ${calc.toPrecision(4)} mL`
      };
    }
    if (isNaN(C2) && C1 > 0 && V1 > 0 && V2 > 0) {
      const calc = (C1 * V1) / V2;
      return { 
        value: calc.toPrecision(4), 
        unit: 'M', 
        label: 'Final concentration (C₂)',
        field: 'c2',
        equation: `C₂ = (${C1} × ${V1}) / ${V2} = ${calc.toPrecision(4)} M`
      };
    }
    if (isNaN(V2) && C1 > 0 && V1 > 0 && C2 > 0) {
      const calc = (C1 * V1) / C2;
      return { 
        value: calc.toPrecision(4), 
        unit: 'mL', 
        label: 'Final volume (V₂)',
        field: 'v2',
        equation: `V₂ = (${C1} × ${V1}) / ${C2} = ${calc.toPrecision(4)} mL`
      };
    }
    return null;
  }, [c1, v1, c2, v2]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('dilution', { c1, v1, c2, v2 }, `${result.value} ${result.unit}`, result.equation);
    }
  };

  const getIsCalculated = (field: string) => {
    const C1 = parseFloat(c1);
    const V1 = parseFloat(v1);
    const C2 = parseFloat(c2);
    const V2 = parseFloat(v2);
    const filled = [!isNaN(C1), !isNaN(V1), !isNaN(C2), !isNaN(V2)].filter(Boolean).length;
    
    if (filled === 3) {
      if (field === 'c1' && isNaN(C1)) return true;
      if (field === 'v1' && isNaN(V1)) return true;
      if (field === 'c2' && isNaN(C2)) return true;
      if (field === 'v2' && isNaN(V2)) return true;
    }
    return false;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-slate-900">Dilution Calculator</h2>
        <span className="text-sm text-slate-500 font-mono">C₁V₁ = C₂V₂</span>
      </div>
      <p className="text-sm text-slate-500 mb-6">Enter any 3 values to calculate the 4th</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <InputField 
          label="Stock conc. (C₁)" 
          value={c1} 
          onChange={setC1} 
          unit="M" 
          isCalculated={getIsCalculated('c1')}
        />
        <InputField 
          label="Stock vol. (V₁)" 
          value={v1} 
          onChange={setV1} 
          unit="mL" 
          isCalculated={getIsCalculated('v1')}
        />
        <InputField 
          label="Final conc. (C₂)" 
          value={c2} 
          onChange={setC2} 
          unit="M" 
          isCalculated={getIsCalculated('c2')}
        />
        <InputField 
          label="Final vol. (V₂)" 
          value={v2} 
          onChange={setV2} 
          unit="mL" 
          isCalculated={getIsCalculated('v2')}
        />
      </div>

      {result && (
        <ResultDisplay 
          label={result.label} 
          value={result.value} 
          unit={result.unit}
          onCopy={handleCalculate}
        />
      )}
    </div>
  );
}

// Serial Dilution Calculator
function SerialDilutionCalculator({ onCalculate }: CalculatorProps) {
  const [initialConc, setInitialConc] = useState('');
  const [transferVol, setTransferVol] = useState('');
  const [diluentVol, setDiluentVol] = useState('');
  const [steps, setSteps] = useState('');

  const results = useMemo(() => {
    const C0 = parseFloat(initialConc);
    const Vt = parseFloat(transferVol);
    const Vd = parseFloat(diluentVol);
    const n = parseInt(steps);

    if (C0 > 0 && Vt > 0 && Vd > 0 && n > 0 && n <= 20) {
      const dilutionFactor = Vt / (Vt + Vd);
      const concentrations = [];
      for (let i = 1; i <= n; i++) {
        const conc = C0 * Math.pow(dilutionFactor, i);
        concentrations.push(conc);
      }
      return { dilutionFactor: 1 / dilutionFactor, concentrations };
    }
    return null;
  }, [initialConc, transferVol, diluentVol, steps]);

  const handleCalculate = () => {
    if (results) {
      const finalConc = results.concentrations[results.concentrations.length - 1];
      const equation = `C_final = ${initialConc} × (${transferVol}/(${transferVol}+${diluentVol}))^${steps}`;
      onCalculate('serial', { initialConc, transferVol, diluentVol, steps }, 
        `Final: ${finalConc < 0.001 ? finalConc.toExponential(2) : finalConc.toPrecision(3)} M`, equation);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Serial Dilution Calculator</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <InputField label="Initial concentration" value={initialConc} onChange={setInitialConc} unit="M" />
        <InputField label="Transfer volume" value={transferVol} onChange={setTransferVol} unit="mL" />
        <InputField label="Diluent volume" value={diluentVol} onChange={setDiluentVol} unit="mL" />
        <InputField label="Number of steps" value={steps} onChange={setSteps} placeholder="1-20" />
      </div>

      {results && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-sm text-slate-600">Dilution factor per step</span>
            <div className="text-2xl font-semibold text-amber-600 font-mono mt-1">
              1:{results.dilutionFactor.toFixed(1)}
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-600">Concentrations at each step</span>
              <button 
                onClick={handleCalculate}
                className="text-xs text-amber-600 hover:text-amber-700"
              >
                Save to history
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              {results.concentrations.map((conc, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
                  <span className="text-xs text-slate-500">Step {i + 1}</span>
                  <span className="font-mono text-sm text-slate-900">
                    {conc < 0.001 ? conc.toExponential(2) : conc.toPrecision(3)} M
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Percent Solution Calculator - Flexible 3-field solver
function PercentSolutionCalculator({ onCalculate }: CalculatorProps) {
  const [mode, setMode] = useState<'wv' | 'vv'>('wv');
  const [percent, setPercent] = useState('');
  const [volume, setVolume] = useState('');
  const [amount, setAmount] = useState('');

  const result = useMemo(() => {
    const p = parseFloat(percent);
    const v = parseFloat(volume);
    const a = parseFloat(amount);

    const filled = [!isNaN(p), !isNaN(v), !isNaN(a)];
    const filledCount = filled.filter(Boolean).length;

    if (filledCount !== 2) return null;

    const unitLabel = mode === 'wv' ? 'g' : 'mL';

    if (isNaN(a) && p > 0 && v > 0) {
      const calc = (p / 100) * v;
      return { 
        value: calc.toPrecision(4), 
        unit: unitLabel, 
        label: `${mode === 'wv' ? 'Mass' : 'Volume'} of solute needed`,
        field: 'amount',
        equation: `amount = (${p}% / 100) × ${v} mL = ${calc.toPrecision(4)} ${unitLabel}`
      };
    }
    if (isNaN(p) && a > 0 && v > 0) {
      const calc = (a / v) * 100;
      return { 
        value: calc.toPrecision(4), 
        unit: '%', 
        label: 'Percent concentration',
        field: 'percent',
        equation: `% = (${a} ${unitLabel} / ${v} mL) × 100 = ${calc.toPrecision(4)}%`
      };
    }
    if (isNaN(v) && a > 0 && p > 0) {
      const calc = (a / p) * 100;
      return { 
        value: calc.toPrecision(4), 
        unit: 'mL', 
        label: 'Total volume',
        field: 'volume',
        equation: `V = (${a} ${unitLabel} / ${p}%) × 100 = ${calc.toPrecision(4)} mL`
      };
    }
    return null;
  }, [mode, percent, volume, amount]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('percent', { mode, percent, volume, amount }, `${result.value} ${result.unit}`, result.equation);
    }
  };

  const getIsCalculated = (field: string) => {
    const p = parseFloat(percent);
    const v = parseFloat(volume);
    const a = parseFloat(amount);
    const filled = [!isNaN(p), !isNaN(v), !isNaN(a)].filter(Boolean).length;
    
    if (filled === 2) {
      if (field === 'percent' && isNaN(p)) return true;
      if (field === 'volume' && isNaN(v)) return true;
      if (field === 'amount' && isNaN(a)) return true;
    }
    return false;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-slate-900">Percent Solution Calculator</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">Enter any 2 values to calculate the 3rd</p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('wv')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
            mode === 'wv' 
              ? 'bg-amber-50 border-amber-200 text-amber-700' 
              : 'border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          Weight/Volume (w/v)
        </button>
        <button
          onClick={() => setMode('vv')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
            mode === 'vv' 
              ? 'bg-amber-50 border-amber-200 text-amber-700' 
              : 'border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          Volume/Volume (v/v)
        </button>
      </div>

      <div className="grid gap-4 mb-6">
        <InputField 
          label="Percent" 
          value={percent} 
          onChange={setPercent} 
          unit="%" 
          isCalculated={getIsCalculated('percent')}
        />
        <InputField 
          label="Total volume" 
          value={volume} 
          onChange={setVolume} 
          unit="mL" 
          isCalculated={getIsCalculated('volume')}
        />
        <InputField 
          label={mode === 'wv' ? 'Mass of solute' : 'Volume of solute'} 
          value={amount} 
          onChange={setAmount} 
          unit={mode === 'wv' ? 'g' : 'mL'} 
          isCalculated={getIsCalculated('amount')}
        />
      </div>

      {result && (
        <ResultDisplay 
          label={result.label} 
          value={result.value} 
          unit={result.unit}
          onCopy={handleCalculate}
        />
      )}
    </div>
  );
}

// Unit Converter
function UnitConverter({ onCalculate }: CalculatorProps) {
  const [conversionType, setConversionType] = useState<'mg_to_m' | 'm_to_mg' | 'ppm'>('mg_to_m');
  const [value, setValue] = useState('');
  const [mw, setMw] = useState('');

  const result = useMemo(() => {
    const v = parseFloat(value);
    const w = parseFloat(mw);

    if (conversionType === 'mg_to_m' && v > 0 && w > 0) {
      const M = (v / w) / 1000;
      return { value: M.toPrecision(4), unit: 'M', label: 'Molarity', equation: `M = (${v} mg/mL / ${w} g/mol) / 1000` };
    } else if (conversionType === 'm_to_mg' && v > 0 && w > 0) {
      const mgmL = v * w;
      return { value: mgmL.toPrecision(4), unit: 'mg/mL', label: 'Mass concentration', equation: `mg/mL = ${v} M × ${w} g/mol` };
    } else if (conversionType === 'ppm' && v > 0) {
      return { value: v.toPrecision(4), unit: 'mg/L', label: 'Mass per liter', equation: `${v} ppm = ${v} mg/L` };
    }
    return null;
  }, [conversionType, value, mw]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('conversion', { conversionType, value, mw }, `${result.value} ${result.unit}`, result.equation);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Unit Converter</h2>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
        {[
          { id: 'mg_to_m' as const, label: 'mg/mL → M' },
          { id: 'm_to_mg' as const, label: 'M → mg/mL' },
          { id: 'ppm' as const, label: 'ppm → mg/L' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setConversionType(c.id)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              conversionType === c.id ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 mb-6">
        <InputField 
          label={
            conversionType === 'mg_to_m' ? 'Concentration' : 
            conversionType === 'm_to_mg' ? 'Molarity' : 'PPM value'
          } 
          value={value} 
          onChange={setValue} 
          unit={conversionType === 'mg_to_m' ? 'mg/mL' : conversionType === 'm_to_mg' ? 'M' : 'ppm'} 
        />
        {conversionType !== 'ppm' && (
          <MWInputField value={mw} onChange={setMw} />
        )}
      </div>

      {result && (
        <ResultDisplay 
          label={result.label} 
          value={result.value} 
          unit={result.unit}
          onCopy={handleCalculate}
        />
      )}
    </div>
  );
}

// Stock Solution Calculator - Flexible 4-field solver
function StockSolutionCalculator({ onCalculate }: CalculatorProps) {
  const [stockConc, setStockConc] = useState('');
  const [stockVol, setStockVol] = useState('');
  const [mw, setMw] = useState('');
  const [mass, setMass] = useState('');

  const result = useMemo(() => {
    const c = parseFloat(stockConc);
    const v = parseFloat(stockVol);
    const w = parseFloat(mw);
    const m = parseFloat(mass);

    const filled = [!isNaN(c), !isNaN(v), !isNaN(w), !isNaN(m)];
    const filledCount = filled.filter(Boolean).length;

    if (filledCount !== 3) return null;

    // mass = M × V × MW
    if (isNaN(m) && c > 0 && v > 0 && w > 0) {
      const calc = c * (v / 1000) * w;
      return { 
        value: calc.toPrecision(4), 
        unit: 'g', 
        label: 'Mass needed',
        field: 'mass',
        equation: `mass = ${c} M × ${v/1000} L × ${w} g/mol = ${calc.toPrecision(4)} g`
      };
    }
    // M = mass / (V × MW)
    if (isNaN(c) && m > 0 && v > 0 && w > 0) {
      const calc = m / ((v / 1000) * w);
      return { 
        value: calc.toPrecision(4), 
        unit: 'M', 
        label: 'Stock concentration',
        field: 'stockConc',
        equation: `M = ${m} g / (${v/1000} L × ${w} g/mol) = ${calc.toPrecision(4)} M`
      };
    }
    // V = mass / (M × MW)
    if (isNaN(v) && m > 0 && c > 0 && w > 0) {
      const calc = (m / (c * w)) * 1000;
      return { 
        value: calc.toPrecision(4), 
        unit: 'mL', 
        label: 'Volume to prepare',
        field: 'stockVol',
        equation: `V = ${m} g / (${c} M × ${w} g/mol) × 1000 = ${calc.toPrecision(4)} mL`
      };
    }
    // MW = mass / (M × V)
    if (isNaN(w) && m > 0 && c > 0 && v > 0) {
      const calc = m / (c * (v / 1000));
      return { 
        value: calc.toPrecision(4), 
        unit: 'g/mol', 
        label: 'Molecular weight',
        field: 'mw',
        equation: `MW = ${m} g / (${c} M × ${v/1000} L) = ${calc.toPrecision(4)} g/mol`
      };
    }
    return null;
  }, [stockConc, stockVol, mw, mass]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('stock', { stockConc, stockVol, mw, mass }, `${result.value} ${result.unit}`, result.equation);
    }
  };

  const getIsCalculated = (field: string) => {
    const c = parseFloat(stockConc);
    const v = parseFloat(stockVol);
    const w = parseFloat(mw);
    const m = parseFloat(mass);
    const filled = [!isNaN(c), !isNaN(v), !isNaN(w), !isNaN(m)].filter(Boolean).length;
    
    if (filled === 3) {
      if (field === 'stockConc' && isNaN(c)) return true;
      if (field === 'stockVol' && isNaN(v)) return true;
      if (field === 'mw' && isNaN(w)) return true;
      if (field === 'mass' && isNaN(m)) return true;
    }
    return false;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-slate-900">Stock Solution Prep</h2>
        <span className="text-sm text-slate-500 font-mono">m = M × V × MW</span>
      </div>
      <p className="text-sm text-slate-500 mb-6">Enter any 3 values to calculate the 4th</p>

      <div className="grid gap-4 mb-6">
        <InputField 
          label="Desired stock concentration" 
          value={stockConc} 
          onChange={setStockConc} 
          unit="M" 
          isCalculated={getIsCalculated('stockConc')}
        />
        <InputField 
          label="Volume to prepare" 
          value={stockVol} 
          onChange={setStockVol} 
          unit="mL" 
          isCalculated={getIsCalculated('stockVol')}
        />
        <MWInputField 
          value={mw} 
          onChange={setMw} 
          isCalculated={getIsCalculated('mw')}
        />
        <InputField 
          label="Mass of compound" 
          value={mass} 
          onChange={setMass} 
          unit="g" 
          isCalculated={getIsCalculated('mass')}
        />
      </div>

      {result && (
        <div className="space-y-4">
          <ResultDisplay 
            label={result.label} 
            value={result.value} 
            unit={result.unit}
            onCopy={handleCalculate}
          />
          {result.field === 'mass' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-sm text-slate-600 block mb-2">Instructions</span>
              <p className="text-sm text-slate-900">
                Weigh {result.value} g of compound. Dissolve in ~{(parseFloat(stockVol) * 0.8).toFixed(0)} mL solvent. 
                Adjust final volume to {stockVol} mL.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Buffer Calculator
function BufferCalculator({ onCalculate }: CalculatorProps) {
  const [selectedBuffer, setSelectedBuffer] = useState('');
  const [targetPH, setTargetPH] = useState('');
  const [totalConc, setTotalConc] = useState('');

  const result = useMemo(() => {
    const buffer = BUFFER_PKA[selectedBuffer];
    const pH = parseFloat(targetPH);
    const C = parseFloat(totalConc);

    if (buffer && pH > 0 && C > 0) {
      const ratio = Math.pow(10, pH - buffer.pka);
      const baseConc = (C * ratio) / (1 + ratio);
      const acidConc = C - baseConc;
      return {
        pka: buffer.pka,
        ratio,
        baseConc: baseConc.toPrecision(4),
        acidConc: acidConc.toPrecision(4),
        percentBase: ((baseConc / C) * 100).toFixed(1),
        percentAcid: ((acidConc / C) * 100).toFixed(1),
      };
    }
    return null;
  }, [selectedBuffer, targetPH, totalConc]);

  const handleCalculate = () => {
    if (result) {
      const equation = `pH = ${result.pka} + log([A⁻]/[HA]) = ${result.pka} + log(${result.ratio.toFixed(3)})`;
      onCalculate('buffer', { selectedBuffer, targetPH, totalConc }, 
        `[A⁻]=${result.baseConc} M, [HA]=${result.acidConc} M`, equation);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Buffer Calculator</h2>
      <p className="text-sm text-slate-500 mb-6">Henderson–Hasselbalch equation</p>

      <div className="grid gap-4 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Buffer system</label>
          <select
            value={selectedBuffer}
            onChange={(e) => setSelectedBuffer(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Select a buffer...</option>
            {Object.entries(BUFFER_PKA).map(([key, val]) => (
              <option key={key} value={key}>
                {val.name} (pKa {val.pka}, range {val.range})
              </option>
            ))}
          </select>
        </div>
        <InputField label="Target pH" value={targetPH} onChange={setTargetPH} />
        <InputField label="Total buffer concentration" value={totalConc} onChange={setTotalConc} unit="M" />
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-sm text-slate-600">Base form [A⁻]</span>
              <div className="text-2xl font-semibold text-amber-600 font-mono mt-1">{result.baseConc} M</div>
              <div className="text-xs text-slate-500 mt-1">{result.percentBase}% of total</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-sm text-slate-600">Acid form [HA]</span>
              <div className="text-2xl font-semibold text-amber-600 font-mono mt-1">{result.acidConc} M</div>
              <div className="text-xs text-slate-500 mt-1">{result.percentAcid}% of total</div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-sm text-slate-600">[A⁻]/[HA] ratio</span>
              <div className="text-xl font-semibold text-slate-900 font-mono mt-1">{result.ratio.toFixed(3)}</div>
            </div>
            <button 
              onClick={handleCalculate}
              className="text-xs text-amber-600 hover:text-amber-700"
            >
              Save to history
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Osmolarity Calculator - Flexible 3-field solver
function OsmolarityCalculator({ onCalculate }: CalculatorProps) {
  const [molarity, setMolarity] = useState('');
  const [particles, setParticles] = useState('');
  const [osmolarity, setOsmolarity] = useState('');

  const result = useMemo(() => {
    const M = parseFloat(molarity);
    const i = parseFloat(particles);
    const O = parseFloat(osmolarity);

    const filled = [!isNaN(M), !isNaN(i), !isNaN(O)];
    const filledCount = filled.filter(Boolean).length;

    if (filledCount !== 2) return null;

    if (isNaN(O) && M > 0 && i > 0) {
      const calc = M * i * 1000;
      return { 
        value: calc.toPrecision(4), 
        unit: 'mOsm/L', 
        label: 'Osmolarity',
        field: 'osmolarity',
        equation: `Osm = ${M} M × ${i} × 1000 = ${calc.toPrecision(4)} mOsm/L`
      };
    }
    if (isNaN(M) && O > 0 && i > 0) {
      const calc = O / (i * 1000);
      return { 
        value: calc.toPrecision(4), 
        unit: 'M', 
        label: 'Molarity',
        field: 'molarity',
        equation: `M = ${O} mOsm/L / (${i} × 1000) = ${calc.toPrecision(4)} M`
      };
    }
    if (isNaN(i) && M > 0 && O > 0) {
      const calc = O / (M * 1000);
      return { 
        value: calc.toPrecision(2), 
        unit: '', 
        label: 'Dissociation coefficient (i)',
        field: 'particles',
        equation: `i = ${O} mOsm/L / (${M} M × 1000) = ${calc.toPrecision(2)}`
      };
    }
    return null;
  }, [molarity, particles, osmolarity]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('osmolarity', { molarity, particles, osmolarity }, `${result.value} ${result.unit}`, result.equation);
    }
  };

  const getIsCalculated = (field: string) => {
    const M = parseFloat(molarity);
    const i = parseFloat(particles);
    const O = parseFloat(osmolarity);
    const filled = [!isNaN(M), !isNaN(i), !isNaN(O)].filter(Boolean).length;
    
    if (filled === 2) {
      if (field === 'molarity' && isNaN(M)) return true;
      if (field === 'particles' && isNaN(i)) return true;
      if (field === 'osmolarity' && isNaN(O)) return true;
    }
    return false;
  };

  const commonSolutes = [
    { name: 'NaCl', i: 2 },
    { name: 'KCl', i: 2 },
    { name: 'CaCl₂', i: 3 },
    { name: 'MgCl₂', i: 3 },
    { name: 'Glucose', i: 1 },
    { name: 'Sucrose', i: 1 },
    { name: 'Urea', i: 1 },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-slate-900">Osmolarity Calculator</h2>
        <span className="text-sm text-slate-500 font-mono">Osm = M × i</span>
      </div>
      <p className="text-sm text-slate-500 mb-6">Enter any 2 values to calculate the 3rd</p>

      <div className="grid gap-4 mb-6">
        <InputField 
          label="Molarity" 
          value={molarity} 
          onChange={setMolarity} 
          unit="M" 
          isCalculated={getIsCalculated('molarity')}
        />
        <InputField 
          label="Dissociation coefficient (i)" 
          value={particles} 
          onChange={setParticles} 
          helper="Number of particles the solute dissociates into"
          isCalculated={getIsCalculated('particles')}
        />
        <InputField 
          label="Osmolarity" 
          value={osmolarity} 
          onChange={setOsmolarity} 
          unit="mOsm/L" 
          isCalculated={getIsCalculated('osmolarity')}
        />
      </div>

      <div className="mb-6">
        <span className="text-xs text-slate-500 block mb-2">Quick select (i value)</span>
        <div className="flex flex-wrap gap-2">
          {commonSolutes.map((s) => (
            <button
              key={s.name}
              onClick={() => setParticles(s.i.toString())}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all"
            >
              {s.name} (i={s.i})
            </button>
          ))}
        </div>
      </div>

      {result && (
        <ResultDisplay 
          label={result.label} 
          value={result.value} 
          unit={result.unit}
          onCopy={handleCalculate}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function QuickReference({ activeTab }: { activeTab: CalculatorTab }) {
  const references: Record<CalculatorTab, { title: string; formula: string; description: string }[]> = {
    molarity: [
      { title: 'Molarity', formula: 'M = moles / L', description: 'Moles of solute per liter of solution' },
      { title: 'Moles from mass', formula: 'n = m / MW', description: 'Mass divided by molecular weight' },
      { title: 'Mass needed', formula: 'm = M × V × MW', description: 'To prepare a specific molarity solution' },
    ],
    dilution: [
      { title: 'Dilution equation', formula: 'C₁V₁ = C₂V₂', description: 'Conservation of moles during dilution' },
      { title: 'Fold dilution', formula: 'Fold = V₂ / V₁', description: 'Ratio of final to initial volume' },
    ],
    serial: [
      { title: 'Serial dilution', formula: 'Cₙ = C₀ × (Vₜ / Vₜₒₜₐₗ)ⁿ', description: 'Concentration after n dilution steps' },
    ],
    percent: [
      { title: 'Weight/volume %', formula: '% = (g / 100 mL) × 100', description: 'Grams of solute per 100 mL' },
      { title: 'Volume/volume %', formula: '% = (mL / 100 mL) × 100', description: 'mL of solute per 100 mL' },
    ],
    conversion: [
      { title: 'mg/mL to M', formula: 'M = (mg/mL) / MW', description: 'Divide by molecular weight' },
      { title: 'M to mg/mL', formula: 'mg/mL = M × MW', description: 'Multiply by molecular weight' },
      { title: 'ppm', formula: '1 ppm = 1 mg/L', description: 'Parts per million equivalence' },
    ],
    stock: [
      { title: 'Stock preparation', formula: 'm = Mₛ × Vₛ × MW', description: 'Mass to prepare a stock solution' },
    ],
    buffer: [
      { title: 'Henderson-Hasselbalch', formula: 'pH = pKa + log([A⁻]/[HA])', description: 'Relationship between pH and buffer ratio' },
    ],
    osmolarity: [
      { title: 'Osmolarity', formula: 'Osm = M × i', description: 'Molarity times dissociation coefficient' },
    ],
  };

  const ref = references[activeTab];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
        Quick Reference
      </h3>
      <div className="space-y-4">
        {ref.map((r, i) => (
          <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-900">{r.title}</span>
            </div>
            <code className="text-lg text-amber-600 font-mono">{r.formula}</code>
            <p className="text-xs text-slate-500 mt-2">{r.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommonRecipes() {
  const recipes = [
    { name: '10× PBS', components: ['1.37 M NaCl', '27 mM KCl', '100 mM Na₂HPO₄', '18 mM KH₂PO₄', 'pH 7.4'] },
    { name: '1× TAE Buffer', components: ['40 mM Tris-acetate', '1 mM EDTA', 'pH 8.3'] },
    { name: '1× TBE Buffer', components: ['89 mM Tris', '89 mM Boric acid', '2 mM EDTA', 'pH 8.3'] },
    { name: 'LB Medium', components: ['1% Tryptone', '0.5% Yeast extract', '1% NaCl', 'pH 7.0'] },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
        Common Buffer Recipes
      </h3>
      <div className="grid gap-3">
        {recipes.map((r, i) => (
          <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-sm font-medium text-amber-600 block mb-2">{r.name}</span>
            <div className="flex flex-wrap gap-2">
              {r.components.map((c, j) => (
                <span key={j} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

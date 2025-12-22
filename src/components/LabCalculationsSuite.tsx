import { useState, useMemo, useRef, useEffect } from 'react';

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

  const addToHistory = (type: CalculatorTab, inputs: Record<string, string | number>, result: string) => {
    const entry: CalculationHistory = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date(),
      inputs,
      result,
    };
    setHistory(prev => [entry, ...prev].slice(0, 50));
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
            
            <div className="flex items-center gap-3">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
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
  onCalculate: (type: CalculatorTab, inputs: Record<string, string | number>, result: string) => void;
}

function InputField({ 
  label, 
  value, 
  onChange, 
  unit, 
  placeholder = '0',
  helper
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  unit?: string; 
  placeholder?: string;
  helper?: string;
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
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-lg font-mono placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">{unit}</span>
        )}
      </div>
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

// MW Input Field with inline search
function MWInputField({ 
  value, 
  onChange,
  label = "Molecular weight"
}: { 
  value: string; 
  onChange: (v: string) => void;
  label?: string;
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
              placeholder="0"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-lg font-mono placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all pr-16"
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

// Molarity Calculator
function MolarityCalculator({ onCalculate }: CalculatorProps) {
  const [mode, setMode] = useState<'molarity' | 'mass' | 'moles'>('molarity');
  const [mass, setMass] = useState('');
  const [mw, setMw] = useState('');
  const [volume, setVolume] = useState('');
  const [molarity, setMolarity] = useState('');

  const result = useMemo(() => {
    const m = parseFloat(mass);
    const w = parseFloat(mw);
    const v = parseFloat(volume);
    const mol = parseFloat(molarity);

    if (mode === 'molarity' && m > 0 && w > 0 && v > 0) {
      const moles = m / w;
      const M = moles / (v / 1000);
      return { value: M.toPrecision(4), unit: 'M', label: 'Molarity' };
    } else if (mode === 'mass' && mol > 0 && w > 0 && v > 0) {
      const massNeeded = mol * (v / 1000) * w;
      return { value: massNeeded.toPrecision(4), unit: 'g', label: 'Mass needed' };
    } else if (mode === 'moles' && m > 0 && w > 0) {
      const moles = m / w;
      return { value: moles.toPrecision(4), unit: 'mol', label: 'Moles' };
    }
    return null;
  }, [mode, mass, mw, volume, molarity]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('molarity', { mode, mass, mw, volume, molarity }, `${result.value} ${result.unit}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Molarity Calculator</h2>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {(['molarity', 'mass', 'moles'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                mode === m ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m === 'molarity' ? 'Find M' : m === 'mass' ? 'Find Mass' : 'Find Moles'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 mb-6">
        {mode !== 'mass' && (
          <InputField label="Mass of solute" value={mass} onChange={setMass} unit="g" />
        )}
        <MWInputField value={mw} onChange={setMw} />
        {mode !== 'moles' && (
          <InputField label="Volume of solution" value={volume} onChange={setVolume} unit="mL" />
        )}
        {mode === 'mass' && (
          <InputField label="Desired molarity" value={molarity} onChange={setMolarity} unit="M" />
        )}
      </div>

      {result && (
        <div className="mb-4">
          <ResultDisplay 
            label={result.label} 
            value={result.value} 
            unit={result.unit} 
            onCopy={handleCalculate}
          />
        </div>
      )}
    </div>
  );
}

// Dilution Calculator
function DilutionCalculator({ onCalculate }: CalculatorProps) {
  const [c1, setC1] = useState('');
  const [v1, setV1] = useState('');
  const [c2, setC2] = useState('');
  const [v2, setV2] = useState('');
  const [solve, setSolve] = useState<'v1' | 'c2' | 'v2'>('v1');

  const result = useMemo(() => {
    const C1 = parseFloat(c1);
    const V1 = parseFloat(v1);
    const C2 = parseFloat(c2);
    const V2 = parseFloat(v2);

    if (solve === 'v1' && C1 > 0 && C2 > 0 && V2 > 0) {
      const calculated = (C2 * V2) / C1;
      return { value: calculated.toPrecision(4), unit: 'mL', label: 'Stock volume needed (V₁)' };
    } else if (solve === 'c2' && C1 > 0 && V1 > 0 && V2 > 0) {
      const calculated = (C1 * V1) / V2;
      return { value: calculated.toPrecision(4), unit: 'M', label: 'Final concentration (C₂)' };
    } else if (solve === 'v2' && C1 > 0 && V1 > 0 && C2 > 0) {
      const calculated = (C1 * V1) / C2;
      return { value: calculated.toPrecision(4), unit: 'mL', label: 'Final volume (V₂)' };
    }
    return null;
  }, [c1, v1, c2, v2, solve]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('dilution', { c1, v1, c2, v2, solve }, `${result.value} ${result.unit}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Dilution Calculator</h2>
        <span className="text-sm text-slate-500 font-mono">C₁V₁ = C₂V₂</span>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
        {(['v1', 'c2', 'v2'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSolve(s)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              solve === s ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {s === 'v1' ? 'Find V₁' : s === 'c2' ? 'Find C₂' : 'Find V₂'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <InputField label="Stock conc. (C₁)" value={c1} onChange={setC1} unit="M" />
        {solve !== 'v1' && (
          <InputField label="Stock vol. (V₁)" value={v1} onChange={setV1} unit="mL" />
        )}
        {solve !== 'c2' && (
          <InputField label="Final conc. (C₂)" value={c2} onChange={setC2} unit="M" />
        )}
        {solve !== 'v2' && (
          <InputField label="Final vol. (V₂)" value={v2} onChange={setV2} unit="mL" />
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

// Serial Dilution Calculator
function SerialDilutionCalculator({ onCalculate: _onCalculate }: CalculatorProps) {
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
            <span className="text-sm text-slate-600 block mb-3">Concentrations at each step</span>
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

// Percent Solution Calculator
function PercentSolutionCalculator({ onCalculate }: CalculatorProps) {
  const [mode, setMode] = useState<'wv' | 'vv'>('wv');
  const [percent, setPercent] = useState('');
  const [volume, setVolume] = useState('');
  const [solve, setSolve] = useState<'amount' | 'percent'>('amount');
  const [amount, setAmount] = useState('');

  const result = useMemo(() => {
    const p = parseFloat(percent);
    const v = parseFloat(volume);
    const a = parseFloat(amount);

    if (solve === 'amount' && p > 0 && v > 0) {
      const needed = (p / 100) * v;
      return { 
        value: needed.toPrecision(4), 
        unit: mode === 'wv' ? 'g' : 'mL', 
        label: `${mode === 'wv' ? 'Mass' : 'Volume'} of solute needed` 
      };
    } else if (solve === 'percent' && a > 0 && v > 0) {
      const calculated = (a / v) * 100;
      return { value: calculated.toPrecision(4), unit: '%', label: 'Percent concentration' };
    }
    return null;
  }, [mode, percent, volume, amount, solve]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('percent', { mode, percent, volume, amount, solve }, `${result.value} ${result.unit}`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Percent Solution Calculator</h2>

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

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
        <button
          onClick={() => setSolve('amount')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            solve === 'amount' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Find Amount
        </button>
        <button
          onClick={() => setSolve('percent')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            solve === 'percent' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Find %
        </button>
      </div>

      <div className="grid gap-4 mb-6">
        {solve === 'amount' && (
          <InputField label="Desired percent" value={percent} onChange={setPercent} unit="%" />
        )}
        <InputField label="Total volume" value={volume} onChange={setVolume} unit="mL" />
        {solve === 'percent' && (
          <InputField 
            label={mode === 'wv' ? 'Mass of solute' : 'Volume of solute'} 
            value={amount} 
            onChange={setAmount} 
            unit={mode === 'wv' ? 'g' : 'mL'} 
          />
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
      return { value: M.toPrecision(4), unit: 'M', label: 'Molarity' };
    } else if (conversionType === 'm_to_mg' && v > 0 && w > 0) {
      const mgmL = v * w;
      return { value: mgmL.toPrecision(4), unit: 'mg/mL', label: 'Mass concentration' };
    } else if (conversionType === 'ppm' && v > 0) {
      return { value: v.toPrecision(4), unit: 'mg/L', label: 'Mass per liter' };
    }
    return null;
  }, [conversionType, value, mw]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('conversion', { conversionType, value, mw }, `${result.value} ${result.unit}`);
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

// Stock Solution Calculator
function StockSolutionCalculator({ onCalculate }: CalculatorProps) {
  const [stockConc, setStockConc] = useState('');
  const [stockVol, setStockVol] = useState('');
  const [mw, setMw] = useState('');

  const result = useMemo(() => {
    const c = parseFloat(stockConc);
    const v = parseFloat(stockVol);
    const w = parseFloat(mw);

    if (c > 0 && v > 0 && w > 0) {
      const mass = c * (v / 1000) * w;
      return { value: mass.toPrecision(4), unit: 'g', label: 'Mass needed' };
    }
    return null;
  }, [stockConc, stockVol, mw]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('stock', { stockConc, stockVol, mw }, `${result.value} ${result.unit}`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Stock Solution Prep</h2>

      <div className="grid gap-4 mb-6">
        <InputField label="Desired stock concentration" value={stockConc} onChange={setStockConc} unit="M" />
        <InputField label="Volume to prepare" value={stockVol} onChange={setStockVol} unit="mL" />
        <MWInputField value={mw} onChange={setMw} />
      </div>

      {result && (
        <div className="space-y-4">
          <ResultDisplay 
            label={result.label} 
            value={result.value} 
            unit={result.unit}
            onCopy={handleCalculate}
          />
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-sm text-slate-600 block mb-2">Instructions</span>
            <p className="text-sm text-slate-900">
              Weigh {result.value} g of compound. Dissolve in ~{(parseFloat(stockVol) * 0.8).toFixed(0)} mL solvent. 
              Adjust final volume to {stockVol} mL.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Buffer Calculator
function BufferCalculator({ onCalculate: _onCalculate }: CalculatorProps) {
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
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-sm text-slate-600">[A⁻]/[HA] ratio</span>
            <div className="text-xl font-semibold text-slate-900 font-mono mt-1">{result.ratio.toFixed(3)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Osmolarity Calculator
function OsmolarityCalculator({ onCalculate }: CalculatorProps) {
  const [molarity, setMolarity] = useState('');
  const [particles, setParticles] = useState('');

  const result = useMemo(() => {
    const M = parseFloat(molarity);
    const i = parseFloat(particles);

    if (M > 0 && i > 0) {
      const osm = M * i * 1000;
      return { value: osm.toPrecision(4), unit: 'mOsm/L', label: 'Osmolarity' };
    }
    return null;
  }, [molarity, particles]);

  const handleCalculate = () => {
    if (result) {
      onCalculate('osmolarity', { molarity, particles }, `${result.value} ${result.unit}`);
    }
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
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Osmolarity Calculator</h2>

      <div className="grid gap-4 mb-6">
        <InputField label="Molarity" value={molarity} onChange={setMolarity} unit="M" />
        <InputField 
          label="Dissociation coefficient (i)" 
          value={particles} 
          onChange={setParticles} 
          helper="Number of particles the solute dissociates into"
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

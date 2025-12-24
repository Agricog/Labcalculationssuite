import { useState, useEffect, useMemo } from 'react'
import { 
  FlaskConical, Calculator, Droplets, TestTube, Percent, ArrowRightLeft,
  Beaker, Scale, Activity, Search, X, Copy, Check, History, Trash2,
  ChevronDown, ChevronUp, Info, Database, FolderPlus, Folder, Download,
  FileText, Plus, FolderOpen
} from 'lucide-react'
import jsPDF from 'jspdf'

// Types
interface Compound {
  name: string
  formula: string
  mw: number
  category: string
}

interface CalculationRecord {
  id: string
  calculator: string
  inputs: Record<string, string>
  result: { label: string; value: string; unit: string }
  equation: string
  timestamp: Date
}

interface Project {
  id: string
  name: string
  calculations: CalculationRecord[]
  createdAt: Date
  updatedAt: Date
}

// Molecular Weight Database
const compounds: Compound[] = [
  { name: 'Sodium Chloride', formula: 'NaCl', mw: 58.44, category: 'Salts' },
  { name: 'Potassium Chloride', formula: 'KCl', mw: 74.55, category: 'Salts' },
  { name: 'Calcium Chloride', formula: 'CaCl₂', mw: 110.98, category: 'Salts' },
  { name: 'Magnesium Chloride', formula: 'MgCl₂', mw: 95.21, category: 'Salts' },
  { name: 'Sodium Bicarbonate', formula: 'NaHCO₃', mw: 84.01, category: 'Salts' },
  { name: 'Sodium Phosphate Dibasic', formula: 'Na₂HPO₄', mw: 141.96, category: 'Salts' },
  { name: 'Potassium Phosphate Monobasic', formula: 'KH₂PO₄', mw: 136.09, category: 'Salts' },
  { name: 'Ammonium Sulfate', formula: '(NH₄)₂SO₄', mw: 132.14, category: 'Salts' },
  { name: 'HEPES', formula: 'C₈H₁₈N₂O₄S', mw: 238.30, category: 'Buffers' },
  { name: 'Tris Base', formula: 'C₄H₁₁NO₃', mw: 121.14, category: 'Buffers' },
  { name: 'Tris-HCl', formula: 'C₄H₁₁NO₃·HCl', mw: 157.60, category: 'Buffers' },
  { name: 'MOPS', formula: 'C₇H₁₅NO₄S', mw: 209.26, category: 'Buffers' },
  { name: 'MES', formula: 'C₆H₁₃NO₄S', mw: 195.24, category: 'Buffers' },
  { name: 'PIPES', formula: 'C₈H₁₈N₂O₆S₂', mw: 302.37, category: 'Buffers' },
  { name: 'Bicine', formula: 'C₆H₁₃NO₄', mw: 163.17, category: 'Buffers' },
  { name: 'Tricine', formula: 'C₆H₁₃NO₅', mw: 179.17, category: 'Buffers' },
  { name: 'EDTA Disodium', formula: 'C₁₀H₁₄N₂Na₂O₈·2H₂O', mw: 372.24, category: 'Chelators' },
  { name: 'EGTA', formula: 'C₁₄H₂₄N₂O₁₀', mw: 380.35, category: 'Chelators' },
  { name: 'Glucose', formula: 'C₆H₁₂O₆', mw: 180.16, category: 'Sugars' },
  { name: 'Sucrose', formula: 'C₁₂H₂₂O₁₁', mw: 342.30, category: 'Sugars' },
  { name: 'Mannitol', formula: 'C₆H₁₄O₆', mw: 182.17, category: 'Sugars' },
  { name: 'Glycerol', formula: 'C₃H₈O₃', mw: 92.09, category: 'Sugars' },
  { name: 'BSA', formula: 'Bovine Serum Albumin', mw: 66430, category: 'Proteins' },
  { name: 'Lysozyme', formula: 'Chicken Egg White', mw: 14300, category: 'Proteins' },
  { name: 'SDS', formula: 'C₁₂H₂₅NaO₄S', mw: 288.38, category: 'Detergents' },
  { name: 'Triton X-100', formula: 'C₁₄H₂₂O(C₂H₄O)ₙ', mw: 625, category: 'Detergents' },
  { name: 'Tween 20', formula: 'Polysorbate 20', mw: 1228, category: 'Detergents' },
  { name: 'DTT', formula: 'C₄H₁₀O₂S₂', mw: 154.25, category: 'Reducing Agents' },
  { name: 'β-Mercaptoethanol', formula: 'C₂H₆OS', mw: 78.13, category: 'Reducing Agents' },
  { name: 'TCEP', formula: 'C₉H₁₅O₆P', mw: 250.19, category: 'Reducing Agents' },
  { name: 'Urea', formula: 'CH₄N₂O', mw: 60.06, category: 'Denaturants' },
  { name: 'Guanidine HCl', formula: 'CH₆ClN₃', mw: 95.53, category: 'Denaturants' },
  { name: 'Imidazole', formula: 'C₃H₄N₂', mw: 68.08, category: 'Affinity' },
  { name: 'ATP', formula: 'C₁₀H₁₆N₅O₁₃P₃', mw: 507.18, category: 'Nucleotides' },
  { name: 'ADP', formula: 'C₁₀H₁₅N₅O₁₀P₂', mw: 427.20, category: 'Nucleotides' },
  { name: 'NAD+', formula: 'C₂₁H₂₇N₇O₁₄P₂', mw: 663.43, category: 'Coenzymes' },
  { name: 'NADH', formula: 'C₂₁H₂₉N₇O₁₄P₂', mw: 665.44, category: 'Coenzymes' },
  { name: 'Glycine', formula: 'C₂H₅NO₂', mw: 75.07, category: 'Amino Acids' },
  { name: 'L-Glutamine', formula: 'C₅H₁₀N₂O₃', mw: 146.14, category: 'Amino Acids' },
  { name: 'PMSF', formula: 'C₇H₇FO₂S', mw: 174.19, category: 'Protease Inhibitors' },
  { name: 'Aprotinin', formula: 'C₂₈₄H₄₃₂N₈₄O₇₉S₇', mw: 6512, category: 'Protease Inhibitors' },
]

// Calculator Components
const calculators = [
  { id: 'molarity', name: 'Molarity', icon: FlaskConical, color: 'indigo' },
  { id: 'dilution', name: 'Dilution', icon: Droplets, color: 'blue' },
  { id: 'serial', name: 'Serial Dilution', icon: TestTube, color: 'cyan' },
  { id: 'percent', name: 'Percent Solutions', icon: Percent, color: 'emerald' },
  { id: 'convert', name: 'Unit Converter', icon: ArrowRightLeft, color: 'amber' },
  { id: 'stock', name: 'Stock Preparation', icon: Beaker, color: 'orange' },
  { id: 'buffer', name: 'Buffer Calculator', icon: Scale, color: 'purple' },
  { id: 'osmolarity', name: 'Osmolarity', icon: Activity, color: 'rose' },
]

// Flexible Input Component
function FlexibleInput({ 
  label, 
  value, 
  onChange, 
  unit, 
  placeholder,
  onMWSearch,
  showMWSearch = false,
  isCalculated = false
}: {
  label: string
  value: string
  onChange: (v: string) => void
  unit?: string
  placeholder?: string
  onMWSearch?: () => void
  showMWSearch?: boolean
  isCalculated?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || (isCalculated ? 'Leave blank to calculate' : 'Enter value')}
          className={`w-full px-3 py-2 border rounded-lg transition-colors ${
            isCalculated 
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold' 
              : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
          } ${showMWSearch ? 'pr-20' : unit ? 'pr-16' : ''}`}
        />
        {showMWSearch && (
          <button
            onClick={onMWSearch}
            className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600"
            title="Search MW Database"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {unit}
          </span>
        )}
      </div>
      {isCalculated && <p className="text-xs text-indigo-600">← Calculated value</p>}
    </div>
  )
}

// Molarity Calculator with flexible inputs
function MolarityCalculator({ 
  onAddToProject, 
  onMWSearch 
}: { 
  onAddToProject: (calc: CalculationRecord) => void
  onMWSearch: (callback: (mw: number) => void) => void
}) {
  const [mass, setMass] = useState('')
  const [molarity, setMolarity] = useState('')
  const [volume, setVolume] = useState('')
  const [mw, setMW] = useState('')
  const [result, setResult] = useState<{ label: string; value: string; unit: string } | null>(null)

  const calculate = () => {
    const m = parseFloat(mass)
    const M = parseFloat(molarity)
    const V = parseFloat(volume)
    const MW = parseFloat(mw)

    const filled = [!isNaN(m), !isNaN(M), !isNaN(V), !isNaN(MW)]
    const filledCount = filled.filter(Boolean).length

    if (filledCount !== 3) {
      setResult({ label: 'Error', value: 'Enter exactly 3 values', unit: '' })
      return
    }

    let calcResult: { label: string; value: string; unit: string }
    let equation = ''

    if (isNaN(m)) {
      // Calculate mass: mass = M × V × MW
      const calcMass = M * V * MW
      setMass(calcMass.toFixed(4))
      calcResult = { label: 'Mass needed', value: calcMass.toFixed(4), unit: 'g' }
      equation = `mass = ${M} M × ${V} L × ${MW} g/mol = ${calcMass.toFixed(4)} g`
    } else if (isNaN(M)) {
      // Calculate molarity: M = mass / (V × MW)
      const calcM = m / (V * MW)
      setMolarity(calcM.toFixed(6))
      calcResult = { label: 'Molarity', value: calcM.toFixed(6), unit: 'M' }
      equation = `M = ${m} g ÷ (${V} L × ${MW} g/mol) = ${calcM.toFixed(6)} M`
    } else if (isNaN(V)) {
      // Calculate volume: V = mass / (M × MW)
      const calcV = m / (M * MW)
      setVolume(calcV.toFixed(6))
      calcResult = { label: 'Volume', value: calcV.toFixed(6), unit: 'L' }
      equation = `V = ${m} g ÷ (${M} M × ${MW} g/mol) = ${calcV.toFixed(6)} L`
    } else {
      // Calculate MW: MW = mass / (M × V)
      const calcMW = m / (M * V)
      setMW(calcMW.toFixed(2))
      calcResult = { label: 'Molecular Weight', value: calcMW.toFixed(2), unit: 'g/mol' }
      equation = `MW = ${m} g ÷ (${M} M × ${V} L) = ${calcMW.toFixed(2)} g/mol`
    }

    setResult(calcResult)

    // Add to project
    onAddToProject({
      id: Date.now().toString(),
      calculator: 'Molarity',
      inputs: { mass: mass || calcResult.value, molarity: molarity || calcResult.value, volume: volume || calcResult.value, mw: mw || calcResult.value },
      result: calcResult,
      equation,
      timestamp: new Date()
    })
  }

  const clear = () => {
    setMass('')
    setMolarity('')
    setVolume('')
    setMW('')
    setResult(null)
  }

  const isCalculated = (val: string) => {
    const filled = [mass, molarity, volume, mw].filter(v => v !== '').length
    return filled === 3 && val === ''
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
        <p className="font-medium mb-1">Equation: mass (g) = M × V × MW</p>
        <p className="text-xs">Leave one field blank to calculate it from the other three.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FlexibleInput
          label="Mass"
          value={mass}
          onChange={setMass}
          unit="g"
          isCalculated={isCalculated(mass)}
        />
        <FlexibleInput
          label="Molarity (M)"
          value={molarity}
          onChange={setMolarity}
          unit="M"
          isCalculated={isCalculated(molarity)}
        />
        <FlexibleInput
          label="Volume"
          value={volume}
          onChange={setVolume}
          unit="L"
          isCalculated={isCalculated(volume)}
        />
        <FlexibleInput
          label="Molecular Weight"
          value={mw}
          onChange={setMW}
          unit="g/mol"
          showMWSearch
          onMWSearch={() => onMWSearch((selectedMW) => setMW(selectedMW.toString()))}
          isCalculated={isCalculated(mw)}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={calculate}
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Calculate
        </button>
        <button
          onClick={clear}
          className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Clear
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.label === 'Error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="font-medium">{result.label}: {result.value} {result.unit}</p>
        </div>
      )}
    </div>
  )
}

// Dilution Calculator (C1V1 = C2V2)
function DilutionCalculator({ 
  onAddToProject 
}: { 
  onAddToProject: (calc: CalculationRecord) => void 
}) {
  const [c1, setC1] = useState('')
  const [v1, setV1] = useState('')
  const [c2, setC2] = useState('')
  const [v2, setV2] = useState('')
  const [result, setResult] = useState<{ label: string; value: string; unit: string } | null>(null)

  const calculate = () => {
    const C1 = parseFloat(c1)
    const V1 = parseFloat(v1)
    const C2 = parseFloat(c2)
    const V2 = parseFloat(v2)

    const filled = [!isNaN(C1), !isNaN(V1), !isNaN(C2), !isNaN(V2)]
    const filledCount = filled.filter(Boolean).length

    if (filledCount !== 3) {
      setResult({ label: 'Error', value: 'Enter exactly 3 values', unit: '' })
      return
    }

    let calcResult: { label: string; value: string; unit: string }
    let equation = ''

    if (isNaN(C1)) {
      const calc = (C2 * V2) / V1
      setC1(calc.toFixed(6))
      calcResult = { label: 'Stock Concentration (C₁)', value: calc.toFixed(6), unit: '' }
      equation = `C₁ = (${C2} × ${V2}) ÷ ${V1} = ${calc.toFixed(6)}`
    } else if (isNaN(V1)) {
      const calc = (C2 * V2) / C1
      setV1(calc.toFixed(6))
      calcResult = { label: 'Stock Volume (V₁)', value: calc.toFixed(6), unit: '' }
      equation = `V₁ = (${C2} × ${V2}) ÷ ${C1} = ${calc.toFixed(6)}`
    } else if (isNaN(C2)) {
      const calc = (C1 * V1) / V2
      setC2(calc.toFixed(6))
      calcResult = { label: 'Final Concentration (C₂)', value: calc.toFixed(6), unit: '' }
      equation = `C₂ = (${C1} × ${V1}) ÷ ${V2} = ${calc.toFixed(6)}`
    } else {
      const calc = (C1 * V1) / C2
      setV2(calc.toFixed(6))
      calcResult = { label: 'Final Volume (V₂)', value: calc.toFixed(6), unit: '' }
      equation = `V₂ = (${C1} × ${V1}) ÷ ${C2} = ${calc.toFixed(6)}`
    }

    setResult(calcResult)
    onAddToProject({
      id: Date.now().toString(),
      calculator: 'Dilution (C₁V₁ = C₂V₂)',
      inputs: { c1, v1, c2, v2 },
      result: calcResult,
      equation,
      timestamp: new Date()
    })
  }

  const clear = () => {
    setC1('')
    setV1('')
    setC2('')
    setV2('')
    setResult(null)
  }

  const isCalculated = (val: string) => {
    const filled = [c1, v1, c2, v2].filter(v => v !== '').length
    return filled === 3 && val === ''
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
        <p className="font-medium mb-1">Equation: C₁V₁ = C₂V₂</p>
        <p className="text-xs">Leave one field blank to calculate it. Use consistent units.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FlexibleInput label="C₁ (Stock Conc.)" value={c1} onChange={setC1} isCalculated={isCalculated(c1)} />
        <FlexibleInput label="V₁ (Stock Vol.)" value={v1} onChange={setV1} isCalculated={isCalculated(v1)} />
        <FlexibleInput label="C₂ (Final Conc.)" value={c2} onChange={setC2} isCalculated={isCalculated(c2)} />
        <FlexibleInput label="V₂ (Final Vol.)" value={v2} onChange={setV2} isCalculated={isCalculated(v2)} />
      </div>

      <div className="flex gap-2">
        <button onClick={calculate} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Calculate
        </button>
        <button onClick={clear} className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          Clear
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.label === 'Error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="font-medium">{result.label}: {result.value} {result.unit}</p>
        </div>
      )}
    </div>
  )
}

// Serial Dilution Calculator
function SerialDilutionCalculator({ 
  onAddToProject 
}: { 
  onAddToProject: (calc: CalculationRecord) => void 
}) {
  const [initial, setInitial] = useState('')
  const [transfer, setTransfer] = useState('')
  const [diluent, setDiluent] = useState('')
  const [steps, setSteps] = useState('')
  const [final, setFinal] = useState('')
  const [result, setResult] = useState<{ label: string; value: string; unit: string } | null>(null)

  const calculate = () => {
    const C0 = parseFloat(initial)
    const Vt = parseFloat(transfer)
    const Vd = parseFloat(diluent)
    const n = parseFloat(steps)
    const Cf = parseFloat(final)

    // Determine which is blank
    const values = { initial: C0, transfer: Vt, diluent: Vd, steps: n, final: Cf }
    const filled = Object.values(values).filter(v => !isNaN(v)).length

    if (filled !== 4) {
      setResult({ label: 'Error', value: 'Enter exactly 4 values', unit: '' })
      return
    }

    let calcResult: { label: string; value: string; unit: string }
    let equation = ''
    const dilutionFactor = Vt / (Vt + Vd)

    if (isNaN(Cf)) {
      const calc = C0 * Math.pow(dilutionFactor, n)
      setFinal(calc.toExponential(4))
      calcResult = { label: 'Final Concentration', value: calc.toExponential(4), unit: '' }
      equation = `C_final = ${C0} × (${Vt}/(${Vt}+${Vd}))^${n} = ${calc.toExponential(4)}`
    } else if (isNaN(n)) {
      const calc = Math.log(Cf / C0) / Math.log(dilutionFactor)
      setSteps(Math.ceil(calc).toString())
      calcResult = { label: 'Steps Required', value: Math.ceil(calc).toString(), unit: '' }
      equation = `n = log(${Cf}/${C0}) / log(${dilutionFactor.toFixed(4)}) ≈ ${Math.ceil(calc)}`
    } else if (isNaN(C0)) {
      const calc = Cf / Math.pow(dilutionFactor, n)
      setInitial(calc.toExponential(4))
      calcResult = { label: 'Initial Concentration', value: calc.toExponential(4), unit: '' }
      equation = `C_initial = ${Cf} ÷ (${dilutionFactor.toFixed(4)})^${n} = ${calc.toExponential(4)}`
    } else {
      setResult({ label: 'Error', value: 'Cannot solve for transfer/diluent volumes uniquely', unit: '' })
      return
    }

    setResult(calcResult)
    onAddToProject({
      id: Date.now().toString(),
      calculator: 'Serial Dilution',
      inputs: { initial, transfer, diluent, steps, final },
      result: calcResult,
      equation,
      timestamp: new Date()
    })
  }

  const clear = () => {
    setInitial('')
    setTransfer('')
    setDiluent('')
    setSteps('')
    setFinal('')
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
        <p className="font-medium mb-1">Equation: C_final = C_initial × (V_transfer / (V_transfer + V_diluent))ⁿ</p>
        <p className="text-xs">Leave one field blank to calculate it (except transfer/diluent).</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FlexibleInput label="Initial Concentration" value={initial} onChange={setInitial} />
        <FlexibleInput label="Transfer Volume" value={transfer} onChange={setTransfer} unit="µL" />
        <FlexibleInput label="Diluent Volume" value={diluent} onChange={setDiluent} unit="µL" />
        <FlexibleInput label="Number of Steps" value={steps} onChange={setSteps} />
        <div className="col-span-2">
          <FlexibleInput label="Final Concentration" value={final} onChange={setFinal} />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={calculate} className="flex-1 bg-cyan-600 text-white py-2.5 rounded-lg font-medium hover:bg-cyan-700 transition-colors">
          Calculate
        </button>
        <button onClick={clear} className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          Clear
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.label === 'Error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="font-medium">{result.label}: {result.value} {result.unit}</p>
        </div>
      )}
    </div>
  )
}

// Percent Solution Calculator
function PercentSolutionCalculator({ 
  onAddToProject 
}: { 
  onAddToProject: (calc: CalculationRecord) => void 
}) {
  const [solute, setSolute] = useState('')
  const [volume, setVolume] = useState('')
  const [percent, setPercent] = useState('')
  const [type, setType] = useState<'w/v' | 'v/v'>('w/v')
  const [result, setResult] = useState<{ label: string; value: string; unit: string } | null>(null)

  const calculate = () => {
    const S = parseFloat(solute)
    const V = parseFloat(volume)
    const P = parseFloat(percent)

    const filled = [!isNaN(S), !isNaN(V), !isNaN(P)].filter(Boolean).length

    if (filled !== 2) {
      setResult({ label: 'Error', value: 'Enter exactly 2 values', unit: '' })
      return
    }

    let calcResult: { label: string; value: string; unit: string }
    let equation = ''
    const soluteUnit = type === 'w/v' ? 'g' : 'mL'

    if (isNaN(S)) {
      const calc = (P / 100) * V
      setSolute(calc.toFixed(4))
      calcResult = { label: `Solute needed`, value: calc.toFixed(4), unit: soluteUnit }
      equation = `Solute = (${P}% / 100) × ${V} mL = ${calc.toFixed(4)} ${soluteUnit}`
    } else if (isNaN(V)) {
      const calc = S / (P / 100)
      setVolume(calc.toFixed(4))
      calcResult = { label: 'Final Volume', value: calc.toFixed(4), unit: 'mL' }
      equation = `Volume = ${S} ${soluteUnit} ÷ (${P}% / 100) = ${calc.toFixed(4)} mL`
    } else {
      const calc = (S / V) * 100
      setPercent(calc.toFixed(4))
      calcResult = { label: 'Percent', value: calc.toFixed(4), unit: `% ${type}` }
      equation = `% = (${S} ${soluteUnit} / ${V} mL) × 100 = ${calc.toFixed(4)}%`
    }

    setResult(calcResult)
    onAddToProject({
      id: Date.now().toString(),
      calculator: `Percent Solution (${type})`,
      inputs: { solute, volume, percent, type },
      result: calcResult,
      equation,
      timestamp: new Date()
    })
  }

  const clear = () => {
    setSolute('')
    setVolume('')
    setPercent('')
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
        <p className="font-medium mb-1">Equation: % = (solute / volume) × 100</p>
        <p className="text-xs">Leave one field blank to calculate it.</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setType('w/v')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${type === 'w/v' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Weight/Volume (w/v)
        </button>
        <button
          onClick={() => setType('v/v')}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${type === 'v/v' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Volume/Volume (v/v)
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <FlexibleInput label={type === 'w/v' ? 'Solute Mass' : 'Solute Volume'} value={solute} onChange={setSolute} unit={type === 'w/v' ? 'g' : 'mL'} />
        <FlexibleInput label="Final Volume" value={volume} onChange={setVolume} unit="mL" />
        <FlexibleInput label="Percent" value={percent} onChange={setPercent} unit={`% ${type}`} />
      </div>

      <div className="flex gap-2">
        <button onClick={calculate} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
          Calculate
        </button>
        <button onClick={clear} className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          Clear
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.label === 'Error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="font-medium">{result.label}: {result.value} {result.unit}</p>
        </div>
      )}
    </div>
  )
}

// Unit Converter Calculator
function UnitConverterCalculator({ 
  onAddToProject,
  onMWSearch
}: { 
  onAddToProject: (calc: CalculationRecord) => void
  onMWSearch: (callback: (mw: number) => void) => void
}) {
  const [mode, setMode] = useState<'mgToM' | 'MToMg' | 'ppm'>('mgToM')
  const [value, setValue] = useState('')
  const [mw, setMW] = useState('')
  const [result, setResult] = useState<{ label: string; value: string; unit: string } | null>(null)

  const calculate = () => {
    const V = parseFloat(value)
    const MW = parseFloat(mw)

    if (isNaN(V)) {
      setResult({ label: 'Error', value: 'Enter a value', unit: '' })
      return
    }

    let calcResult: { label: string; value: string; unit: string }
    let equation = ''

    if (mode === 'ppm') {
      calcResult = { label: 'Result', value: V.toString(), unit: 'mg/L' }
      equation = `${V} ppm = ${V} mg/L (1:1 conversion)`
    } else if (mode === 'mgToM') {
      if (isNaN(MW)) {
        setResult({ label: 'Error', value: 'MW required', unit: '' })
        return
      }
      const calc = (V / MW) * 1000
      calcResult = { label: 'Molarity', value: calc.toFixed(6), unit: 'mM' }
      equation = `M = (${V} mg/mL ÷ ${MW}) × 1000 = ${calc.toFixed(6)} mM`
    } else {
      if (isNaN(MW)) {
        setResult({ label: 'Error', value: 'MW required', unit: '' })
        return
      }
      const calc = (V * MW) / 1000
      calcResult = { label: 'Concentration', value: calc.toFixed(6), unit: 'mg/mL' }
      equation = `mg/mL = (${V} M × ${MW}) ÷ 1000 = ${calc.toFixed(6)} mg/mL`
    }

    setResult(calcResult)
    onAddToProject({
      id: Date.now().toString(),
      calculator: 'Unit Converter',
      inputs: { value, mw, mode },
      result: calcResult,
      equation,
      timestamp: new Date()
    })
  }

  const clear = () => {
    setValue('')
    setMW('')
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          { id: 'mgToM', label: 'mg/mL → M' },
          { id: 'MToMg', label: 'M → mg/mL' },
          { id: 'ppm', label: 'ppm → mg/L' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as typeof mode)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m.id ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <FlexibleInput 
          label={mode === 'mgToM' ? 'Concentration (mg/mL)' : mode === 'MToMg' ? 'Molarity (M)' : 'PPM'} 
          value={value} 
          onChange={setValue} 
        />
        {mode !== 'ppm' && (
          <FlexibleInput 
            label="Molecular Weight" 
            value={mw} 
            onChange={setMW} 
            unit="g/mol"
            showMWSearch
            onMWSearch={() => onMWSearch((selectedMW) => setMW(selectedMW.toString()))}
          />
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={calculate} className="flex-1 bg-amber-600 text-white py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-colors">
          Convert
        </button>
        <button onClick={clear} className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          Clear
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.label === 'Error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="font-medium">{result.label}: {result.value} {result.unit}</p>
        </div>
      )}
    </div>
  )
}

// Stock Solution Calculator
function StockSolutionCalculator({ 
  onAddToProject,
  onMWSearch
}: { 
  onAddToProject: (calc: CalculationRecord) => void
  onMWSearch: (callback: (mw: number) => void) => void
}) {
  const [molarity, setMolarity] = useState('')
  const [volume, setVolume] = useState('')
  const [mw, setMW] = useState('')
  const [mass, setMass] = useState('')
  const [result, setResult] = useState<{ label: string; value: string; unit: string } | null>(null)

  const calculate = () => {
    const M = parseFloat(molarity)
    const V = parseFloat(volume)
    const MW = parseFloat(mw)
    const m = parseFloat(mass)

    const filled = [!isNaN(M), !isNaN(V), !isNaN(MW), !isNaN(m)].filter(Boolean).length

    if (filled !== 3) {
      setResult({ label: 'Error', value: 'Enter exactly 3 values', unit: '' })
      return
    }

    let calcResult: { label: string; value: string; unit: string }
    let equation = ''

    if (isNaN(m)) {
      const calc = M * (V / 1000) * MW
      setMass(calc.toFixed(4))
      calcResult = { label: 'Mass needed', value: calc.toFixed(4), unit: 'g' }
      equation = `mass = ${M} M × ${V / 1000} L × ${MW} g/mol = ${calc.toFixed(4)} g`
    } else if (isNaN(M)) {
      const calc = m / ((V / 1000) * MW)
      setMolarity(calc.toFixed(6))
      calcResult = { label: 'Stock Molarity', value: calc.toFixed(6), unit: 'M' }
      equation = `M = ${m} g ÷ (${V / 1000} L × ${MW}) = ${calc.toFixed(6)} M`
    } else if (isNaN(V)) {
      const calc = (m / (M * MW)) * 1000
      setVolume(calc.toFixed(4))
      calcResult = { label: 'Volume', value: calc.toFixed(4), unit: 'mL' }
      equation = `V = (${m} g ÷ (${M} M × ${MW})) × 1000 = ${calc.toFixed(4)} mL`
    } else {
      const calc = m / (M * (V / 1000))
      setMW(calc.toFixed(2))
      calcResult = { label: 'Molecular Weight', value: calc.toFixed(2), unit: 'g/mol' }
      equation = `MW = ${m} g ÷ (${M} M × ${V / 1000} L) = ${calc.toFixed(2)} g/mol`
    }

    setResult(calcResult)
    onAddToProject({
      id: Date.now().toString(),
      calculator: 'Stock Solution',
      inputs: { molarity, volume, mw, mass },
      result: calcResult,
      equation,
      timestamp: new Date()
    })
  }

  const clear = () => {
    setMolarity('')
    setVolume('')
    setMW('')
    setMass('')
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
        <p className="font-medium mb-1">Equation: mass (g) = M × V(L) × MW</p>
        <p className="text-xs">Leave one field blank to calculate it.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FlexibleInput label="Stock Molarity" value={molarity} onChange={setMolarity} unit="M" />
        <FlexibleInput label="Volume" value={volume} onChange={setVolume} unit="mL" />
        <FlexibleInput 
          label="Molecular Weight" 
          value={mw} 
          onChange={setMW} 
          unit="g/mol"
          showMWSearch
          onMWSearch={() => onMWSearch((selectedMW) => setMW(selectedMW.toString()))}
        />
        <FlexibleInput label="Mass" value={mass} onChange={setMass} unit="g" />
      </div>

      <div className="flex gap-2">
        <button onClick={calculate} className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors">
          Calculate
        </button>
        <button onClick={clear} className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          Clear
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.label === 'Error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="font-medium">{result.label}: {result.value} {result.unit}</p>
        </div>
      )}
    </div>
  )
}

// Buffer Calculator (Henderson-Hasselbalch)
function BufferCalculator({ 
  onAddToProject 
}: { 
  onAddToProject: (calc: CalculationRecord) => void 
}) {
  const [ph, setPH] = useState('')
  const [pka, setPKA] = useState('')
  const [base, setBase] = useState('')
  const [acid, setAcid] = useState('')
  const [result, setResult] = useState<{ label: string; value: string; unit: string } | null>(null)

  const calculate = () => {
    const pH = parseFloat(ph)
    const pKa = parseFloat(pka)
    const A = parseFloat(base)
    const HA = parseFloat(acid)

    const filled = [!isNaN(pH), !isNaN(pKa), !isNaN(A), !isNaN(HA)].filter(Boolean).length

    if (filled !== 3) {
      setResult({ label: 'Error', value: 'Enter exactly 3 values', unit: '' })
      return
    }

    let calcResult: { label: string; value: string; unit: string }
    let equation = ''

    if (isNaN(pH)) {
      const calc = pKa + Math.log10(A / HA)
      setPH(calc.toFixed(4))
      calcResult = { label: 'pH', value: calc.toFixed(4), unit: '' }
      equation = `pH = ${pKa} + log(${A}/${HA}) = ${calc.toFixed(4)}`
    } else if (isNaN(pKa)) {
      const calc = pH - Math.log10(A / HA)
      setPKA(calc.toFixed(4))
      calcResult = { label: 'pKa', value: calc.toFixed(4), unit: '' }
      equation = `pKa = ${pH} - log(${A}/${HA}) = ${calc.toFixed(4)}`
    } else if (isNaN(A)) {
      const calc = HA * Math.pow(10, pH - pKa)
      setBase(calc.toFixed(4))
      calcResult = { label: '[A⁻] (Base)', value: calc.toFixed(4), unit: 'M' }
      equation = `[A⁻] = ${HA} × 10^(${pH}-${pKa}) = ${calc.toFixed(4)} M`
    } else {
      const calc = A / Math.pow(10, pH - pKa)
      setAcid(calc.toFixed(4))
      calcResult = { label: '[HA] (Acid)', value: calc.toFixed(4), unit: 'M' }
      equation = `[HA] = ${A} ÷ 10^(${pH}-${pKa}) = ${calc.toFixed(4)} M`
    }

    setResult(calcResult)
    onAddToProject({
      id: Date.now().toString(),
      calculator: 'Buffer (Henderson-Hasselbalch)',
      inputs: { ph, pka, base, acid },
      result: calcResult,
      equation,
      timestamp: new Date()
    })
  }

  const clear = () => {
    setPH('')
    setPKA('')
    setBase('')
    setAcid('')
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
        <p className="font-medium mb-1">Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA])</p>
        <p className="text-xs">Leave one field blank to calculate it.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FlexibleInput label="pH" value={ph} onChange={setPH} />
        <FlexibleInput label="pKa" value={pka} onChange={setPKA} />
        <FlexibleInput label="[A⁻] Base Conc." value={base} onChange={setBase} unit="M" />
        <FlexibleInput label="[HA] Acid Conc." value={acid} onChange={setAcid} unit="M" />
      </div>

      <div className="flex gap-2">
        <button onClick={calculate} className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors">
          Calculate
        </button>
        <button onClick={clear} className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          Clear
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.label === 'Error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="font-medium">{result.label}: {result.value} {result.unit}</p>
        </div>
      )}
    </div>
  )
}

// Osmolarity Calculator
function OsmolarityCalculator({ 
  onAddToProject 
}: { 
  onAddToProject: (calc: CalculationRecord) => void 
}) {
  const [molarity, setMolarity] = useState('')
  const [particles, setParticles] = useState('')
  const [osmolarity, setOsmolarity] = useState('')
  const [result, setResult] = useState<{ label: string; value: string; unit: string } | null>(null)

  const calculate = () => {
    const M = parseFloat(molarity)
    const i = parseFloat(particles)
    const Osm = parseFloat(osmolarity)

    const filled = [!isNaN(M), !isNaN(i), !isNaN(Osm)].filter(Boolean).length

    if (filled !== 2) {
      setResult({ label: 'Error', value: 'Enter exactly 2 values', unit: '' })
      return
    }

    let calcResult: { label: string; value: string; unit: string }
    let equation = ''

    if (isNaN(Osm)) {
      const calc = M * i
      setOsmolarity(calc.toFixed(4))
      calcResult = { label: 'Osmolarity', value: calc.toFixed(4), unit: 'Osm' }
      equation = `Osm = ${M} M × ${i} = ${calc.toFixed(4)} Osm`
    } else if (isNaN(M)) {
      const calc = Osm / i
      setMolarity(calc.toFixed(6))
      calcResult = { label: 'Molarity', value: calc.toFixed(6), unit: 'M' }
      equation = `M = ${Osm} Osm ÷ ${i} = ${calc.toFixed(6)} M`
    } else {
      const calc = Osm / M
      setParticles(calc.toFixed(2))
      calcResult = { label: 'Dissociation Factor (i)', value: calc.toFixed(2), unit: '' }
      equation = `i = ${Osm} Osm ÷ ${M} M = ${calc.toFixed(2)}`
    }

    setResult(calcResult)
    onAddToProject({
      id: Date.now().toString(),
      calculator: 'Osmolarity',
      inputs: { molarity, particles, osmolarity },
      result: calcResult,
      equation,
      timestamp: new Date()
    })
  }

  const clear = () => {
    setMolarity('')
    setParticles('')
    setOsmolarity('')
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
        <p className="font-medium mb-1">Equation: Osmolarity = M × i</p>
        <p className="text-xs">Where i = number of particles on dissociation. Leave one field blank.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <FlexibleInput label="Molarity" value={molarity} onChange={setMolarity} unit="M" />
        <FlexibleInput label="Dissociation Factor (i)" value={particles} onChange={setParticles} placeholder="e.g., NaCl=2, CaCl₂=3" />
        <FlexibleInput label="Osmolarity" value={osmolarity} onChange={setOsmolarity} unit="Osm" />
      </div>

      <div className="flex gap-2">
        <button onClick={calculate} className="flex-1 bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors">
          Calculate
        </button>
        <button onClick={clear} className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          Clear
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.label === 'Error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="font-medium">{result.label}: {result.value} {result.unit}</p>
        </div>
      )}
    </div>
  )
}

// MW Search Modal
function MWSearchModal({ 
  isOpen, 
  onClose, 
  onSelect 
}: { 
  isOpen: boolean
  onClose: () => void
  onSelect: (mw: number) => void 
}) {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search) return compounds
    const s = search.toLowerCase()
    return compounds.filter(c => 
      c.name.toLowerCase().includes(s) || 
      c.formula.toLowerCase().includes(s) ||
      c.category.toLowerCase().includes(s)
    )
  }, [search])

  const grouped = useMemo(() => {
    return filtered.reduce((acc, c) => {
      if (!acc[c.category]) acc[c.category] = []
      acc[c.category].push(c)
      return acc
    }, {} as Record<string, Compound[]>)
  }, [filtered])

  const handleSelect = (c: Compound) => {
    onSelect(c.mw)
    setCopied(c.name)
    setTimeout(() => {
      setCopied(null)
      onClose()
    }, 500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search compounds by name, formula, or category..."
            className="flex-1 outline-none text-lg"
            autoFocus
          />
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h3 className="text-sm font-semibold text-slate-500 mb-2">{category}</h3>
              <div className="space-y-1">
                {items.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleSelect(c)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div>
                      <span className="font-medium text-slate-800">{c.name}</span>
                      <span className="ml-2 text-sm text-slate-500">{c.formula}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-600">{c.mw.toLocaleString()}</span>
                      {copied === c.name ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 py-8">No compounds found</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Project Panel
function ProjectPanel({ 
  projects, 
  activeProject, 
  onSelectProject, 
  onCreateProject, 
  onDeleteProject,
  onExportPDF,
  onRemoveCalculation 
}: {
  projects: Project[]
  activeProject: Project | null
  onSelectProject: (id: string | null) => void
  onCreateProject: (name: string) => void
  onDeleteProject: (id: string) => void
  onExportPDF: (project: Project) => void
  onRemoveCalculation: (projectId: string, calcId: string) => void
}) {
  const [newName, setNewName] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateProject(newName.trim())
      setNewName('')
      setShowForm(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            <h2 className="font-semibold">Projects</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FolderPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        <button
          onClick={() => onSelectProject(null)}
          className={`w-full p-3 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors ${!activeProject ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
        >
          <Calculator className="w-4 h-4" />
          <span className="text-sm font-medium">Quick Calculations</span>
          <span className="ml-auto text-xs text-slate-500">(no project)</span>
        </button>

        {projects.map((p) => (
          <div key={p.id} className={`${activeProject?.id === p.id ? 'bg-indigo-50' : ''}`}>
            <button
              onClick={() => onSelectProject(p.id)}
              className={`w-full p-3 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors ${activeProject?.id === p.id ? 'text-indigo-700' : 'text-slate-700'}`}
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm font-medium flex-1">{p.name}</span>
              <span className="text-xs text-slate-500">{p.calculations.length} calcs</span>
            </button>
            
            {activeProject?.id === p.id && (
              <div className="px-3 pb-3">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => onExportPDF(p)}
                    disabled={p.calculations.length === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this project?')) onDeleteProject(p.id)
                    }}
                    className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {p.calculations.length > 0 && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {p.calculations.map((calc) => (
                      <div key={calc.id} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-700 truncate">{calc.calculator}</p>
                          <p className="text-slate-500 truncate">{calc.result.label}: {calc.result.value} {calc.result.unit}</p>
                        </div>
                        <button
                          onClick={() => onRemoveCalculation(p.id, calc.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Component
export default function LabCalculationsSuite() {
  const [activeCalc, setActiveCalc] = useState('molarity')
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [mwModalOpen, setMWModalOpen] = useState(false)
  const [mwCallback, setMWCallback] = useState<((mw: number) => void) | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [recentCalcs, setRecentCalcs] = useState<CalculationRecord[]>([])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('labcalcs-projects')
    if (saved) {
      const parsed = JSON.parse(saved)
      setProjects(parsed.map((p: Project) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        calculations: p.calculations.map(c => ({
          ...c,
          timestamp: new Date(c.timestamp)
        }))
      })))
    }
    const recent = localStorage.getItem('labcalcs-recent')
    if (recent) {
      setRecentCalcs(JSON.parse(recent).map((c: CalculationRecord) => ({
        ...c,
        timestamp: new Date(c.timestamp)
      })))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('labcalcs-projects', JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem('labcalcs-recent', JSON.stringify(recentCalcs.slice(0, 50)))
  }, [recentCalcs])

  const activeProject = projects.find(p => p.id === activeProjectId) || null

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      calculations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setProjects([...projects, newProject])
    setActiveProjectId(newProject.id)
  }

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id))
    if (activeProjectId === id) setActiveProjectId(null)
  }

  const handleAddToProject = (calc: CalculationRecord) => {
    if (activeProjectId) {
      setProjects(projects.map(p => 
        p.id === activeProjectId 
          ? { ...p, calculations: [...p.calculations, calc], updatedAt: new Date() }
          : p
      ))
    }
    setRecentCalcs([calc, ...recentCalcs].slice(0, 50))
  }

  const handleRemoveCalculation = (projectId: string, calcId: string) => {
    setProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, calculations: p.calculations.filter(c => c.id !== calcId), updatedAt: new Date() }
        : p
    ))
  }

  const handleMWSearch = (callback: (mw: number) => void) => {
    setMWCallback(() => callback)
    setMWModalOpen(true)
  }

  const handleMWSelect = (mw: number) => {
    if (mwCallback) {
      mwCallback(mw)
      setMWCallback(null)
    }
    setMWModalOpen(false)
  }

  const handleExportPDF = (project: Project) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 20

    // Header
    doc.setFillColor(30, 41, 59)
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Laboratory Calculations Report', pageWidth / 2, 18, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(project.name, pageWidth / 2, 28, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 36, { align: 'center' })

    y = 55
    doc.setTextColor(30, 41, 59)

    // Summary
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 20, y)
    y += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Calculations: ${project.calculations.length}`, 20, y)
    y += 5
    doc.text(`Project Created: ${project.createdAt.toLocaleDateString()}`, 20, y)
    y += 15

    // Calculations
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Calculations', 20, y)
    y += 10

    project.calculations.forEach((calc, i) => {
      if (y > 260) {
        doc.addPage()
        y = 20
      }

      // Calculation box
      doc.setFillColor(248, 250, 252)
      doc.rect(15, y - 5, pageWidth - 30, 35, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.rect(15, y - 5, pageWidth - 30, 35, 'S')

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      doc.text(`${i + 1}. ${calc.calculator}`, 20, y + 3)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text(`Result: ${calc.result.label} = ${calc.result.value} ${calc.result.unit}`, 20, y + 12)
      
      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      const eqLines = doc.splitTextToSize(`Equation: ${calc.equation}`, pageWidth - 50)
      doc.text(eqLines, 20, y + 21)

      y += 42
    })

    // Footer on last page
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(
        `Page ${i} of ${pageCount} | Dr Thomas Stevenson Laboratory Calculations Suite`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    doc.save(`${project.name.replace(/\s+/g, '_')}_calculations.pdf`)
  }

  const currentCalc = calculators.find(c => c.id === activeCalc)!

  const renderCalculator = () => {
    const props = { onAddToProject: handleAddToProject }
    const mwProps = { ...props, onMWSearch: handleMWSearch }

    switch (activeCalc) {
      case 'molarity': return <MolarityCalculator {...mwProps} />
      case 'dilution': return <DilutionCalculator {...props} />
      case 'serial': return <SerialDilutionCalculator {...props} />
      case 'percent': return <PercentSolutionCalculator {...props} />
      case 'convert': return <UnitConverterCalculator {...mwProps} />
      case 'stock': return <StockSolutionCalculator {...mwProps} />
      case 'buffer': return <BufferCalculator {...props} />
      case 'osmolarity': return <OsmolarityCalculator {...props} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur">
                <FlaskConical className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Laboratory Calculations Suite</h1>
                <p className="text-slate-300 text-sm">Dr Thomas Stevenson</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMWModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">MW Database</span>
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <History className="w-4 h-4" />
                <span className="text-sm font-medium">History</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Projects */}
          <div className="lg:col-span-1 space-y-4">
            <ProjectPanel
              projects={projects}
              activeProject={activeProject}
              onSelectProject={setActiveProjectId}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              onExportPDF={handleExportPDF}
              onRemoveCalculation={handleRemoveCalculation}
            />

            {activeProject && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Info className="w-4 h-4" />
                  <p className="text-xs">Calculations will be added to <strong>{activeProject.name}</strong></p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Calculator Tabs */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-2">
              <div className="flex flex-wrap gap-1">
                {calculators.map((calc) => {
                  const Icon = calc.icon
                  const isActive = activeCalc === calc.id
                  return (
                    <button
                      key={calc.id}
                      onClick={() => setActiveCalc(calc.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? `bg-${calc.color}-600 text-white shadow-md` 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      style={isActive ? { backgroundColor: `var(--${calc.color}-600, #4f46e5)` } : {}}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{calc.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Active Calculator */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className={`p-4 bg-gradient-to-r from-${currentCalc.color}-600 to-${currentCalc.color}-500 text-white`}
                   style={{ background: `linear-gradient(to right, var(--${currentCalc.color}-600, #4f46e5), var(--${currentCalc.color}-500, #6366f1))` }}>
                <div className="flex items-center gap-3">
                  <currentCalc.icon className="w-6 h-6" />
                  <h2 className="text-xl font-bold">{currentCalc.name} Calculator</h2>
                </div>
              </div>
              <div className="p-6">
                {renderCalculator()}
              </div>
            </div>

            {/* Recent History */}
            {showHistory && recentCalcs.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-600" />
                    <h3 className="font-semibold text-slate-700">Recent Calculations</h3>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Clear all history?')) setRecentCalcs([])
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {recentCalcs.slice(0, 10).map((calc) => (
                    <div key={calc.id} className="p-3 hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-slate-700">{calc.calculator}</span>
                        <span className="text-xs text-slate-500">
                          {calc.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {calc.result.label}: <span className="font-mono text-indigo-600">{calc.result.value}</span> {calc.result.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MW Search Modal */}
      <MWSearchModal
        isOpen={mwModalOpen}
        onClose={() => setMWModalOpen(false)}
        onSelect={handleMWSelect}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            Laboratory Calculations Suite © {new Date().getFullYear()} Dr Thomas Stevenson
          </p>
        </div>
      </footer>
    </div>
  )
}

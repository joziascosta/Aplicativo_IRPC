import { useRef, useState } from 'react'
import { Avaliacao, RiskClass, ImportResult } from '../types'

interface Props {
  avaliacoes: Avaliacao[]
  loading: boolean
  onRemover: (id: string, docId?: string) => void
  onLimparTudo: () => void
  onExportar: () => void
  onImportar: (f: File) => Promise<ImportResult>
}

const COR: Record<RiskClass, { border: string; badge: string }> = {
  baixo: { border: 'border-green-500', badge: 'bg-green-100 text-green-700' },
  medio: { border: 'border-amber-500', badge: 'bg-amber-100 text-amber-700' },
  alto:  { border: 'border-red-500',   badge: 'bg-red-100 text-red-700' },
}

const LABEL: Record<RiskClass, string> = { baixo: 'Baixo risco', medio: 'Médio risco', alto: 'Alto risco' }
const ICON:  Record<RiskClass, string> = { baixo: '✅', medio: '⚠️', alto: '🚨' }

// Função auxiliar para tratar datas em múltiplos formatos (Firestore Timestamp, ISO String ou dd/mm/aaaa HH:MM)
function formatarData(dataRaw: any): string {
  if (!dataRaw) return 'Data não informada'
  
  let dateObj: Date | null = null

  // 1. Se for Timestamp do Firestore (possui .toDate())
  if (typeof dataRaw === 'object' && typeof dataRaw.toDate === 'function') {
    dateObj = dataRaw.toDate()
  } 
  // 2. Se for número (milissegundos) ou string no formato ISO/padrão
  else if (typeof dataRaw === 'number' || (typeof dataRaw === 'string' && !dataRaw.includes('/'))) {
    dateObj = new Date(dataRaw)
  } 
  // 3. Se for string no formato brasileiro 'dd/mm/aaaa HH:MM' ou 'dd/mm/aaaa'
  else if (typeof dataRaw === 'string' && dataRaw.includes('/')) {
    const [dataPart, horaPart] = dataRaw.split(' ')
    const [dia, mes, ano] = dataPart.split('/')
    const hora = horaPart || '00:00'
    dateObj = new Date(`${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora}:00`)
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return String(dataRaw) // Retorna o valor original caso não consiga converter
  }

  return `${dateObj.toLocaleDateString('pt-BR')} ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export default function Historico({ avaliacoes, loading, onRemover, onLimparTudo, onExportar, onImportar }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [res, setRes] = useState<ImportResult | null>(null)
  const [showErros, setShowErros] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) { 
      alert('Selecione um arquivo .csv')
      return 
    }
    setImporting(true)
    setRes(null)
    const r = await onImportar(file)
    setRes(r)
    setImporting(false)
    setShowErros(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-bold text-slate-900 text-base">📋 Histórico de Avaliações</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => fileRef.current?.click()} 
            disabled={importing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {importing ? (
              <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"/>Importando…</>
            ) : (
              '📤 Importar CSV'
            )}
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          <button 
            onClick={onExportar}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            📥 Exportar CSV
          </button>
          <button 
            onClick={() => { if (confirm('Limpar todo o histórico?')) onLimparTudo() }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl border border-red-200 transition-colors"
          >
            🗑️ Limpar tudo
          </button>
        </div>
      </div>

      {/* Resultado da importação */}
      {res && (
        <div className={`mb-5 rounded-xl p-4 border text-sm animate-fade-in ${res.importados > 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="font-semibold text-slate-800 mb-1">{res.importados > 0 ? '✅' : '⚠️'} Importação concluída</p>
              <p className="text-slate-600">
                <span className="font-semibold text-green-700">{res.importados} importados</span>
                {res.ignorados > 0 && <> · <span className="font-semibold text-amber-700">{res.ignorados} ignorados</span> (duplicados ou inválidos)</>}
              </p>
              {res.erros.length > 0 && (
                <button onClick={() => setShowErros(v => !v)} className="mt-1 text-xs text-slate-500 underline">
                  {showErros ? 'Ocultar' : 'Ver'} {res.erros.length} erro(s)
                </button>
              )}
              {showErros && (
                <ul className="mt-2 text-xs text-red-700 space-y-0.5 max-h-28 overflow-y-auto bg-red-50 p-2 rounded-lg">
                  {res.erros.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
            <button onClick={() => setRes(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
          </div>
          <details className="mt-3">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 select-none">ℹ️ Formato esperado do CSV</summary>
            <div className="mt-2 text-xs text-slate-500 bg-white/70 rounded-lg p-3 space-y-1">
              <p>• Use o CSV gerado pelo botão <strong>Exportar CSV</strong> deste sistema</p>
              <p>• Colunas obrigatórias: <code className="bg-slate-100 px-1 rounded">Nome</code> e <code className="bg-slate-100 px-1 rounded">Índice</code></p>
              <p>• Suporta separador por <strong>vírgula</strong> ou <strong>ponto-e-vírgula</strong></p>
              <p>• Data no formato <code className="bg-slate-100 px-1 rounded">dd/mm/aaaa HH:MM</code></p>
              <p>• Registros com mesmo nome + data são ignorados como duplicatas</p>
            </div>
          </details>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Carregando...</p>
        </div>
      )}

      {!loading && avaliacoes.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">📋</div>
          <h3 className="text-slate-600 font-semibold mb-1">Nenhuma avaliação ainda</h3>
          <p className="text-slate-400 text-sm">Realize cálculos na aba Calculadora ou importe um CSV.</p>
        </div>
      )}

      {!loading && avaliacoes.length > 0 && (
        <div className="space-y-3">
          {avaliacoes.map((item, idx) => {
            // Garante uma classe válida ('baixo', 'medio' ou 'alto') para não quebrar a busca nos objetos COR e ICON
            const classeSegura: RiskClass = (item.classe && COR[item.classe]) ? item.classe : 'baixo'
            const dtFormatted = formatarData(item.data)

            return (
              <div 
                key={item._docId || item.id || idx}
                className={`bg-slate-50 rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-l-4 hover:shadow-sm transition-shadow ${COR[classeSegura].border}`}
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {ICON[classeSegura]} {item.nome || 'Sem nome'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {dtFormatted} · Índice: {item.indice ?? 'N/A'}{item.idadeDisplay && item.idadeDisplay !== 'Não informada' ? ` · ${item.idadeDisplay}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${COR[classeSegura].badge}`}>
                    {LABEL[classeSegura]}
                  </span>
                  <button 
                    onClick={() => { if (confirm('Remover este registro?')) onRemover(item.id!, item._docId) }}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center text-sm border border-red-200 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
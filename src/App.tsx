import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useAvaliacoes } from './hooks/useAvaliacoes'
import AuthScreen from './components/AuthScreen'
import Calculadora from './pages/Calculadora'
import Historico from './pages/Historico'
import Graficos from './pages/Graficos'
import Sobre from './pages/Sobre'
import { Avaliacao } from './types'

type Page = 'calculadora'|'historico'|'graficos'|'sobre'
const NAV = [
  {id:'calculadora' as Page, label:'Calculadora', icon:'📊'},
  {id:'historico'   as Page, label:'Histórico',   icon:'📋'},
  {id:'graficos'    as Page, label:'Gráficos',    icon:'📈'},
  {id:'sobre'       as Page, label:'Sobre',       icon:'ℹ️'},
]

export default function App() {
  const { user, loading, isDemoMode, login, register, logout } = useAuth()
  const { avaliacoes, loadingHist, carregar, salvar, remover, limparTudo, exportarCSV, importarCSV } = useAvaliacoes(user?.uid)
  const [page, setPage] = useState<Page>('calculadora')

  useEffect(() => { if (user) carregar() }, [user, carregar])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center"><div className="spinner mx-auto mb-3"/><p className="text-slate-400 text-sm">Carregando...</p></div>
    </div>
  )

  if (!user) return <AuthScreen onLogin={login} onRegister={register}/>

  const nav = (p: Page) => { setPage(p); if (p==='historico'||p==='graficos') carregar() }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Topbar */}
      <header className="bg-slate-900 h-14 flex items-center justify-between px-5 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2.5 text-white font-serif-display text-lg">
          <span className="w-2 h-2 rounded-full bg-teal-400" style={{boxShadow:'0 0 8px #2dd4bf'}}/>
          IRPC · UFVJM
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <span className="hidden sm:inline">{user.displayName || user.email}</span>
          <button onClick={logout}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-medium transition-colors">
            Sair
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-5 flex gap-1 overflow-x-auto">
        {NAV.map(({id,label,icon})=>(
          <button key={id} onClick={()=>nav(id)}
            className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              page===id ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-teal-600'}`}>
            {icon} {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {page==='calculadora' && <Calculadora onSalvar={(a:Avaliacao)=>salvar(a)} isDemoMode={isDemoMode}/>}
        {page==='historico'   && <Historico avaliacoes={avaliacoes} loading={loadingHist}
          onRemover={remover} onLimparTudo={limparTudo} onExportar={exportarCSV} onImportar={importarCSV}/>}
        {page==='graficos'    && <Graficos avaliacoes={avaliacoes}/>}
        {page==='sobre'       && <Sobre/>}
      </main>
    </div>
  )
}

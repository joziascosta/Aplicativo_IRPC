import { useState } from 'react'

interface Props {
  onLogin: (e:string,p:string) => Promise<string|null>
  onRegister: (n:string,e:string,p:string) => Promise<string|null>
}

export default function AuthScreen({ onLogin, onRegister }: Props) {
  const [tab, setTab] = useState<'login'|'register'>('login')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState<{t:string;ok:boolean}|null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true); setMsg(null)
    const err = tab === 'login'
      ? await onLogin(email, pass)
      : await onRegister(nome, email, pass)
    setBusy(false)
    if (err) setMsg({t:err,ok:false})
    else if (tab==='register') setMsg({t:'Conta criada! Você já está conectado.',ok:true})
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
      style={{background:'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0d9488 100%)'}}>
      <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{background:'linear-gradient(135deg,#0d9488,#0f766e)',boxShadow:'0 8px 24px rgba(13,148,136,.3)'}}>
            🏥
          </div>
          <h1 className="font-serif-display text-3xl text-slate-900 tracking-tight">Sistema IRPC</h1>
          <p className="text-slate-500 text-sm mt-1">Índice de Risco de Paralisia Cerebral · UFVJM</p>
        </div>

        <div className="flex bg-slate-100 rounded-xl p-1 mb-6 gap-1">
          {(['login','register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setMsg(null) }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab===t ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-teal-600'}`}>
              {t==='login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {tab==='register' && (
            <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome completo"
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900" />
          )}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail"
            className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900" />
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Senha"
            onKeyDown={e=>e.key==='Enter'&&submit()}
            className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900" />
          <button onClick={submit} disabled={busy}
            className="py-3.5 rounded-xl text-white font-semibold disabled:opacity-60 transition-all hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg,#0d9488,#0f766e)',boxShadow:'0 8px 20px rgba(13,148,136,.3)'}}>
            {busy ? 'Aguarde...' : tab==='login' ? 'Entrar no sistema' : 'Criar conta'}
          </button>
          {msg && (
            <div className={`text-center text-sm py-2.5 px-4 rounded-xl ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {msg.t}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Sem Firebase configurado? O sistema entra em <strong>Modo Demonstração</strong> automaticamente.
        </p>
      </div>
    </div>
  )
}

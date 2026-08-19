export default function Sobre() {
  return (
    <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
      <h2 className="font-bold text-slate-900 text-base mb-5 pb-4 border-b border-slate-100">ℹ️ Sobre o Sistema IRPC</h2>
      <p className="text-slate-600 leading-relaxed mb-7 text-sm">
        Sistema desenvolvido como parte do projeto <em>"Desenvolvimento de um Aplicativo Web para Cálculo do Índice de Risco de Paralisia Cerebral Infantil"</em>,
        vinculado ao Programa de Pós-Graduação em Saúde, Sociedade e Ambiente da UFVJM.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          {title:'🎯 Objetivo',body:'Automatizar o cálculo do Índice de Risco de PC usando metodologia MAUT-I, auxiliando profissionais na identificação precoce de casos de risco.'},
          {title:'👨‍🔬 Pesquisador',body:'Jozias Costa Santos — Mestrando em Saúde, Sociedade e Ambiente — UFVJM\nOrientador: Prof. Bernart Vinolas'},
        ].map(({title,body})=>(
          <div key={title} className="bg-slate-50 rounded-xl p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-2">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{body}</p>
          </div>
        ))}
        <div className="bg-slate-50 rounded-xl p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-3">📊 Classificação de Risco</h3>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li><span className="font-semibold text-green-600">Baixo risco:</span> Índice ≤ 0,175</li>
            <li><span className="font-semibold text-amber-600">Médio risco:</span> 0,175 {'<'} Índice ≤ 0,350</li>
            <li><span className="font-semibold text-red-600">Alto risco:</span> Índice {'>'} 0,350</li>
          </ul>
        </div>
        <div className="bg-slate-50 rounded-xl p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-3">🗄️ Tecnologias</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>React 18 + TypeScript + Vite</li>
            <li>Tailwind CSS</li>
            <li>Firebase Authentication + Firestore</li>
            <li>Recharts</li>
          </ul>
        </div>
        <div className="md:col-span-2 bg-slate-50 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4">⚙️ Como configurar o Firebase</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 leading-relaxed">
            <li>Acesse <strong>console.firebase.google.com</strong> e crie um projeto gratuito</li>
            <li>Em Authentication → Sign-in method, ative <strong>E-mail/Senha</strong></li>
            <li>Em Firestore Database, crie um banco em modo <strong>produção</strong></li>
            <li>Em Configurações → Apps, adicione um <strong>app Web</strong> e copie as credenciais</li>
            <li>Cole as credenciais em <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">src/lib/firebase.ts</code></li>
            <li>Regras Firestore: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">allow read, write: if request.auth != null;</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}

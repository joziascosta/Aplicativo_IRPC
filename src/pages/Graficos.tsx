import { Avaliacao } from '../types'
import { PieChart,Pie,Cell,Tooltip,Legend,ResponsiveContainer,LineChart,Line,XAxis,YAxis,CartesianGrid,BarChart,Bar } from 'recharts'

const RC = {baixo:'#16a34a',medio:'#d97706',alto:'#dc2626'}

export default function Graficos({avaliacoes}:{avaliacoes:Avaliacao[]}) {
  const total = avaliacoes.length
  if (total===0) return (
    <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 text-center py-20">
      <div className="text-6xl mb-4 opacity-30"></div>
      <h3 className="text-slate-600 font-semibold mb-1">Nenhum dado para visualizar</h3>
      <p className="text-slate-400 text-sm">Realize avaliações na aba Calculadora para ver gráficos aqui.</p>
    </div>
  )

  const baixo=avaliacoes.filter(a=>a.classe==='baixo').length
  const medio=avaliacoes.filter(a=>a.classe==='medio').length
  const alto=avaliacoes.filter(a=>a.classe==='alto').length
  const indices=avaliacoes.map(a=>parseFloat(a.indice))
  const media=(indices.reduce((a,b)=>a+b,0)/indices.length).toFixed(4)
  const maximo=Math.max(...indices).toFixed(4)

  const pizza=[{name:'Baixo',value:baixo},{name:'Médio',value:medio},{name:'Alto',value:alto}].filter(d=>d.value>0)
  const linha=[...avaliacoes].reverse().slice(0,20).map(a=>({nome:a.nome.split(' ')[0],indice:parseFloat(a.indice)}))
  const barra=avaliacoes.map(a=>({nome:a.nome.length>12?a.nome.slice(0,12)+'…':a.nome,indice:parseFloat(a.indice),fill:RC[a.classe]+'bb'}))

  const stat=(label:string,value:string|number,color:string)=>(
    <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
      <div className={`font-serif-display text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stat('Total',total,'text-teal-600')}
        {stat('Baixo risco',baixo,'text-green-600')}
        {stat('Médio risco',medio,'text-amber-600')}
        {stat('Alto risco',alto,'text-red-600')}
        {stat('Índice médio',media,'text-teal-600')}
        {stat('Índice máximo',maximo,'text-teal-600')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm mb-5"> Distribuição de Risco</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pizza} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {pizza.map((_,i)=><Cell key={i} fill={i===0?RC.baixo:i===1?RC.medio:RC.alto}/>)}
              </Pie>
              <Tooltip/><Legend wrapperStyle={{fontFamily:'DM Sans',fontSize:13}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm mb-5"> Evolução do Índice (últimas 20)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={linha}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="nome" tick={{fontSize:11}}/>
              <YAxis domain={[0,0.7]} tick={{fontSize:11}}/>
              <Tooltip formatter={(v:number)=>[v.toFixed(4),'Índice IRPC']}/>
              <Line type="monotone" dataKey="indice" stroke="#0d9488" strokeWidth={2} dot={{r:5,fill:'#0d9488'}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm mb-5"> Índice por Paciente</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barra}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="nome" tick={{fontSize:11}}/>
            <YAxis tick={{fontSize:11}}/>
            <Tooltip formatter={(v:number)=>[v.toFixed(4),'Índice IRPC']}/>
            <Bar dataKey="indice" radius={[4,4,0,0]}>
              {barra.map((e,i)=><Cell key={i} fill={e.fill}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

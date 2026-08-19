import React, { useState } from 'react'
import { ClinicalData, Avaliacao, RiskClass } from '../types'
import { calcularIRPC, calcularIdade } from '../lib/calc'

interface Props { onSalvar:(a:Avaliacao)=>void; isDemoMode:boolean }

const COR: Record<RiskClass,{bg:string;border:string;badge:string}> = {
  baixo:{bg:'bg-green-50',border:'border-green-500',badge:'bg-green-100 text-green-700'},
  medio:{bg:'bg-amber-50',border:'border-amber-500',badge:'bg-amber-100 text-amber-700'},
  alto: {bg:'bg-red-50',  border:'border-red-500',  badge:'bg-red-100 text-red-700'},
}

function Field({label,tip,children}:{label:string;tip?:string;children:React.ReactElement}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}{tip && <span className="font-normal text-slate-400 text-xs"> — {tip}</span>}
      </label>
      {React.cloneElement(children,{
        className:'w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-all'
      })}
    </div>
  )
}

const EMPTY = {
  nome:'',dataNasc:'',prontuario:'',
  B5:'',E5:'',I5:'',K5:'',O5:'',Q5:'',S5:'',V5:'',
  AC5:false,AD5:false,AE5:false,AF5:false
}

export default function Calculadora({onSalvar,isDemoMode}:Props) {
  const [f,setF] = useState({...EMPTY})
  const [result,setResult] = useState<null|{classe:RiskClass;texto:string;icone:string;AI5:number;Z5:number;nome:string;prontuario:string;idadeDisplay:string}>(null)

  const set = (k:string,v:string|boolean) => setF(p=>({...p,[k]:v}))

  const calcular = () => {
    if (!f.nome.trim()) { alert('⚠️ Preencha o nome do paciente.'); return }
    const dados: ClinicalData = {
      B5:+f.B5||0, E5:+f.E5||0, I5:+f.I5||0, K5:+f.K5||0,
      O5:+f.O5||0, Q5:+f.Q5||0, S5:+f.S5||0, V5:+f.V5||0,
      AC5:f.AC5?1:0, AD5:f.AD5?1:0, AE5:f.AE5?1:0, AF5:f.AF5?1:0
    }
    const {AI5,Z5,classe,texto,icone} = calcularIRPC(dados)
    const idadeDisplay = calcularIdade(f.dataNasc)
    setResult({classe,texto,icone,AI5,Z5,nome:f.nome,prontuario:f.prontuario,idadeDisplay})
    onSalvar({
      id:Date.now().toString(), nome:f.nome, idadeDisplay, classe, texto,
      indice:AI5.toFixed(4), indiceCombinado:Z5.toFixed(4),
      data:new Date().toISOString(), prontuario:f.prontuario, dataNasc:f.dataNasc, dados
    })
    setTimeout(()=>document.getElementById('res')?.scrollIntoView({behavior:'smooth',block:'nearest'}),100)
  }

  return (
    <div className="space-y-6">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-800 flex gap-3">
          <span className="text-lg">⚠️</span>
          <div><strong>Modo demonstração ativo.</strong> Firebase não configurado — dados salvos localmente nesta sessão. Configure suas credenciais em <code className="bg-amber-100 px-1 rounded">src/lib/firebase.ts</code>.</div>
        </div>
      )}

      {/* Identificação */}
      <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-900 text-base mb-5 pb-4 border-b border-slate-100">Identificação do Paciente</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Nome completo *"><input value={f.nome} onChange={e=>set('nome',e.target.value)} placeholder="Nome do recém-nascido" /></Field>
          <Field label="Data de nascimento"><input type="date" value={f.dataNasc} onChange={e=>set('dataNasc',e.target.value)} /></Field>
          <Field label="Prontuário"><input value={f.prontuario} onChange={e=>set('prontuario',e.target.value)} placeholder="Nº do prontuário" /></Field>
        </div>
      </div>

      {/* Dados Clínicos */}
<div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
  <div className="mb-6 pb-4 border-b border-slate-100">
    <h2 className="font-bold text-slate-900 text-base">
      Dados Clínicos
    </h2>
    <p className="text-sm text-slate-500 mt-1">
      Informe os dados clínicos utilizados para o cálculo do índice de risco.
    </p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">

    <Field
      label="Idade gestacional (sem.)"
      tip="< 37 = prematuro"
    >
      <input
        type="number"
        step="0.1"
        value={f.B5}
        onChange={e => set('B5', e.target.value)}
        placeholder="Ex.: 34,5"
        className="w-full"
      />
    </Field>

    <Field
      label="Apgar no 5º minuto"
      tip="Pontuação de 0 a 10"
    >
      <input
        type="number"
        step="1"
        min="0"
        max="10"
        value={f.E5}
        onChange={e => set('E5', e.target.value)}
        placeholder="0 a 10"
        className="w-full"
      />
    </Field>

    <Field
      label="Infecções TORCHSZ"
      tip="0 = negativo · 1 = positivo"
    >
      <input
        type="number"
        step="0.01"
        min="0"
        max="1"
        value={f.I5}
        onChange={e => set('I5', e.target.value)}
        placeholder="0 ou 1"
        className="w-full"
      />
    </Field>

    <Field
      label="Ventilação mecânica"
      tip="Tempo em dias"
    >
      <input
        type="number"
        step="0.1"
        min="0"
        value={f.K5}
        onChange={e => set('K5', e.target.value)}
        placeholder="Ex.: 5"
        className="w-full"
      />
    </Field>

    <Field
      label="Asfixia no nascimento"
      tip="0 = não · 1 = sim"
    >
      <input
        type="number"
        step="0.01"
        min="0"
        max="1"
        value={f.O5}
        onChange={e => set('O5', e.target.value)}
        placeholder="0 ou 1"
        className="w-full"
      />
    </Field>

    <Field
      label="Convulsões neonatais"
      tip="0 = não · 1 = sim"
    >
      <input
        type="number"
        step="0.01"
        min="0"
        max="1"
        value={f.Q5}
        onChange={e => set('Q5', e.target.value)}
        placeholder="0 ou 1"
        className="w-full"
      />
    </Field>

    <Field
      label="Movimentos Gerais (GM)"
      tip=">3 = caótico"
    >
      <input
        type="number"
        step="1"
        min="0"
        max="4"
        value={f.S5}
        onChange={e => set('S5', e.target.value)}
        placeholder="0 a 4"
        className="w-full"
      />
    </Field>

    <Field
      label="Pontuação HINE"
      tip="0 – 78 · menor = pior"
    >
      <input
        type="number"
        step="1"
        min="0"
        max="78"
        value={f.V5}
        onChange={e => set('V5', e.target.value)}
        placeholder="0 a 78"
        className="w-full"
      />
    </Field>

  </div>
</div>

      {/* Intervenções */}
      <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-900 text-base mb-5 pb-4 border-b border-slate-100">Intervenções Neuroprotetoras</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {[
            {id:'AC5',label:'Corticoide pré-natal'},
            {id:'AD5',label:'Sulfato de magnésio pré-natal'},
            {id:'AE5',label:'Hipotermia terapêutica'},
            {id:'AF5',label:'Cafeína neonatal'},
          ].map(({id,label})=>(
            <label key={id} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer select-none transition-all ${
              f[id as keyof typeof f] ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-slate-50 hover:border-teal-300'}`}>
              <input type="checkbox" className="w-4 h-4 cursor-pointer"
                checked={!!f[id as keyof typeof f]}
                onChange={e=>set(id,e.target.checked)} />
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={calcular}
            className="flex-[2] py-3.5 rounded-xl text-white font-semibold hover:-translate-y-0.5 transition-all"
            style={{background:'linear-gradient(135deg,#0d9488,#0f766e)',boxShadow:'0 8px 20px rgba(13,148,136,.3)'}}>
            🔍 Calcular Índice IRPC
          </button>
          <button onClick={()=>{setF({...EMPTY});setResult(null)}}
            className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-semibold border-2 border-slate-200 hover:bg-slate-200 transition-all">
            🔄 Limpar
          </button>
        </div>

        {result && (
          <div id="res" className={`mt-6 rounded-2xl p-7 border-l-4 animate-fade-in ${COR[result.classe].bg} ${COR[result.classe].border}`}>
            <div className="font-serif-display text-2xl font-bold mb-4">{result.icone} {result.texto}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {l:'Paciente',v:result.nome},
                {l:'Data',v:new Date().toLocaleDateString('pt-BR')},
                {l:'Idade na avaliação',v:result.idadeDisplay},
                {l:'Índice Multicritério (AI)',v:result.AI5.toFixed(4)},
                {l:'Índice Combinado (Z)',v:result.Z5.toFixed(4)},
                {l:'Prontuário',v:result.prontuario||'—'},
              ].map(({l,v})=>(
                <div key={l} className="bg-white/70 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{l}</div>
                  <div className="text-lg font-bold text-slate-900 mt-1 break-words">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

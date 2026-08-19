import { ClinicalData, RiskClass } from '../types'

export interface CalcResult {
  AI5: number; Z5: number
  classe: RiskClass; texto: string; icone: string
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function calcularIRPC(d: ClinicalData): CalcResult {
  const D5 = Math.max(0, (37 - d.B5) / 12)
  const H5 = clamp((-d.E5 + 7) / 6, 0, 1)
  const J5 = d.I5 > 0 ? 1 : 0
  const N5 = Math.max(0, clamp(d.K5 / 8, 0, 1) - d.AF5 * 0.1)
  const P5 = d.O5 - 0.1 * d.AE5
  const R5 = d.Q5
  const U5 = d.S5 < 4 ? Math.max(0, 1 - (4 - d.S5) / 2) : 0
  const Y5 = clamp((57 - d.V5) / 16, 0, 1)
  const Z5 = U5 * 0.25 + Y5 * 0.75
  const AG5 = Math.max(0, 1 - (d.AC5 + d.AD5) / 2) * 0.025
  const AI5 = D5/9 + H5*2/9 + J5/9 + N5*2/9 + P5/9 + R5*2/9 + AG5

  let classe: RiskClass, texto: string, icone: string
  if (AI5 <= 0.175)      { classe='baixo'; texto='Baixo risco de Paralisia Cerebral';  icone='✅' }
  else if (AI5 <= 0.35)  { classe='medio'; texto='Médio risco de Paralisia Cerebral';  icone='⚠️' }
  else                   { classe='alto';  texto='Alto risco de Paralisia Cerebral';   icone='🚨' }

  return { AI5, Z5, classe, texto, icone }
}

export function calcularIdade(dataNasc: string): string {
  if (!dataNasc) return 'Não informada'
  const diff = Date.now() - new Date(dataNasc + 'T00:00:00').getTime()
  const dias = Math.floor(diff / 86400000)
  if (dias < 0) return 'Não informada'
  return `${Math.floor(dias/7)} sem. e ${dias%7} dias (${dias} dias)`
}

export function traduzirErro(code: string): string {
  const m: Record<string,string> = {
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'E-mail ou senha inválidos.',
    'auth/email-already-in-use': 'E-mail já cadastrado.',
    'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres).',
    'auth/invalid-email': 'E-mail inválido.',
  }
  return m[code] || `Erro: ${code}`
}

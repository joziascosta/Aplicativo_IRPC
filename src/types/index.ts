export type RiskClass = 'baixo' | 'medio' | 'alto'
export interface ClinicalData {
  B5:number; E5:number; I5:number; K5:number
  O5:number; Q5:number; S5:number; V5:number
  AC5:number; AD5:number; AE5:number; AF5:number
}
export interface Avaliacao {
  id?: string; _docId?: string; uid?: string
  nome: string; prontuario: string; dataNasc: string
  idadeDisplay: string; classe: RiskClass; texto: string
  indice: string; indiceCombinado: string; data: string
  dados: ClinicalData
}
export interface ImportResult { importados:number; ignorados:number; erros:string[] }

import { useState, useEffect, useCallback } from 'react'
import { collection, addDoc, deleteDoc, doc, query, where, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db, isDemoMode } from '../lib/firebase'
import { Avaliacao, ImportResult } from '../types'

const KEY = 'irpc_v1'

function parseCSVLine(line: string, sep: string): string[] {
  const r: string[] = []; let cur = '', q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') { if (q && line[i+1]==='"') { cur+='"'; i++ } else q=!q }
    else if (c === sep && !q) { r.push(cur); cur='' }
    else cur += c
  }
  r.push(cur); return r
}

function parseDateBR(s: string): string | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[,\s]+(\d{2}):(\d{2}))?/)
  if (!m) return null
  const d = new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]||'00'}:${m[5]||'00'}:00`)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

export function useAvaliacoes(uid: string | undefined) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loadingHist, setLoadingHist] = useState(false)

  // 1. Atualização em tempo real (onSnapshot)
  useEffect(() => {
    if (isDemoMode) {
      setAvaliacoes(JSON.parse(localStorage.getItem(KEY) || '[]'))
      return
    }

    if (!uid || !db) {
      setAvaliacoes([])
      return
    }

    setLoadingHist(true)

    // Filtra pelo usuário logado sem forçar a ordenação pelo banco (evita necessidade de Índice Composto)
    const q = query(collection(db, 'avaliacoes'), where('uid', '==', uid))

    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => {
        const dataDoc = d.data()
        return {
          ...dataDoc,
          _docId: d.id,
          // Garante que a data sempre seja legível em ISO
          data: dataDoc.data || (dataDoc.createdAt?.toDate ? dataDoc.createdAt.toDate().toISOString() : new Date().toISOString()),
          // Garante que o valor do índice seja numérico para ser renderizado nos gráficos
          indice: typeof dataDoc.indice === 'string' ? parseFloat(dataDoc.indice) : dataDoc.indice
        } as Avaliacao
      })

      // Ordena no próprio front-end por data descendente
      lista.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

      setAvaliacoes(lista)
      setLoadingHist(false)
    }, (error) => {
      console.error("Erro ao escutar Firestore:", error)
      setLoadingHist(false)
    })

    return () => unsubscribe()
  }, [uid])

  const carregar = useCallback(async () => {
    // Mantido para compatibilidade, o listener em tempo real cuida da atualização
  }, [])

  // 2. Função de salvamento
  const salvar = useCallback(async (reg: Avaliacao) => {
    if (isDemoMode) {
      setAvaliacoes(prev => { 
        const n = [reg, ...prev]
        localStorage.setItem(KEY, JSON.stringify(n))
        return n 
      })
      return
    }

    if (!db || !uid) return

    try {
      await addDoc(collection(db, 'avaliacoes'), {
        ...reg,
        uid,
        createdAt: serverTimestamp()
      })
    } catch(e) { 
      console.error("Erro ao salvar documento:", e) 
    }
  }, [uid])

  // 3. Remoção de itens
  const remover = async (id: string, docId?: string) => {
    if (isDemoMode) {
      setAvaliacoes(prev => { 
        const n = prev.filter(i => i.id !== id)
        localStorage.setItem(KEY, JSON.stringify(n))
        return n 
      })
      return
    }

    if (!db || !docId) return
    try { 
      await deleteDoc(doc(db, 'avaliacoes', docId)) 
    } catch(e) { 
      console.error("Erro ao remover documento:", e) 
    }
  }

  // 4. Limpeza total do histórico
  const limparTudo = async () => {
    if (isDemoMode) { 
      setAvaliacoes([])
      localStorage.removeItem(KEY)
      return 
    }

    if (!db) return
    for (const a of avaliacoes) {
      if (a._docId) await deleteDoc(doc(db, 'avaliacoes', a._docId))
    }
  }

  // 5. Exportação CSV
  const exportarCSV = () => {
    if (!avaliacoes.length) return alert('Nenhuma avaliação para exportar.')
    let csv = '\uFEFF' + 'Nome,Data,Índice,Classificação,Idade,IG,Apgar,TORCHSZ,VM(dias),Asfixia,Convulsões,GM,HINE,Corticoide,SulfatoMg,Hipotermia,Cafeína\n'
    avaliacoes.forEach(a => {
      const dt = new Date(a.data).toLocaleString('pt-BR')
      const d = (a.dados || {}) as any
      csv += `"${a.nome}","${dt}",${a.indice},"${a.texto}","${a.idadeDisplay}",${d.B5??''},${d.E5??''},${d.I5??''},${d.K5??''},${d.O5??''},${d.Q5??''},${d.S5??''},${d.V5??''},${d.AC5??0},${d.AD5??0},${d.AE5??0},${d.AF5??0}\n`
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `IRPC_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  // 6. Importação CSV com injeção do UID do usuário logado
  const importarCSV = (file: File): Promise<ImportResult> => new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = async e => {
      let text = (e.target?.result as string || '').replace(/^\uFEFF/, '')
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length < 2) { resolve({ importados: 0, ignorados: 0, erros: ['CSV sem dados.'] }); return }
      
      const sep = lines[0].includes(';') ? ';' : ','
      let importados = 0, ignorados = 0
      const erros: string[] = []
      const exist = new Set(avaliacoes.map(a => `${a.nome.toLowerCase()}|${a.data.slice(0, 10)}`))

      for (let i = 1; i < lines.length; i++) {
        try {
          const c = parseCSVLine(lines[i], sep)
          const nome = c[0]?.replace(/^"|"$/g, '').trim()
          const indice = parseFloat(c[2]?.replace(',', '.'))
          if (!nome || isNaN(indice)) { ignorados++; erros.push(`Linha ${i + 1}: nome ou índice inválido`); continue }
          
          const dataISO = parseDateBR(c[1]?.replace(/^"|"$/g, '').trim()) || new Date().toISOString()
          const chave = `${nome.toLowerCase()}|${dataISO.slice(0, 10)}`
          
          if (exist.has(chave)) { ignorados++; continue }
          exist.add(chave)

          const g = (n: number) => parseFloat(c[n]?.replace(',', '.')) || 0
          const gi = (n: number) => parseInt(c[n]) || 0
          const classe = indice > 0.35 ? 'alto' : indice > 0.175 ? 'medio' : 'baixo'

          await salvar({
            id: `imp_${Date.now()}_${i}`,
            nome, 
            idadeDisplay: c[4]?.replace(/^"|"$/g, '').trim() || 'Não informada',
            classe, 
            texto: c[3]?.replace(/^"|"$/g, '').trim() || `${classe === 'baixo' ? 'Baixo' : classe === 'medio' ? 'Médio' : 'Alto'} risco de Paralisia Cerebral`,
            indice: indice.toFixed(4),
            indiceCombinado: '0',
            data: dataISO, 
            prontuario: '', 
            dataNasc: '',
            dados: { B5: g(5), E5: g(6), I5: g(7), K5: g(8), O5: g(9), Q5: g(10), S5: g(11), V5: g(12), AC5: gi(13), AD5: gi(14), AE5: gi(15), AF5: gi(16) }
          })
          importados++
        } catch (err) { 
          erros.push(`Linha ${i + 1}: ${err}`)
          ignorados++ 
        }
      }
      resolve({ importados, ignorados, erros })
    }
    reader.onerror = () => resolve({ importados: 0, ignorados: 0, erros: ['Erro ao ler arquivo.'] })
    reader.readAsText(file, 'UTF-8')
  })

  return { avaliacoes, loadingHist, carregar, salvar, remover, limparTudo, exportarCSV, importarCSV }
}
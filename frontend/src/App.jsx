import { useState, useRef, useEffect, useCallback } from "react"

const FORMACIONES = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "3-4-3", "5-3-2", "4-1-4-1"]

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');`

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080c14; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e2a3a; border-radius: 4px; }
  .app { min-height: 100vh; background: #080c14; color: #e2e8f0; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; }

  .header { background: linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%); border-bottom: 1px solid #1a2a40; padding: 0 24px; height: 56px; display: flex; align-items: center; gap: 16px; position: relative; }
  .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #e63946, #ff6b35, #e63946); }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #e63946, #c1121f); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 17px; box-shadow: 0 0 20px rgba(230,57,70,0.4); }
  .logo-text { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 18px; letter-spacing: 0.05em; text-transform: uppercase; color: #fff; }
  .logo-sub { font-size: 10px; color: #4a6080; letter-spacing: 0.1em; text-transform: uppercase; }
  .live-badge { display: flex; align-items: center; gap: 5px; background: rgba(230,57,70,0.15); border: 1px solid rgba(230,57,70,0.3); border-radius: 4px; padding: 3px 8px; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; color: #e63946; letter-spacing: 0.1em; }
  .live-dot { width: 6px; height: 6px; background: #e63946; border-radius: 50%; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  .btn-live { margin-left: auto; background: transparent; border: 1px solid #1e3a5f; color: #7eadd4; padding: 7px 16px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .btn-live:hover { background: #0d2240; border-color: #2a5080; color: #a0c4e8; }
  .btn-auto { background: transparent; border: 1px solid #1e3a5f; color: #7eadd4; padding: 7px 14px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .btn-auto.on { border-color: #1d9e75; color: #1d9e75; background: rgba(29,158,117,0.08); }
  .btn-auto:hover { background: #0d2240; }
  .countdown { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; color: #1d9e75; letter-spacing: 0.05em; }

  .historial-panel { background: #060a10; border-bottom: 1px solid #111d2e; max-height: 320px; overflow-y: auto; padding: 16px 24px; }
  .historial-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .historial-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #7eadd4; }
  .btn-borrar { background: transparent; border: 1px solid #3a1620; color: #e63946; padding: 4px 10px; border-radius: 5px; font-size: 11px; cursor: pointer; font-family: 'Inter', sans-serif; }
  .btn-borrar:hover { background: rgba(230,57,70,0.1); }
  .historial-empty { color: #2a4060; font-size: 13px; text-align: center; padding: 20px; }
  .historial-item { background: #0d1a28; border: 1px solid #1a2a3e; border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; }
  .historial-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .historial-fecha { font-size: 10px; color: #2a4060; text-transform: uppercase; letter-spacing: 0.05em; }
  .historial-partido { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; color: #7eadd4; letter-spacing: 0.03em; }
  .historial-pregunta { font-size: 12px; color: #ff8a8a; margin-bottom: 6px; font-style: italic; }
  .historial-respuesta { font-size: 12px; color: #94a3b8; line-height: 1.5; white-space: pre-wrap; }

  .ticker { background: #060a10; border-bottom: 1px solid #111d2e; padding: 10px 24px; display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; }
  .ticker::-webkit-scrollbar { display: none; }
  .match-card { background: #0d1a28; border: 1px solid #1a2a3e; border-radius: 8px; padding: 10px 14px; cursor: pointer; min-width: 155px; flex-shrink: 0; transition: all 0.2s; position: relative; overflow: hidden; }
  .match-card:hover { border-color: #2a4060; background: #0f1f30; }
  .match-card.active { border-color: #e63946; background: #130d10; }
  .match-card.active::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #e63946, #ff6b35); }
  .match-status { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
  .status-live { color: #e63946; } .status-break { color: #f59e0b; } .status-scheduled { color: #4a6080; }
  .match-team { font-size: 12px; font-weight: 500; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .match-score { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; color: #e2e8f0; letter-spacing: 0.05em; line-height: 1.1; margin: 3px 0; }
  .match-card.active .match-score { color: #ff6b6b; }

  .main { display: flex; flex: 1; overflow: hidden; }
  .sidebar { width: 268px; background: #090e18; border-right: 1px solid #111d2e; display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; }
  .sidebar-section { padding: 14px 16px; border-bottom: 1px solid #111d2e; }
  .section-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #2a4060; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .section-label::after { content: ''; flex: 1; height: 1px; background: #111d2e; }
  .field-group { margin-bottom: 8px; }
  .field-label { font-size: 10px; color: #3a5070; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
  .field-input { width: 100%; background: #060a10; color: #94a3b8; border: 1px solid #111d2e; border-radius: 5px; padding: 6px 10px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s; }
  .field-input:focus { border-color: #1e3a5f; color: #e2e8f0; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }

  .scoreboard { background: linear-gradient(135deg, #060a10, #0a1220); border: 1px solid #1a2a3e; border-radius: 10px; padding: 12px; text-align: center; }
  .scoreboard-min { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; color: #2a5080; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px; }
  .scoreboard-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .scoreboard-team { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; color: #7eadd4; flex: 1; text-align: center; text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.2; }
  .scoreboard-score { font-family: 'Barlow Condensed', sans-serif; font-size: 30px; font-weight: 800; color: #fff; min-width: 64px; text-align: center; text-shadow: 0 0 30px rgba(230,57,70,0.5); }

  /* STATS MANUALES */
  .stat-row { margin-bottom: 10px; }
  .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .stat-name { font-size: 10px; color: #3a5070; text-transform: uppercase; letter-spacing: 0.08em; }
  .stat-vals { display: flex; gap: 6px; align-items: center; }
  .stat-input { width: 44px; background: #060a10; color: #e2e8f0; border: 1px solid #111d2e; border-radius: 4px; padding: 4px 6px; font-size: 13px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; text-align: center; outline: none; }
  .stat-input:focus { border-color: #1e3a5f; }
  .stat-vs { font-size: 10px; color: #2a4060; }
  .stat-bar-wrap { display: flex; height: 3px; border-radius: 2px; overflow: hidden; gap: 1px; }
  .stat-bar-home { background: linear-gradient(90deg, #e63946, #ff6b35); border-radius: 2px; transition: flex 0.4s ease; }
  .stat-bar-away { background: #1e3a5f; border-radius: 2px; transition: flex 0.4s ease; }

  .cards-section { margin-top: 8px; }
  .cards-row { display: flex; justify-content: space-between; align-items: center; }
  .cards-team { display: flex; align-items: center; gap: 6px; }
  .cards-label { font-size: 10px; color: #2a4060; text-transform: uppercase; letter-spacing: 0.08em; }
  .card-badge { display: flex; align-items: center; gap: 3px; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; }
  .card-y { width: 9px; height: 12px; background: #f59e0b; border-radius: 1px; }
  .card-r { width: 9px; height: 12px; background: #e63946; border-radius: 1px; }
  .hint { font-size: 10px; color: #1e3050; text-align: center; margin-top: 6px; font-style: italic; }

  .field-wrap { padding: 4px 8px; }
  .campo-svg { width: 100%; display: block; }

  .chat { flex: 1; display: flex; flex-direction: column; background: #080c14; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; color: #1e3050; padding: 40px; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.4; }
  .empty-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #1e3050; margin-bottom: 6px; }
  .empty-sub { font-size: 13px; color: #152030; line-height: 1.5; }
  .msg { display: flex; animation: fadeIn 0.2s ease; }
  .msg.user { justify-content: flex-end; } .msg.assistant { justify-content: flex-start; }
  .bubble { max-width: 72%; padding: 12px 16px; font-size: 14px; line-height: 1.65; white-space: pre-wrap; }
  .bubble.user { background: linear-gradient(135deg, #c1121f, #e63946); color: #fff; border-radius: 16px 16px 4px 16px; font-weight: 500; }
  .bubble.assistant { background: #0d1a28; border: 1px solid #1a2a3e; color: #94a3b8; border-radius: 16px 16px 16px 4px; }
  .cursor { display: inline-block; width: 7px; height: 14px; background: #e63946; margin-left: 4px; border-radius: 2px; animation: blink 1s infinite; vertical-align: middle; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .chat-input-wrap { padding: 16px 24px; border-top: 1px solid #111d2e; background: #060a10; display: flex; gap: 10px; align-items: center; }
  .chat-input { flex: 1; background: #0d1a28; color: #e2e8f0; border: 1px solid #1a2a3e; border-radius: 8px; padding: 11px 16px; font-size: 14px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s; }
  .chat-input:focus { border-color: #1e3a5f; }
  .chat-input::placeholder { color: #2a4060; }
  .btn-send { background: linear-gradient(135deg, #c1121f, #e63946); color: #fff; border: none; border-radius: 8px; padding: 11px 22px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.2s; white-space: nowrap; }
  .btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-send:not(:disabled):hover { opacity: 0.85; }
`

export default function App() {
  const [partido, setPartido] = useState({
    local: "France", visitante: "Iraq",
    marcador: "1-0", minuto: "45",
    formacion_local: "4-3-3", formacion_visitante: "4-4-2"
  })
  const [stats, setStats] = useState({
    posesion_local: "50", posesion_visitante: "50",
    tiros_local: "0", tiros_visitante: "0",
    tiros_puerta_local: "0", tiros_puerta_visitante: "0",
    corners_local: "0", corners_visitante: "0",
    amarillas_local: "0", amarillas_visitante: "0",
    rojas_local: "0", rojas_visitante: "0",
  })
  const [partidoId, setPartidoId] = useState(null)
  const [partidos, setPartidos] = useState([])
  const [cargandoPartidos, setCargandoPartidos] = useState(false)
  const [historial, setHistorial] = useState([])
  const [historialGuardado, setHistorialGuardado] = useState([])
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const [autoUpdate, setAutoUpdate] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const intervalRef = useRef(null)
  const countdownRef = useRef(null)

  useEffect(() => {
    setHistorialGuardado(cargarHistorialGuardado())
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [historial])

  useEffect(() => {
    if (autoUpdate) {
      setCountdown(60)
      intervalRef.current = setInterval(async () => {
        try {
          const res = await fetch("https://mundial-asistente.onrender.com/partidos")
          const data = await res.json()
          const nuevos = data.partidos || []
          setPartidos(nuevos)
          setPartidoId(prev => {
            if (prev) {
              const actualizado = nuevos.find(p => p.id === prev)
              if (actualizado) {
                setPartido(p => ({ ...p, marcador: actualizado.marcador, minuto: actualizado.minuto }))
              }
            }
            return prev
          })
        } catch {}
        setCountdown(60)
      }, 60000)
      countdownRef.current = setInterval(() => {
        setCountdown(c => c > 0 ? c - 1 : 60)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      clearInterval(countdownRef.current)
      setCountdown(60)
    }
    return () => {
      clearInterval(intervalRef.current)
      clearInterval(countdownRef.current)
    }
  }, [autoUpdate])

  async function cargarPartidos() {
    setCargandoPartidos(true)
    try {
      const res = await fetch("https://mundial-asistente.onrender.com/partidos")
      const data = await res.json()
      setPartidos(data.partidos || [])
    } catch {}
    setCargandoPartidos(false)
  }

  function seleccionarPartido(p) {
    setPartido(prev => ({ ...prev, local: p.local, visitante: p.visitante, marcador: p.marcador, minuto: p.minuto }))
    setPartidoId(p.id)
    setStats({ posesion_local:"50", posesion_visitante:"50", tiros_local:"0", tiros_visitante:"0", tiros_puerta_local:"0", tiros_puerta_visitante:"0", corners_local:"0", corners_visitante:"0", amarillas_local:"0", amarillas_visitante:"0", rojas_local:"0", rojas_visitante:"0" })
    setHistorial([])
  }

  function setStat(key, val) {
    setStats(s => ({ ...s, [key]: val }))
  }

  async function enviarMensaje() {
    if (!input.trim() || cargando) return
    const preguntaActual = input
    const partidoConStats = { ...partido, ...stats }
    const nuevoHistorial = [...historial, { role: "user", content: input }]
    setHistorial(nuevoHistorial)
    setInput("")
    setCargando(true)
    setHistorial([...nuevoHistorial, { role: "assistant", content: "" }])
    try {
      const res = await fetch("https://mundial-asistente.onrender.com/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historial: nuevoHistorial, partido: partidoConStats })
      })
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let texto = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const linea of decoder.decode(value).split("\n").filter(l => l.startsWith("data: "))) {
          const d = linea.replace("data: ", "")
          if (d === "[DONE]") break
          try {
            texto += JSON.parse(d).texto
            setHistorial(prev => { const n = [...prev]; n[n.length-1] = { role: "assistant", content: texto }; return n })
          } catch {}
        }
      }
      guardarAnalisis(preguntaActual, texto, partidoConStats)
    } catch {
      setHistorial(prev => { const n = [...prev]; n[n.length-1] = { role: "assistant", content: "⚠️ Error conectando con el backend." }; return n })
    }
    setCargando(false)
    inputRef.current?.focus()
  }

  function guardarAnalisis(pregunta, respuesta, datosPartido) {
    try {
      const guardados = JSON.parse(localStorage.getItem("mundial_historial") || "[]")
      const nuevo = {
        id: Date.now(),
        fecha: new Date().toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
        local: datosPartido.local,
        visitante: datosPartido.visitante,
        marcador: datosPartido.marcador,
        minuto: datosPartido.minuto,
        pregunta,
        respuesta
      }
      guardados.unshift(nuevo)
      const recortado = guardados.slice(0, 50)
      localStorage.setItem("mundial_historial", JSON.stringify(recortado))
      setHistorialGuardado(recortado)
    } catch {}
  }

  function cargarHistorialGuardado() {
    try {
      return JSON.parse(localStorage.getItem("mundial_historial") || "[]")
    } catch { return [] }
  }

  function borrarHistorialGuardado() {
    localStorage.removeItem("mundial_historial")
    setHistorialGuardado([])
  }

  function Campo({ formacion }) {
    const lineas = formacion.split("-").map(Number)
    const filas = [[1], ...lineas]
    return (
      <svg viewBox="0 0 200 290" className="campo-svg">
        <defs>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a2a14"/>
            <stop offset="100%" stopColor="#071a0d"/>
          </linearGradient>
        </defs>
        <rect width="200" height="290" fill="url(#grass)" rx="4"/>
        {[0,1,2,3,4].map(i=><rect key={i} x="10" y={10+i*54} width="180" height="54" fill={i%2===0?"rgba(255,255,255,0.015)":"transparent"}/>)}
        <rect x="10" y="10" width="180" height="270" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <rect x="55" y="10" width="90" height="44" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <rect x="55" y="236" width="90" height="44" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <line x1="10" y1="145" x2="190" y2="145" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <circle cx="100" cy="145" r="22" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <circle cx="100" cy="145" r="2" fill="rgba(255,255,255,0.2)"/>
        {filas.map((n, fi) => {
          const y = 18 + (fi / (filas.length - 1)) * 254
          return Array.from({ length: n }).map((_, pi) => {
            const x = n === 1 ? 100 : 28 + (pi / (n - 1)) * 144
            return (
              <g key={`${fi}-${pi}`}>
                <circle cx={x} cy={y} r="10" fill="#e63946" fillOpacity="0.9"/>
                <circle cx={x} cy={y} r="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                <text x={x} y={y+4} textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700" fontFamily="Inter,sans-serif">{fi===0?"PO":"J"}</text>
              </g>
            )
          })
        })}
      </svg>
    )
  }

  function StatRow({ label, keyHome, keyAway }) {
    const h = parseFloat(stats[keyHome]) || 0
    const a = parseFloat(stats[keyAway]) || 0
    const total = h + a || 1
    const homeFlex = Math.max(1, h / total * 100)
    const awayFlex = Math.max(1, a / total * 100)
    return (
      <div className="stat-row">
        <div className="stat-header">
          <input className="stat-input" value={stats[keyHome]} onChange={e => setStat(keyHome, e.target.value)} />
          <span className="stat-name">{label}</span>
          <input className="stat-input" value={stats[keyAway]} onChange={e => setStat(keyAway, e.target.value)} />
        </div>
        <div className="stat-bar-wrap">
          <div className="stat-bar-home" style={{ flex: homeFlex }} />
          <div className="stat-bar-away" style={{ flex: awayFlex }} />
        </div>
      </div>
    )
  }

  const estadoInfo = (e) => {
    if (e==="IN_PLAY") return {text:"● EN VIVO",cls:"status-live"}
    if (e==="PAUSED") return {text:"◐ DESCANSO",cls:"status-break"}
    return {text:"◌ PRÓXIMO",cls:"status-scheduled"}
  }

  return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">⚽</div>
            <div>
              <div className="logo-text">Asistente Táctico</div>
              <div className="logo-sub">Mundial 2026</div>
            </div>
          </div>
          <div className="live-badge"><span className="live-dot"/> ANÁLISIS EN VIVO</div>
          <button className="btn-live" onClick={cargarPartidos} disabled={cargandoPartidos}>
            {cargandoPartidos ? "⟳ Cargando..." : "⟳ Partidos en vivo"}
          </button>
          <button className={`btn-auto${autoUpdate?" on":""}`} onClick={() => setAutoUpdate(a => !a)}>
            {autoUpdate ? <>🟢 Auto-ON <span className="countdown">{countdown}s</span></> : "⏱ Auto-OFF"}
          </button>
          <button className="btn-live" onClick={() => setMostrarHistorial(m => !m)}>
            📋 Historial {historialGuardado.length > 0 ? `(${historialGuardado.length})` : ""}
          </button>
        </header>

        {mostrarHistorial && (
          <div className="historial-panel">
            <div className="historial-header">
              <span className="historial-title">Análisis guardados</span>
              {historialGuardado.length > 0 && (
                <button className="btn-borrar" onClick={borrarHistorialGuardado}>🗑 Borrar todo</button>
              )}
            </div>
            {historialGuardado.length === 0 && (
              <div className="historial-empty">Aún no hay análisis guardados. Se guardan automáticamente cada vez que preguntas algo.</div>
            )}
            {historialGuardado.map(h => (
              <div key={h.id} className="historial-item">
                <div className="historial-meta">
                  <span className="historial-fecha">{h.fecha}</span>
                  <span className="historial-partido">{h.local} {h.marcador} {h.visitante} · {h.minuto}'</span>
                </div>
                <div className="historial-pregunta">"{h.pregunta}"</div>
                <div className="historial-respuesta">{h.respuesta}</div>
              </div>
            ))}
          </div>
        )}

        {partidos.length > 0 && (
          <div className="ticker">
            {partidos.map(p => {
              const info = estadoInfo(p.estado)
              const activo = p.id === partidoId
              return (
                <div key={p.id} className={`match-card${activo?" active":""}`} onClick={() => seleccionarPartido(p)}>
                  <div className={`match-status ${info.cls}`}>{info.text}{p.estado==="IN_PLAY"?` ${p.minuto}'`:""}</div>
                  <div className="match-team">{p.local}</div>
                  <div className="match-score">{p.marcador}</div>
                  <div className="match-team">{p.visitante}</div>
                </div>
              )
            })}
          </div>
        )}

        <div className="main">
          <aside className="sidebar">
            <div className="sidebar-section">
              <div className="section-label">Partido</div>
              {[["local","Local"],["visitante","Visitante"]].map(([k,l])=>(
                <div className="field-group" key={k}>
                  <div className="field-label">{l}</div>
                  <input className="field-input" value={partido[k]} onChange={e=>setPartido(p=>({...p,[k]:e.target.value}))}/>
                </div>
              ))}
              <div className="grid2">
                {[["marcador","Marcador"],["minuto","Min."]].map(([k,l])=>(
                  <div className="field-group" key={k}>
                    <div className="field-label">{l}</div>
                    <input className="field-input" value={partido[k]} onChange={e=>setPartido(p=>({...p,[k]:e.target.value}))}/>
                  </div>
                ))}
              </div>
              {[["formacion_local","Formación local"],["formacion_visitante","Formación visitante"]].map(([k,l])=>(
                <div className="field-group" key={k}>
                  <div className="field-label">{l}</div>
                  <select className="field-input" value={partido[k]} onChange={e=>setPartido(p=>({...p,[k]:e.target.value}))}>
                    {FORMACIONES.map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="sidebar-section">
              <div className="section-label">Marcador</div>
              <div className="scoreboard">
                <div className="scoreboard-min">Min. {partido.minuto}'</div>
                <div className="scoreboard-row">
                  <div className="scoreboard-team">{partido.local}</div>
                  <div className="scoreboard-score">{partido.marcador}</div>
                  <div className="scoreboard-team">{partido.visitante}</div>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <div className="section-label">Estadísticas</div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:10,color:"#e63946",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>{partido.local}</span>
                <span style={{fontSize:10,color:"#1e3a5f",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>{partido.visitante}</span>
              </div>
              <StatRow label="Posesión %" keyHome="posesion_local" keyAway="posesion_visitante"/>
              <StatRow label="Tiros" keyHome="tiros_local" keyAway="tiros_visitante"/>
              <StatRow label="A puerta" keyHome="tiros_puerta_local" keyAway="tiros_puerta_visitante"/>
              <StatRow label="Córners" keyHome="corners_local" keyAway="corners_visitante"/>
              <div className="cards-section">
                <div className="cards-row">
                  <div className="cards-team">
                    <div className="card-badge"><span className="card-y"/><input className="stat-input" style={{width:32}} value={stats.amarillas_local} onChange={e=>setStat("amarillas_local",e.target.value)}/></div>
                    <div className="card-badge"><span className="card-r"/><input className="stat-input" style={{width:32}} value={stats.rojas_local} onChange={e=>setStat("rojas_local",e.target.value)}/></div>
                  </div>
                  <span className="cards-label">Tarjetas</span>
                  <div className="cards-team">
                    <div className="card-badge"><input className="stat-input" style={{width:32}} value={stats.amarillas_visitante} onChange={e=>setStat("amarillas_visitante",e.target.value)}/><span className="card-y"/></div>
                    <div className="card-badge"><input className="stat-input" style={{width:32}} value={stats.rojas_visitante} onChange={e=>setStat("rojas_visitante",e.target.value)}/><span className="card-r"/></div>
                  </div>
                </div>
              </div>
              <div className="hint">Edita los números mientras ves el partido</div>
            </div>

            <div className="sidebar-section">
              <div className="section-label">Formación · {partido.local}</div>
              <div className="field-wrap"><Campo formacion={partido.formacion_local}/></div>
            </div>
          </aside>

          <section className="chat">
            <div className="chat-messages" ref={chatRef}>
              {historial.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">⚽</div>
                  <div className="empty-title">Describe el partido</div>
                  <div className="empty-sub">Actualiza las estadísticas mientras ves el partido y cuéntame qué está pasando en el campo</div>
                </div>
              )}
              {historial.map((msg,i)=>(
                <div key={i} className={`msg ${msg.role}`}>
                  <div className={`bubble ${msg.role}`}>
                    {msg.content}
                    {msg.role==="assistant"&&cargando&&i===historial.length-1&&<span className="cursor"/>}
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-input-wrap">
              <input ref={inputRef} className="chat-input" value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&enviarMensaje()}
                placeholder="Describe lo que está pasando en el campo..."/>
              <button className="btn-send" onClick={enviarMensaje} disabled={cargando||!input.trim()}>
                {cargando?"Analizando...":"Analizar →"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

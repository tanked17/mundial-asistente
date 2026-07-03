from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import json
import os
import httpx

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
FOOTBALL_API_KEY = os.getenv("FOOTBALL_API_KEY")
FOOTBALL_API_URL = "https://api.football-data.org/v4"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """Eres un analista táctico experto en fútbol del Mundial 2026.
El usuario te describe lo que está pasando en el partido en tiempo real.

Tu trabajo es:
- Analizar la táctica y formación de los equipos
- Detectar problemas (presión alta, línea defensiva mal posicionada, falta de juego por bandas...)
- Sugerir sustituciones concretas con justificación táctica
- Dar la probabilidad estimada de victoria según el contexto
- Ser conciso: máximo 4-5 frases por respuesta, como un analista en el banquillo

Formato de respuesta:
1. 🔍 Análisis (qué está pasando tácticamente)
2. ⚠️ Problema clave detectado
3. 💡 Sugerencia concreta (sustitución o cambio táctico)
4. 📊 Probabilidad de victoria estimada

Habla en español, con tono directo y profesional."""

class Mensaje(BaseModel):
    historial: list[dict]
    partido: dict

@app.get("/partidos")
async def get_partidos():
    try:
        async with httpx.AsyncClient() as http:
            res = await http.get(
                f"{FOOTBALL_API_URL}/competitions/WC/matches",
                headers={"X-Auth-Token": FOOTBALL_API_KEY},
                params={"status": "LIVE,IN_PLAY,PAUSED,SCHEDULED,TIMED"},
                timeout=10
            )
            data = res.json()
            partidos = []
            for match in data.get("matches", [])[:12]:
                sh = match["score"]["fullTime"]["home"]
                sa = match["score"]["fullTime"]["away"]
                if sh is None: sh = match["score"]["halfTime"]["home"] or 0
                if sa is None: sa = match["score"]["halfTime"]["away"] or 0
                partidos.append({
                    "id": match["id"],
                    "local": match["homeTeam"]["name"],
                    "visitante": match["awayTeam"]["name"],
                    "marcador": f"{sh}-{sa}",
                    "minuto": str(match.get("minute", 0)),
                    "estado": match["status"],
                    "fecha": match["utcDate"]
                })
            return {"partidos": partidos}
    except Exception as e:
        return {"partidos": [], "error": str(e)}

@app.get("/stats/{match_id}")
async def get_stats(match_id: int):
    try:
        async with httpx.AsyncClient() as http:
            res = await http.get(
                f"{FOOTBALL_API_URL}/matches/{match_id}",
                headers={"X-Auth-Token": FOOTBALL_API_KEY},
                timeout=10
            )
            data = res.json()

            # Extraer estadísticas si existen
            stats_raw = data.get("statistics") or []
            home_name = data["homeTeam"]["name"]
            away_name = data["awayTeam"]["name"]

            stats = {}
            for s in stats_raw:
                stats[s.get("type", "")] = {
                    "home": s.get("home"),
                    "away": s.get("away")
                }

            # Tarjetas desde los eventos
            tarjetas = {"home": {"amarillas": 0, "rojas": 0}, "away": {"amarillas": 0, "rojas": 0}}
            goles = {"home": [], "away": []}

            for evento in data.get("goals", []):
                team_id = evento.get("team", {}).get("id")
                home_id = data["homeTeam"]["id"]
                lado = "home" if team_id == home_id else "away"
                goles[lado].append({
                    "minuto": evento.get("minute"),
                    "jugador": evento.get("scorer", {}).get("name", "")
                })

            for booking in data.get("bookings", []):
                team_id = booking.get("team", {}).get("id")
                home_id = data["homeTeam"]["id"]
                lado = "home" if team_id == home_id else "away"
                card = booking.get("card", "")
                if "YELLOW" in card:
                    tarjetas[lado]["amarillas"] += 1
                elif "RED" in card:
                    tarjetas[lado]["rojas"] += 1

            return {
                "home": home_name,
                "away": away_name,
                "stats": stats,
                "tarjetas": tarjetas,
                "goles": goles
            }
    except Exception as e:
        return {"error": str(e)}

@app.post("/analizar")
async def analizar(data: Mensaje):
    contexto_partido = f"""
PARTIDO EN CURSO:
- {data.partido.get('local', 'Equipo A')} vs {data.partido.get('visitante', 'Equipo B')}
- Marcador: {data.partido.get('marcador', '0-0')}
- Minuto: {data.partido.get('minuto', '0')}'
- Formación local: {data.partido.get('formacion_local', 'desconocida')}
- Formación visitante: {data.partido.get('formacion_visitante', 'desconocida')}
- Posesión local: {data.partido.get('posesion_local', '?')}%
- Tiros local: {data.partido.get('tiros_local', '?')} | Tiros visitante: {data.partido.get('tiros_visitante', '?')}
- Tarjetas amarillas local: {data.partido.get('amarillas_local', 0)} | visitante: {data.partido.get('amarillas_visitante', 0)}
"""
    mensajes = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in data.historial[:-1]:
        mensajes.append({"role": msg["role"], "content": msg["content"]})
    ultimo_texto = contexto_partido + "\n" + (data.historial[-1]["content"] if data.historial else "")
    mensajes.append({"role": "user", "content": ultimo_texto})

    async def stream_respuesta():
        try:
            stream = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=mensajes,
                max_tokens=400,
                stream=True
            )
            for chunk in stream:
                texto = chunk.choices[0].delta.content
                if texto:
                    yield f"data: {json.dumps({'texto': texto})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'texto': f'Error: {str(e)}'})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(stream_respuesta(), media_type="text/event-stream")

@app.get("/")
def raiz():
    return {"estado": "Asistente Mundial 2026 — con estadísticas"}

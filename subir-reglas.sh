#!/bin/bash
# Publica firestore.rules (la versión de GitHub) en el proyecto poker-rotativo.
# Se corre desde Cloud Shell (botón >_ de la consola o de la app de Google Cloud):
#   curl -s https://raw.githubusercontent.com/ClaudiaBITS21/Poker-rotativo/main/subir-reglas.sh | bash
set -e
P=poker-rotativo
API=https://firebaserules.googleapis.com/v1/projects/$P
TOKEN=$(gcloud auth print-access-token)
H=(-H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -H "X-Goog-User-Project: $P")
curl -sf https://raw.githubusercontent.com/ClaudiaBITS21/Poker-rotativo/main/firestore.rules -o /tmp/firestore.rules
BODY=$(python3 -c 'import json;print(json.dumps({"source":{"files":[{"name":"firestore.rules","content":open("/tmp/firestore.rules").read()}]}}))')
RS=$(curl -s "${H[@]}" -X POST "$API/rulesets" -d "$BODY")
NAME=$(echo "$RS" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("name",""))')
if [ -z "$NAME" ]; then echo "No se pudieron crear las reglas:"; echo "$RS"; exit 1; fi
REL=$(curl -s "${H[@]}" -X PATCH "$API/releases/cloud.firestore" -d "{\"release\":{\"name\":\"projects/$P/releases/cloud.firestore\",\"rulesetName\":\"$NAME\"}}")
if echo "$REL" | grep -q '"rulesetName"'; then echo "✅ Reglas publicadas ($NAME)"; else echo "No se pudieron publicar:"; echo "$REL"; exit 1; fi

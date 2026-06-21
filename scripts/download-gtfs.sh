#!/usr/bin/env bash
# Télécharge les données GTFS (ilévia + TER Hauts-de-France) et OSM (Nord-Pas-de-Calais)
# nécessaires pour qu'OpenTripPlanner construise son graph de routage.
#
# Usage : bash scripts/download-gtfs.sh
# Les fichiers atterrissent dans otp-data/ à la racine du projet.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OTP_DIR="$SCRIPT_DIR/../otp-data"

mkdir -p "$OTP_DIR"

# ── GTFS ilévia (réseau urbain MEL — métro, tram, bus Lille) ─────────────────
# Source : media.ilevia.fr (flux officiel ilévia, Licence Ouverte)
GTFS_ILEVIA_URL="https://media.ilevia.fr/opendata/gtfs.zip"
GTFS_ILEVIA_DEST="$OTP_DIR/ilevia-gtfs.zip"

echo "→ Téléchargement du GTFS ilévia (réseau urbain MEL)..."
curl -L --fail --progress-bar -o "$GTFS_ILEVIA_DEST" "$GTFS_ILEVIA_URL"
echo "   Sauvegardé : $GTFS_ILEVIA_DEST"

# ── GTFS TER Hauts-de-France (trains régionaux SNCF) ─────────────────────────
# Source : transport.data.gouv.fr/resources/83620/download
# Couvre : Lens, Douai, Valenciennes, Arras → Lille-Flandres/Lille-Europe
# Mis à jour quotidiennement
GTFS_TER_URL="https://transport.data.gouv.fr/resources/83620/download"
GTFS_TER_DEST="$OTP_DIR/ter-hauts-de-france-gtfs.zip"

echo "→ Téléchargement du GTFS TER Hauts-de-France (trains régionaux SNCF)..."
curl -L --fail --progress-bar -o "$GTFS_TER_DEST" "$GTFS_TER_URL"
echo "   Sauvegardé : $GTFS_TER_DEST"

# ── OSM Nord-Pas-de-Calais (réseau viaire pour le routing piéton/vélo) ───────
# Source : Geofabrik (miroir OpenStreetMap, Licence ODbL)
OSM_URL="https://download.geofabrik.de/europe/france/nord-pas-de-calais-latest.osm.pbf"
OSM_DEST="$OTP_DIR/nord-pas-de-calais.osm.pbf"

echo "→ Téléchargement de l'OSM Nord-Pas-de-Calais (~80 Mo, patience)..."
curl -L --fail --progress-bar -o "$OSM_DEST" "$OSM_URL"
echo "   Sauvegardé : $OSM_DEST"

echo ""
echo "✓ Données prêtes dans otp-data/ (ilévia + TER + OSM)"
echo "  OTP fusionnera les deux feeds GTFS automatiquement au build du graph."
echo "  Lance ensuite : docker compose up otp"
echo "  (premier démarrage ~5-8 min avec les deux feeds)"

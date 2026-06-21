#!/usr/bin/env bash
# Télécharge les données GTFS (ilévia Lille) et OSM (Nord-Pas-de-Calais)
# nécessaires pour qu'OpenTripPlanner construise son graph de routage.
#
# Usage : bash scripts/download-gtfs.sh
# Les fichiers atterrissent dans otp-data/ à la racine du projet.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OTP_DIR="$SCRIPT_DIR/../otp-data"

mkdir -p "$OTP_DIR"

# ── GTFS ilévia (Métropole Européenne de Lille) ──────────────────────────────
# Source : media.ilevia.fr (flux officiel ilévia)
# Référencé sur : transport.data.gouv.fr/datasets/ilevia-localisation-des-arrets-bus-metro-et-tram-gtfs
# Licence : Licence Ouverte
GTFS_URL="https://media.ilevia.fr/opendata/gtfs.zip"
GTFS_DEST="$OTP_DIR/ilevia-gtfs.zip"

echo "→ Téléchargement du GTFS ilévia..."
curl -L --fail --progress-bar -o "$GTFS_DEST" "$GTFS_URL"
echo "   Sauvegardé : $GTFS_DEST"

# ── OSM Nord-Pas-de-Calais (réseau viaire pour le routing piéton/vélo) ───────
# Source : Geofabrik (miroir OpenStreetMap)
# Licence : ODbL
OSM_URL="https://download.geofabrik.de/europe/france/nord-pas-de-calais-latest.osm.pbf"
OSM_DEST="$OTP_DIR/nord-pas-de-calais.osm.pbf"

echo "→ Téléchargement de l'OSM Nord-Pas-de-Calais (~80 Mo, patience)..."
curl -L --fail --progress-bar -o "$OSM_DEST" "$OSM_URL"
echo "   Sauvegardé : $OSM_DEST"

echo ""
echo "✓ Données prêtes dans otp-data/"
echo "  Lance ensuite : docker compose up otp"
echo "  (premier démarrage ~3-5 min le temps de construire le graph)"

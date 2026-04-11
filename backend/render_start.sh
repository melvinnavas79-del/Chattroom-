#!/bin/bash
# Script de inicio para Render
uvicorn server:app --host 0.0.0.0 --port $PORT

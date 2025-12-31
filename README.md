# PricePulse

Real-Time Global Price & Inflation Tracker

## Overview

PricePulse is a real-time, crowdsourced platform for tracking the prices and inflation of essential goods across the world. It bridges the gap between delayed official economic indicators and on-the-ground reality by capturing live price data from users and trusted reference sources, then transforming that data into understandable inflation signals.

Governments and institutions publish inflation data monthly or quarterly. PricePulse detects price movements days or weeks earlier, enabling faster awareness of cost-of-living changes, supply shocks, and regional price disparities.

The platform focuses on essentials first (food staples, household goods, fuel equivalents) and presents insights through interactive maps, charts, and country-level comparisons.

## Problem Statement

- **Official inflation metrics lag behind reality.**
- **Price changes hit individuals long before data is published.**
- **There is no accessible tool that shows live, product-level inflation globally.**
- **Existing datasets are fragmented, region-locked, or hard to interpret.**

PricePulse solves this by combining live price submissions, baseline economic indicators, and automated inflation calculations into one transparent system.

## Core Features

### 🌍 Live Price Collection
- Users submit prices for everyday goods.
- Each report includes product, price, currency, and location.
- Data is normalized using real-time exchange rates.

### 📈 Real-Time Inflation Detection
- Server-side algorithms compute short-term inflation per product and region.
- Weekly and rolling inflation signals highlight sudden changes.
- Results are stored as immutable snapshots for analysis.

### 🗺️ Interactive Map
- Leaflet + OpenStreetMap visualize price pressure by region.
- Realtime updates using Supabase subscriptions.
- Country and city-level granularity.

### 📊 Benchmark Comparison
- World Bank CPI and Food Price Index are used as delayed ground-truth baselines.
- Users can compare PricePulse inflation vs official CPI.

### ⚡ Realtime Updates
- New price submissions instantly update maps and charts.
- Designed for live demos and real-world scalability.

## Technical Architecture

### Frontend
- **Next.js (React 18)**
- **Leaflet + OpenStreetMap** for maps (client-only rendering)
- **Chart.js** for inflation trends
- Hosted on Vercel

### Backend
- **Supabase Postgres** (data storage)
- **Supabase Realtime** (live updates)
- **Supabase Auth** (optional)
- **Supabase Edge Functions** (inflation computation)
- **Row Level Security** for safe public access

### External Data
- **ExchangeRate.host** for currency normalization
- **World Bank API** for CPI and Food Price Index

## Inflation Logic (High Level)

1. Store raw price submissions.
2. Normalize prices into a base currency.
3. Aggregate prices by product, region, and time window.
4. Compute percentage change across periods.
5. Persist inflation snapshots.
6. Compare results against official CPI indicators.

This approach enables early detection of inflation trends before traditional metrics update.

## Project Phases

- **Phase 0 – Concept & Scope**: Define products, regions, and success metrics.
- **Phase 1 – Data Model & API Setup**: Design schema, RLS policies, and core ingestion endpoints.
- **Phase 2 – Frontend Foundation**: Map, charts, country selectors, and live data rendering.
- **Phase 3 – Inflation Engine**: Edge Functions for aggregation and inflation computation.
- **Phase 4 – Testing & Demo Prep**: Unit tests, CI, load simulation, and demo scripts.
- **Phase 5 – Optimization & UX Polish**: Performance tuning, map clustering, better visuals.
- **Phase 6 – Future Expansion**: Retail integrations, ML forecasting, advanced analytics.

## Why PricePulse Matters

- Early warning system for inflation shocks.
- Transparency for consumers and researchers.
- Useful for NGOs, journalists, and policymakers.
- Designed to scale globally without central data monopolies.

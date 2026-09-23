import React, { useState } from 'react'
import styled from 'styled-components'
import {
  Link as LinkIcon,
  Waves,
  Palette,
  Compass,
} from 'lucide-react'
import { THEMES } from '../qrUtils'
import DownloadButton from './DownloadButton'
import ElevateButton from './ElevateButton'
import Align2DButton from './Align2DButton'

export default function StudioControls({
  url,
  setUrl,
  expanded,
  setExpanded,
  sea,
  setSea,
  themeKey,
  setThemeKey,
  exportPng,
  matrixSize,
  onAlign2D,
}) {
  const [activeTab, setActiveTab] = useState('generator') // 'generator' | 'terrain' | 'palette'

  return (
    <StyledSidebar className="studio-sidebar">
      {/* Neo-Brutalist Panel Header Banner */}
      <div className="header-banner">
        <div className="title">
          Studio Controls,<br />
          <span>customize voxel engine</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          <LinkIcon size={14} />
          <span>Code</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'terrain' ? 'active' : ''}`}
          onClick={() => setActiveTab('terrain')}
        >
          <Waves size={14} />
          <span>Terrain</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'palette' ? 'active' : ''}`}
          onClick={() => setActiveTab('palette')}
        >
          <Palette size={14} />
          <span>Themes</span>
        </button>
      </div>

      <div className="sidebar-scrollable">
        {/* Tab 1: Generator & Code */}
        {activeTab === 'generator' && (
          <div className="tab-pane">
            <div className="control-group">
              <label className="section-label">
                <span>Payload URL</span>
                <span className="pill-metric">{matrixSize}×{matrixSize}</span>
              </label>
              <div className="input-field-wrap">
                <LinkIcon size={16} className="input-icon" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-domain.com"
                  className="input"
                />
              </div>
            </div>

            <div className="hint-card">
              <Compass size={18} className="hint-icon" />
              <div className="hint-text">
                <strong>Interactive Canvas</strong>
                <p>
                  Tap the surface to {expanded ? 'flatten to QR code' : 'elevate 3D voxel islands'}. Drag to orbit, scroll to zoom.
                </p>
              </div>
            </div>

            <ElevateButton
              expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              label={expanded ? 'Flatten' : 'Reveal 3D'}
              suffix={expanded ? 'to QR Matrix' : 'Terrain'}
            />

            <Align2DButton onClick={onAlign2D} />
          </div>
        )}

        {/* Tab 2: Terrain & Physics */}
        {activeTab === 'terrain' && (
          <div className="tab-pane">
            <div className="control-group">
              <div className="slider-header">
                <span className="section-label">Sea Level</span>
                <span className="slider-val">{Math.round(sea * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.01"
                value={sea}
                onChange={(e) => setSea(Number(e.target.value))}
                className="neo-range"
              />
              <div className="slider-ticks">
                <span>0% Dry Land</span>
                <span>40% Coast</span>
                <span>80% Peaks</span>
              </div>
            </div>

            <div className="terrain-metrics-card">
              <div className="metric-row">
                <span className="metric-label">Voxel Count</span>
                <span className="metric-val">{matrixSize * matrixSize}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Wave Dynamics</span>
                <span className="metric-val">1.8 Hz Sine</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Filter Kernel</span>
                <span className="metric-val">3×3 Dual Blur</span>
              </div>
            </div>

            <ElevateButton
              expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              label={expanded ? 'Flatten' : 'Elevate 3D'}
              suffix={expanded ? 'to 2D Surface' : 'Island'}
            />

            <Align2DButton onClick={onAlign2D} />
          </div>
        )}

        {/* Tab 3: Themes & Lighting */}
        {activeTab === 'palette' && (
          <div className="tab-pane">
            <div className="control-group">
              <label className="section-label">Curated Biomes</label>
              <div className="palette-grid">
                {Object.entries(THEMES).map(([key, t]) => {
                  const isSelected = themeKey === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setThemeKey(key)}
                      className={`theme-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="theme-swatch-row">
                        <span
                          className="swatch"
                          style={{ background: t.bg }}
                        />
                        <span
                          className="swatch"
                          style={{ background: `hsl(${t.qrHue}, 45%, 35%)` }}
                        />
                        <span
                          className="swatch"
                          style={{ background: `hsl(${t.waterHue}, 70%, 55%)` }}
                        />
                      </div>
                      <span className="theme-name">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="sidebar-footer">
        <DownloadButton onClick={exportPng} label="Export 4K" />
      </div>
    </StyledSidebar>
  )
}

const StyledSidebar = styled.aside`
  --input-focus: #2d8cf0;
  --font-color: #323232;
  --font-color-sub: #666666;
  --bg-color: #fffdeb;
  --main-color: #000000;
  --panel-bg: #bae6fd;

  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--panel-bg);
  border: 2px solid var(--main-color);
  box-shadow: 5px 5px 0px var(--main-color);
  border-radius: 8px;
  margin: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 860px) {
    margin: 0;
    height: auto;
    max-height: 48vh;
  }

  .header-banner {
    padding: 16px 18px 12px;
    border-bottom: 2px solid var(--main-color);
    background: #fefce8;
  }

  .title {
    color: var(--font-color);
    font-weight: 900;
    font-size: 18px;
    line-height: 1.25;
    margin: 0;
  }

  .title span {
    color: var(--font-color-sub);
    font-weight: 600;
    font-size: 14px;
  }

  .sidebar-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 10px 14px;
    gap: 8px;
    border-bottom: 2px solid var(--main-color);
    background: var(--panel-bg);
    transition: background 0.4s ease;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 4px;
    font-size: 13px;
    font-weight: 800;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 3px 3px 0px var(--main-color);
    color: var(--font-color);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px var(--main-color);
  }

  .tab-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px var(--main-color);
  }

  .tab-btn.active {
    background-color: #fef08a;
    color: #000000;
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px var(--main-color);
  }

  .sidebar-scrollable {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tab-pane {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-label {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--font-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pill-metric {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1.5px solid var(--main-color);
    background-color: #fef08a;
    color: #000;
    box-shadow: 2px 2px 0px var(--main-color);
  }

  .input-field-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .input-icon {
    position: absolute;
    left: 12px;
    color: var(--font-color);
    pointer-events: none;
  }

  .input {
    width: 100%;
    height: 42px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px 0px var(--main-color);
    font-size: 14px;
    font-weight: 600;
    color: var(--font-color);
    padding: 8px 12px 8px 36px;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }

  .input::placeholder {
    color: var(--font-color-sub);
    opacity: 0.8;
  }

  .input:focus {
    border: 2px solid var(--input-focus);
    box-shadow: 4px 4px 0px var(--input-focus);
  }

  .hint-card {
    display: flex;
    gap: 12px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px 0px var(--main-color);
    padding: 12px 14px;
  }

  .hint-icon {
    color: #7c3aed;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .hint-text strong {
    display: block;
    font-size: 13px;
    font-weight: 800;
    color: var(--font-color);
    margin-bottom: 3px;
  }

  .hint-text p {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.45;
    color: var(--font-color-sub);
  }

  .slider-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .slider-val {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1.5px solid var(--main-color);
    background-color: #fef08a;
    color: #000;
    box-shadow: 2px 2px 0px var(--main-color);
  }

  .neo-range {
    -webkit-appearance: none;
    width: 100%;
    height: 12px;
    border-radius: 6px;
    border: 2px solid var(--main-color);
    background: var(--bg-color);
    box-shadow: 3px 3px 0px var(--main-color);
    outline: none;
    cursor: pointer;
    margin: 8px 0;
  }

  .neo-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 2px solid var(--main-color);
    background: #2d8cf0;
    box-shadow: 2px 2px 0px var(--main-color);
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .neo-range::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .slider-ticks {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    font-weight: 700;
    color: var(--font-color-sub);
  }

  .terrain-metrics-card {
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px 0px var(--main-color);
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .metric-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .metric-label {
    font-weight: 600;
    color: var(--font-color-sub);
  }

  .metric-val {
    font-family: var(--font-mono);
    font-weight: 800;
    color: var(--font-color);
  }

  .palette-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .theme-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background: var(--bg-color);
    box-shadow: 3px 3px 0px var(--main-color);
    color: var(--font-color);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .theme-card:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px var(--main-color);
  }

  .theme-card:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px var(--main-color);
  }

  .theme-card.selected {
    background: #fef08a;
    color: #000;
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px var(--main-color);
  }

  .theme-swatch-row {
    display: flex;
    gap: 5px;
  }

  .swatch {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1.5px solid var(--main-color);
  }

  .theme-name {
    font-size: 13px;
    font-weight: 800;
  }

  .sidebar-footer {
    padding: 14px 16px;
    border-top: 2px solid var(--main-color);
    background: var(--panel-bg);
  }
`

import React from 'react'
import styled from 'styled-components'
import { Box, Sparkles } from 'lucide-react'
import ScannableBadge from './ScannableBadge'

export default function Header({ scannable }) {
  return (
    <StyledHeader>
      <div className="header-card">
        <div className="brand">
          <div className="brand-logo">
            <Box size={19} className="logo-icon" />
            <span className="logo-spark">
              <Sparkles size={9} />
            </span>
          </div>
          <div className="brand-text">
            <span className="brand-title">QR Studio</span>
            <span className="brand-badge">Procedural 3D Voxel Engine</span>
          </div>
        </div>

        <div className="header-actions">
          <ScannableBadge scannable={scannable} />
        </div>
      </div>
    </StyledHeader>
  )
}

const StyledHeader = styled.header`
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  padding: 12px 16px 16px;
  box-sizing: border-box;

  .header-card {
    width: 100%;
    max-width: 1600px;
    height: 58px;
    border-radius: 8px;
    border: 2px solid #000;
    background: #fffdeb;
    box-shadow: 4px 4px 0px #000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    box-sizing: border-box;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-logo {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    border: 2px solid #000;
    background: #fef08a;
    box-shadow: 2px 2px 0px #000;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
  }

  .logo-spark {
    position: absolute;
    top: -4px;
    right: -4px;
    color: #eab308;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .brand-title {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: -0.01em;
    color: #1f242e;
  }

  .brand-badge {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #666666;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .scan-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 5px;
    border: 2px solid #000;
    box-shadow: 2px 2px 0px #000;
    font-size: 12px;
    font-weight: 700;
    background: #ffffff;
  }

  .scan-badge.is-valid {
    color: #059669;
  }

  .scan-badge.is-warning {
    color: #d97706;
  }
`

import React from 'react'
import styled from 'styled-components'
import { ScanLine } from 'lucide-react'

export default function Align2DButton({ onClick, className = '' }) {
  return (
    <StyledWrapper className={className}>
      <button
        type="button"
        className="align-2d-btn"
        onClick={onClick}
        title="Align camera to flat, straight, non-tilted 2D QR view"
      >
        <ScanLine size={16} className="btn-icon" />
        <span>Align 2D Straight</span>
      </button>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 10px;

  .align-2d-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 11px 16px;
    border-radius: 6px;
    border: 2px solid #000;
    background: #fef08a;
    color: #000;
    font-family: inherit;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.3px;
    box-shadow: 4px 4px 0px #000;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .align-2d-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px #000;
    background: #fef9c3;
  }

  .align-2d-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px #000;
  }

  .btn-icon {
    flex-shrink: 0;
  }
`

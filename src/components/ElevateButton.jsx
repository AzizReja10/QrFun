import React from 'react'
import styled from 'styled-components'

const ElevateButton = ({
  onClick,
  expanded = false,
  label,
  suffix,
  className = '',
}) => {
  const displayLabel = label || (expanded ? 'Flatten' : 'Elevate 3D')
  const displaySuffix = suffix || (expanded ? 'to 2D' : 'Island')
  const padRight = `${Math.max(3.2, ((displaySuffix?.length || 6) + 1) * 0.58)}em`

  return (
    <StyledWrapper
      $expanded={expanded}
      $suffix={displaySuffix}
      $padRight={padRight}
      className={className}
    >
      <button
        type="button"
        className="button"
        style={{ verticalAlign: 'middle' }}
        onClick={onClick}
      >
        <span>{displayLabel}</span>
      </button>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  .button {
    display: inline-block;
    border-radius: 6px;
    border: 2px solid #000;
    background: ${(props) => (props.$expanded ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : '#1875FF')};
    color: white;
    font-family: inherit;
    text-align: center;
    font-size: 13px;
    font-weight: 800;
    box-shadow: 4px 4px 0px #000;
    width: 100%;
    padding: 1em;
    transition: all 0.2s;
    cursor: pointer;
    touch-action: manipulation;
  }

  @media (hover: hover) {
    .button:hover {
      transform: translate(-1px, -1px);
      box-shadow: 5px 5px 0px #000;
    }

    .button:hover span {
      padding-right: ${(props) => props.$padRight};
    }

    .button:hover span:after {
      opacity: 1;
      right: 0;
    }
  }

  .button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px #000;
  }

  .button span {
    cursor: pointer;
    display: inline-block;
    position: relative;
    transition: 0.4s;
  }

  .button span:after {
    content: ' ${(props) => props.$suffix}';
    position: absolute;
    opacity: 0;
    top: 0;
    right: -20px;
    transition: 0.7s;
    white-space: nowrap;
  }
`

export { ElevateButton as Button }
export default ElevateButton

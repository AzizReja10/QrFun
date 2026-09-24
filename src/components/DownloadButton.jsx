import React from 'react'
import styled from 'styled-components'

const DownloadButton = ({ onClick, label = 'Export' }) => {
  return (
    <StyledWrapper>
      <button className="Btn" onClick={onClick}>
        {label}
        {/* Download Icon (512x512) */}
        <svg className="svg" viewBox="0 0 512 512">
          <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
        </svg>
      </button>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  .Btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: 44px;
    border: 2px solid #000;
    padding: 0px 24px;
    background-color: rgb(168, 38, 255);
    color: white;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    border-radius: 6px;
    box-shadow: 4px 4px 0px #000;
    transition-duration: 0.2s;
    box-sizing: border-box;
    touch-action: manipulation;
  }

  @media (hover: hover) {
    .Btn:hover {
      color: transparent;
      transform: translate(-1px, -1px);
      box-shadow: 5px 5px 0px #000;
    }

    .Btn:hover svg {
      right: calc(50% - 7px);
      margin: 0;
      padding: 0;
      border: none;
      transition-duration: 0.2s;
    }
  }

  .svg {
    width: 14px;
    height: 14px;
    position: absolute;
    right: 0;
    margin-right: 20px;
    fill: white;
    transition-duration: 0.2s;
  }

  .Btn:active {
    transform: translate(3px, 3px);
    transition-duration: 0.1s;
    box-shadow: 0px 0px 0px #000;
  }
`

export default DownloadButton

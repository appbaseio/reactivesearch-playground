import styled from 'styled-components';

const MetaEditor = styled.div`
  height: 100%;
  margin-top: -1px;

  .meta-editor__content {
    height: 100%;
    position: relative;

    header.tabbed-header {
      width: 100%;
      position: absolute;
      inset: 0 10px 0 0px;
      height: 30px;
      z-index: 10;
      background: ${({ theme }) => theme.colors.backgroundColor};

      button {
        cursor: pointer;
        background: transparent;
        outline: 0;
        border: 0;
        color: ${({ theme }) => theme.colors.textColor};
        font-size: 0.875rem;
        padding-top: 10px;
        letter-spacing: 1.5px;
      }
    }
  }
`;

export default MetaEditor;

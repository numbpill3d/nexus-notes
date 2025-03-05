import React from 'react';
import styled, { keyframes } from 'styled-components';
import Tree, { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree';

// Define our node structure
interface NoteNode extends RawNodeDatum {
  name: string;
  attributes: {
    [key: string]: string | number | boolean;
    id: string;
    created: string;
    modified: string;
    tagList: string;
  };
  children?: NoteNode[];
}

const scanlineEffect = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
`;

const GraphContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #000;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: rgba(0, 255, 0, 0.1);
    animation: ${scanlineEffect} 8s linear infinite;
    pointer-events: none;
  }

  .rd3t-link {
    stroke: #00ff00 !important;
    stroke-width: 1px;
    filter: drop-shadow(0 0 2px #00ff00);
  }

  .rd3t-node {
    fill: #000;
    stroke: #00ff00;
    stroke-width: 2px;
    filter: drop-shadow(0 0 3px #00ff00);
  }

  .rd3t-label__title {
    fill: #00ff00;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    text-shadow: 0 0 4px #00ff00;
  }
`;

interface NoteGraphProps {
  data: NoteNode;
}

const NoteGraph: React.FC<NoteGraphProps> = ({ data }) => {
  const renderCustomNode = (nodeProps: CustomNodeElementProps) => (
    <g>
      <circle r={15} fill="#000" stroke="#00ff00" strokeWidth={2} />
      <text
        fill="#00ff00"
        x={20}
        y={0}
        style={{ 
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          textShadow: '0 0 4px #00ff00'
        }}
      >
      {nodeProps.nodeDatum.name}
      </text>
      {(nodeProps.nodeDatum.attributes as NoteNode['attributes']).tagList && (
        <text
          fill="#00ff00"
          x={20}
          y={20}
          style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '10px',
            opacity: 0.7
          }}
        >
          {(nodeProps.nodeDatum.attributes as NoteNode['attributes']).tagList}
        </text>
      )}
    </g>
  );

  return (
    <GraphContainer>
      <Tree
        data={data}
        orientation="horizontal"
        renderCustomNodeElement={renderCustomNode}
        pathFunc="step"
        separation={{ siblings: 2, nonSiblings: 2.5 }}
        translate={{ x: 100, y: 200 }}
        nodeSize={{ x: 200, y: 100 }}
        enableLegacyTransitions={true}
        transitionDuration={800}
      />
    </GraphContainer>
  );
};

export default NoteGraph; 
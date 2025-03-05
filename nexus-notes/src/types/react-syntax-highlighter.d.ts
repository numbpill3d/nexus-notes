declare module 'react-syntax-highlighter' {
  import { ComponentType, ReactNode, CSSProperties } from 'react';

  interface LineTagPropsType {
    className?: string;
    style?: CSSProperties;
    [key: string]: unknown;
  }

  interface RendererProps {
    rows: string[];
    stylesheet: string;
    useInlineStyles: boolean;
  }

  export interface SyntaxHighlighterProps {
    language?: string;
    children?: ReactNode;
    style?: Record<string, CSSProperties>;
    customStyle?: CSSProperties;
    codeTagProps?: Record<string, unknown>;
    useInlineStyles?: boolean;
    showLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberStyle?: CSSProperties;
    wrapLines?: boolean;
    lineProps?: LineTagPropsType;
    renderer?: (props: RendererProps) => ReactNode;
    PreTag?: ComponentType | keyof JSX.IntrinsicElements;
    CodeTag?: ComponentType | keyof JSX.IntrinsicElements;
  }

  export const Prism: ComponentType<SyntaxHighlighterProps>;
  export const Light: ComponentType<SyntaxHighlighterProps>;
  
  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}
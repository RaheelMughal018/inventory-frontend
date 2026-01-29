// types/jspdf-autotable.d.ts
declare module 'jspdf-autotable' {
    import { jsPDF } from 'jspdf';
  
    export interface UserOptions {
      // Content
      head?: RowInput[];
      body?: RowInput[];
      foot?: RowInput[];
      
      // Styling
      theme?: 'striped' | 'grid' | 'plain';
      styles?: Partial<Styles>;
      headStyles?: Partial<Styles>;
      bodyStyles?: Partial<Styles>;
      footStyles?: Partial<Styles>;
      alternateRowStyles?: Partial<Styles>;
      columnStyles?: { [key: string]: Partial<Styles> };
      
      // Layout
      startY?: number | false;
      margin?: MarginPadding;
      pageBreak?: 'auto' | 'avoid' | 'always';
      rowPageBreak?: 'auto' | 'avoid';
      tableWidth?: 'auto' | 'wrap' | number;
      
      // Hooks
      didDrawPage?: (data: any) => void;
      didDrawCell?: (data: any) => void;
      didParseCell?: (data: any) => void;
      willDrawCell?: (data: any) => void;
      willDrawPage?: (data: any) => void;
      
      // Other
      showHead?: 'everyPage' | 'firstPage' | 'never';
      showFoot?: 'everyPage' | 'lastPage' | 'never';
      tableLineColor?: number | number[];
      tableLineWidth?: number;
    }
  
    export interface Styles {
      font?: string;
      fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
      overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
      fillColor?: number | number[] | false;
      textColor?: number | number[];
      cellPadding?: MarginPadding;
      fontSize?: number;
      cellWidth?: 'auto' | 'wrap' | number;
      minCellWidth?: number;
      minCellHeight?: number;
      halign?: 'left' | 'center' | 'right' | 'justify';
      valign?: 'top' | 'middle' | 'bottom';
      lineColor?: number | number[];
      lineWidth?: number;
    }
  
    export type MarginPadding = number | {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
      horizontal?: number;
      vertical?: number;
    };
  
    export type RowInput = CellInput[] | { [key: string]: CellInput };
    export type CellInput = string | number | boolean | null | undefined;
  
    export default function autoTable(doc: jsPDF, options: UserOptions): void;
  
    // Extend jsPDF
    declare module 'jspdf' {
      interface jsPDF {
        lastAutoTable: {
          finalY: number;
        };
      }
    }
  }
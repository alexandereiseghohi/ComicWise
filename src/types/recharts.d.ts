declare module "recharts" {
  import type { CSSProperties, FC, ReactNode } from "react";

  // Core chart components
  export const BarChart: FC<any>;
  export const LineChart: FC<any>;
  export const PieChart: FC<any>;
  export const AreaChart: FC<any>;
  export const ComposedChart: FC<any>;
  export const ScatterChart: FC<any>;
  export const RadarChart: FC<any>;
  export const RadialBarChart: FC<any>;
  export const Treemap: FC<any>;
  export const FunnelChart: FC<any>;

  // Chart elements
  export const Bar: FC<any>;
  export const Line: FC<any>;
  export const Area: FC<any>;
  export const Pie: FC<any>;
  export const Scatter: FC<any>;
  export const Radar: FC<any>;
  export const RadialBar: FC<any>;
  export const Funnel: FC<any>;

  // Cartesian components
  export const XAxis: FC<any>;
  export const YAxis: FC<any>;
  export const ZAxis: FC<any>;
  export const CartesianGrid: FC<any>;
  export const CartesianAxis: FC<any>;

  // Polar components
  export const PolarGrid: FC<any>;
  export const PolarAngleAxis: FC<any>;
  export const PolarRadiusAxis: FC<any>;

  // Components
  export const ResponsiveContainer: FC<any>;
  export const Tooltip: FC<any>;
  export const Legend: FC<LegendProps>;
  export const Label: FC<any>;
  export const LabelList: FC<any>;
  export const Cell: FC<any>;
  export const ReferenceLine: FC<any>;
  export const ReferenceDot: FC<any>;
  export const ReferenceArea: FC<any>;
  export const Brush: FC<any>;
  export const ErrorBar: FC<any>;
  export const Customized: FC<any>;

  export interface LegendProps {
    content?: FC<any> | ReactNode;
    wrapperStyle?: CSSProperties;
    chartWidth?: number;
    chartHeight?: number;
    width?: number;
    height?: number;
    iconSize?: number;
    iconType?:
      | "line"
      | "plainline"
      | "square"
      | "rect"
      | "circle"
      | "cross"
      | "diamond"
      | "star"
      | "triangle"
      | "wye";
    layout?: "horizontal" | "vertical";
    align?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    payload?: any[];
    [key: string]: any;
  }

  // Namespaces
  export namespace Recharts {
    export interface Props {
      [key: string]: any;
    }
  }
}

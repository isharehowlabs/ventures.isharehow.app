import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    dashboard?: {
      spacing: {
        card: number;
        section: number;
        widget: number;
      };
      colors: {
        dataHighlight: string;
        metricPrimary: string;
        metricSecondary: string;
        chartGrid: string;
      };
    };
  }

  interface ThemeOptions {
    dashboard?: {
      spacing?: {
        card?: number;
        section?: number;
        widget?: number;
      };
      colors?: {
        dataHighlight?: string;
        metricPrimary?: string;
        metricSecondary?: string;
        chartGrid?: string;
      };
    };
  }
}


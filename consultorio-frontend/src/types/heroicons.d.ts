import { react } from '@vitejs/plugin-react-swc';
declare module '@heroicons/react/24/outline' {
  import * as React from 'react';
  export const BellIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const XMarkIcon: react.FC<react.SVGProps<SVGSVGElement>>;
  // Agregá otros íconos que uses aquí si querés
}

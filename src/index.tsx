import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { EnsureKontentAsParent } from "./EnsureKontentAsParent";
import { RecombeeTypesManager } from './RecombeeTypesManager';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <EnsureKontentAsParent>
      <RecombeeTypesManager />
    </EnsureKontentAsParent>
  </React.StrictMode>
);

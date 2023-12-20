import React from 'react';
import ReactDOM from 'react-dom/client';
import Projector from './2023/Projector.tsx';

const domNode = document.getElementById('root');
const rootNode = ReactDOM.createRoot(domNode);

rootNode.render(<Projector/>);
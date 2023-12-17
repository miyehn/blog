import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './2023/main.tsx';

const domNode = document.getElementById('root');
const rootNode = ReactDOM.createRoot(domNode);

rootNode.render(<Main/>);
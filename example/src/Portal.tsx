import * as React from 'react';
import * as ReactDOM from 'react-dom';

const domNode = document.getElementById('portal-root') as HTMLDivElement;

const Portal: React.FC = ({ children }) => {
  return ReactDOM.createPortal(children, domNode);
};

export default Portal;

import * as React from 'react';

interface ButtonProps {
  active: boolean;
  children: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ active, children, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: 80,
        marginInline: 2,
        fontWeight: active ? 'bold' : 'normal',
      }}
    >
      {children}
    </button>
  );
};

export default Button;

import 'react-app-polyfill/ie11';
import * as React from 'react';
import { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import ResponsiveToolbar, { OverflowButtonProps } from '../../src';
import Portal from './Portal';
import Button from './Button';

interface CustomOverflowButtonProps extends OverflowButtonProps {
  overflowMenuOpen: boolean;
  toggleOverflowMenu: () => void;
}

const OverflowButton: React.FC<CustomOverflowButtonProps> = ({
  children,
  shown,
  overflowMenuOpen,
  toggleOverflowMenu,
}) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        onClick={toggleOverflowMenu}
        ref={buttonRef}
        style={{
          marginInline: 2,
        }}
      >
        Show More ...
      </button>
      {overflowMenuOpen && shown && (
        <Portal>
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              padding: '10px',
              border: 'thin solid #ccc',
              borderRadius: 3,
              background: '#eee',
              position: 'fixed',
              top: buttonRef.current?.getBoundingClientRect().bottom || 20,
              left: buttonRef.current?.getBoundingClientRect().right || 20,
              transform: 'translateX(-100%)',
            }}
          >
            {React.Children.map(children, child => {
              if (!React.isValidElement(child)) {
                return child;
              }

              return React.cloneElement(child, {
                style: { ...child.props.style, width: 'auto' },
              });
            })}
          </div>
        </Portal>
      )}
    </>
  );
};

const App: React.VFC = () => {
  const [overflowMenuOpen, setOverflowMenuOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [amountButtons, setAmountButtons] = useState<number>(15);

  useEffect(() => {
    if (activeIndex !== null && activeIndex + 1 > amountButtons) {
      setActiveIndex(null);
    }
  }, [activeIndex, amountButtons]);

  return (
    <div className="App">
      <h1>Responsive Toolbar Example</h1>

      <button onClick={() => setAmountButtons(prevAmount => prevAmount + 1)}>
        Add Button
      </button>
      <button
        onClick={() =>
          setAmountButtons(prevAmount => Math.max(0, prevAmount - 1))
        }
        disabled={amountButtons === 0}
      >
        Remove Button
      </button>

      <hr />

      <ResponsiveToolbar
        activeIndex={activeIndex}
        overflowButton={OverflowButton}
        overflowButtonProps={{
          overflowMenuOpen,
          toggleOverflowMenu: () => setOverflowMenuOpen(prevOpen => !prevOpen),
        }}
      >
        {new Array(amountButtons).fill(null).map((_item, index) => (
          <Button
            key={index}
            active={index === activeIndex}
            onClick={() => {
              setActiveIndex(prevIndex => (prevIndex === index ? null : index));
              setOverflowMenuOpen(false);
            }}
          >
            {`Button ${index + 1}`}
          </Button>
        ))}
      </ResponsiveToolbar>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

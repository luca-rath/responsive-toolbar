import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useResizeObserver from '@react-hook/resize-observer';

export interface OverflowButtonProps {
  overflowingIndices: number[];
  shown: boolean;
}

export type IOverflowButton = React.FC<OverflowButtonProps>;

export interface ResponsiveToolbarProps {
  overflowButton: IOverflowButton;
  overflowButtonProps?: {};
  activeIndex?: number | null;
}

const ResponsiveToolbar: React.FC<ResponsiveToolbarProps> = ({
  children,
  overflowButton: OverflowButtonComponent,
  overflowButtonProps = {},
  activeIndex: newActiveIndex = null,
}) => {
  const [forceRecalculateCounter, setForceRecalculateCounter] = useState<
    number
  >(0);

  const forceRecalculateAmountShownChildren = () => {
    setForceRecalculateCounter(
      oldForceRecalculateCounter => oldForceRecalculateCounter + 1
    );
  };

  const virtualOverflowButtonRef = useRef<HTMLDivElement>(null);
  const virtualContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const virtualChildRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  const [previousActiveIndex, setPreviousActiveIndex] = useState<number | null>(
    null
  );
  const [currentActiveIndex, setCurrentActiveIndex] = useState<number | null>(
    newActiveIndex
  );

  const amountChildren = React.Children.count(children);

  const [amountShownChildren, setAmountShownChildren] = useState<number>(
    amountChildren
  );

  const childIndices: number[] = useMemo(
    () => React.Children.toArray(children).map((_child, index) => index),
    [children]
  );

  const sortedChildIndices = useMemo(
    () =>
      [...childIndices].sort((a, b) => {
        if (a === currentActiveIndex) return -1;
        if (b === currentActiveIndex) return 1;
        if (a === previousActiveIndex) return -1;
        if (b === previousActiveIndex) return 1;

        return 0;
      }),
    [childIndices, currentActiveIndex, previousActiveIndex]
  );

  const shownChildIndices = useMemo(() => {
    return sortedChildIndices.slice(0, amountShownChildren).sort();
  }, [amountShownChildren, sortedChildIndices]);

  const overflowingChildIndices = useMemo(() => {
    return sortedChildIndices.slice(amountShownChildren).sort();
  }, [amountShownChildren, sortedChildIndices]);

  const recalculateAmountShownChildren = useCallback(() => {
    const virtualOverflowButtonWidth = virtualOverflowButtonRef.current?.getBoundingClientRect()
      .width;
    const virtualContainerWidth = virtualContainerRef.current?.getBoundingClientRect()
      .width;
    const containerWidth = containerRef.current?.getBoundingClientRect().width;

    if (
      undefined === virtualOverflowButtonWidth ||
      undefined === containerWidth ||
      undefined === virtualContainerWidth
    ) {
      return;
    }

    if (containerWidth >= virtualContainerWidth) {
      setAmountShownChildren(amountChildren);

      return;
    }

    let currentAmountShownChildren = 0;
    let currentShownChildrenCombinedWidth = virtualOverflowButtonWidth;

    const sortedChildRefs = [...virtualChildRefs.current].sort();
    sortedChildRefs.forEach(ref => {
      const currentChildRef = ref.current;

      if (!currentChildRef) {
        return;
      }

      currentShownChildrenCombinedWidth += currentChildRef.getBoundingClientRect()
        .width;

      if (currentShownChildrenCombinedWidth <= containerWidth) {
        currentAmountShownChildren++;
      }
    });

    if (currentAmountShownChildren < amountShownChildren) {
      setPreviousActiveIndex(null);
    }

    setAmountShownChildren(currentAmountShownChildren);
  }, [amountChildren, amountShownChildren]);

  useEffect(() => {
    if (newActiveIndex === currentActiveIndex) {
      return;
    }

    if (null === newActiveIndex || shownChildIndices.includes(newActiveIndex)) {
      if (
        currentActiveIndex !== null &&
        currentActiveIndex + 1 > amountShownChildren
      ) {
        setPreviousActiveIndex(currentActiveIndex);
      }
    } else {
      setPreviousActiveIndex(null);
    }

    setCurrentActiveIndex(newActiveIndex);

    forceRecalculateAmountShownChildren();
  }, [
    newActiveIndex,
    currentActiveIndex,
    previousActiveIndex,
    amountShownChildren,
    shownChildIndices,
  ]);

  useEffect(() => {
    if (null === previousActiveIndex) {
      return;
    }

    if (
      !childIndices.includes(previousActiveIndex) ||
      previousActiveIndex < amountShownChildren
    ) {
      setPreviousActiveIndex(null);
    }
  }, [childIndices, previousActiveIndex, amountShownChildren]);

  useLayoutEffect(() => {
    if (forceRecalculateCounter < 0) {
      // Will never happen, but otherwise `forceRecalculateCounter` isn't being used and
      // therefore shouldn't be added as hook dependency
      return;
    }

    recalculateAmountShownChildren();
  }, [forceRecalculateCounter, recalculateAmountShownChildren]);

  useResizeObserver(virtualContainerRef, () => {
    forceRecalculateAmountShownChildren();
  });

  useResizeObserver(containerRef, () => {
    forceRecalculateAmountShownChildren();
  });

  const virtualChildren = useMemo(() => {
    const result: Record<number, React.ReactNode> = {};

    React.Children.forEach(children, (child, index) => {
      const sortedIndex = sortedChildIndices.indexOf(index);
      result[sortedIndex] = child;
    });

    return Object.values(result)
      .sort()
      .map((child, index) => {
        if (undefined === virtualChildRefs.current[index]) {
          virtualChildRefs.current[index] = React.createRef();
        }

        return (
          <div
            style={{
              flex: '0 0 max-content',
            }}
            key={index}
            ref={virtualChildRefs.current[index]}
          >
            {child}
          </div>
        );
      });
  }, [sortedChildIndices, children]);

  const shownChildren = useMemo(() => {
    return React.Children.toArray(children)
      .filter((_child, index) => {
        return shownChildIndices.includes(index);
      })
      .map((child, index) => (
        <div style={{ flex: '0 0 max-content' }} key={index}>
          {child}
        </div>
      ));
  }, [shownChildIndices, children]);

  const overflowingChildren = useMemo(() => {
    return React.Children.toArray(children).filter((_child, index) => {
      return !shownChildIndices.includes(index);
    });
  }, [shownChildIndices, children]);

  const showOverflowButton = amountChildren > amountShownChildren;

  return (
    <div style={{ overflowX: 'hidden' }}>
      <div
        style={{
          position: 'fixed',
          visibility: 'hidden',
          width: 'max-content',
          minWidth: 'max-content',
          maxWidth: 'max-content',
        }}
        aria-hidden={true}
        ref={virtualOverflowButtonRef}
      >
        <OverflowButtonComponent
          {...overflowButtonProps}
          children={[]}
          overflowingIndices={[]}
          shown={false}
        />
      </div>

      <div
        style={{
          position: 'fixed',
          visibility: 'hidden',
          display: 'flex',
          width: 'max-content',
          minWidth: 'max-content',
          maxWidth: 'max-content',
        }}
        aria-hidden={true}
        ref={virtualContainerRef}
      >
        {virtualChildren}
      </div>

      <div
        style={{
          display: 'flex',
          width: '100%',
          minWidth: '100%',
          maxWidth: '100%',
        }}
        ref={containerRef}
      >
        {shownChildren}

        {showOverflowButton && (
          <div
            style={{
              flex: '0 0 max-content',
            }}
            role="navigation"
          >
            <OverflowButtonComponent
              {...overflowButtonProps}
              overflowingIndices={overflowingChildIndices}
              shown={showOverflowButton}
            >
              {overflowingChildren}
            </OverflowButtonComponent>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveToolbar;

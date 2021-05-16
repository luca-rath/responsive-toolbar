import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ResponsiveToolbar from '../src';

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    const OverflowButton = () => {
      return <span>more...</span>;
    };

    ReactDOM.render(
      <ResponsiveToolbar overflowButton={OverflowButton} activeIndex={1}>
        <span>foo</span>
        <span>bar</span>
        <span>baz</span>
      </ResponsiveToolbar>,
      div
    );

    ReactDOM.unmountComponentAtNode(div);
  });
});

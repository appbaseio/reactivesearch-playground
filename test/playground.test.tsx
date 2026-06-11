import React from 'react';
import * as ReactDOM from 'react-dom';
import { Default as Playground } from '../stories/Playground.stories';

describe('Thing', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Playground />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});

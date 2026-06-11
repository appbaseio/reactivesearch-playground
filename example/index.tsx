import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Playground from '../src/index';

const App = () => {
  return (
    <div style={{ height: '100vh', margin: 0 }}>
      <Playground />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

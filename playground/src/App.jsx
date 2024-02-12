import NavBar from './components/NavBar';
import View from './components/Views/View';

import '@spectrum-web-components/split-view/sp-split-view.js';

function App() {
  return (
    <>
      <sp-split-view resizable primary-size="200" primary-max="200" style={{ height: 100 + 'vh' }}>
        <NavBar />
        <View />
      </sp-split-view>
    </>
  );
}

export default App;

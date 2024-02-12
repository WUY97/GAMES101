import '@spectrum-web-components/sidenav/sp-sidenav.js';
import '@spectrum-web-components/sidenav/sp-sidenav-heading.js';
import '@spectrum-web-components/sidenav/sp-sidenav-item.js';

import { useStore } from '../store/Store';
import dirs from '../store/dirs';

export default function NavBar() {
  const { state, dispatch } = useStore();
  const { page } = state;

  const handleClick = (dir) => {
    dispatch({ type: 'set_page', data: dir });
  };

  return (
    <sp-sidenav variant="multilevel" style={{ padding: 0.2 + 'rem', rowGap: 0.2 + 'rem' }}>
      {Object.keys(dirs).map((dir) => (
        <sp-sidenav-item
          value={dir}
          label={dirs[dir]}
          key={dir}
          onClick={() => handleClick(dir)}
          {...(page === dir ? { selected: true } : {})}></sp-sidenav-item>
      ))}
    </sp-sidenav>
  );
}

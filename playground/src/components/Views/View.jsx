import { useStore } from '../../store/Store';

import dirs from '../../store/dirs';
import S from './View.module.css';

export default function View() {
  const { state } = useStore();
  const { page } = state;
  const CurrentComponent = dirs[page];
  return (
    <div className={S.container}>
      {typeof CurrentComponent === 'function' ? <CurrentComponent /> : CurrentComponent}
    </div>
  );
}

import { useStore } from '../store/Store';

import dirs from '../store/dirs';
import S from './View.module.css';

export default function View() {
  const { state } = useStore();
  const { page } = state;
  return (
    <div className={S.container}>
      <h1>{dirs[page]}</h1>
    </div>
  );
}

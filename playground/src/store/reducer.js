import dirs from './dirs';

export const initialState = {
  loading: false,
  error: '',
  page: Object.keys(dirs)[0]
};

export const actionTypes = {
  ERROR: 'error',
  SET_PAGE: 'set_page'
};

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ERROR: {
      return {
        ...state,
        loading: false,
        error: action.data
      };
    }
    case actionTypes.SET_PAGE: {
      return {
        ...state,
        page: action.data
      };
    }
    default:
      return state;
  }
};

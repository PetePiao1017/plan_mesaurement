import api from '../utils/api';
import {
    SAVE_RESULT,
} from './types'

export const saveResult = (data) => async (dispatch) => {

    try {
      const res = await api.put('/measure', data);
  
      dispatch({
        type: SAVE_RESULT,
        payload: res.data
      }); 
  
    } catch (err) {
      const errors = err.response.data.errors;   
    }
  };
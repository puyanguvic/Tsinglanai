import Taro from '@tarojs/taro';
import { authService } from '../modules/auth/auth.service';

export async function loginWithWeapp() {
  const { code } = await Taro.login();
  const res = await authService.weappLogin(code);
  return res.data;
}

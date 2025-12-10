import { useLaunch } from '@tarojs/taro';
import './styles/global.scss';

function App({ children }: { children: React.ReactNode }) {
  useLaunch(() => {
    console.log('Tsinglan mobile app launched');
  });
  return children;
}

export default App;

import { View } from '@tarojs/components';
import { ReactNode } from 'react';
import './layout.scss';

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => <View className="layout">{children}</View>;

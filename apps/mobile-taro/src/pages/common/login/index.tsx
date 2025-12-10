import { useState } from 'react';
import { View, Button, Input, Text } from '@tarojs/components';
import { useAuth } from '../../../modules/auth/hooks/useAuth';
import './index.scss';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="login-page">
      <Text className="title">登录</Text>
      <Input value={email} onInput={(e) => setEmail(e.detail.value)} placeholder="邮箱" />
      <Input
        value={password}
        onInput={(e) => setPassword(e.detail.value)}
        placeholder="密码"
        password
      />
      <Button
        disabled={loading}
        onClick={() => login({ email, password })}
        type="primary"
      >
        登录
      </Button>
      {error ? <Text className="error">{error}</Text> : null}
    </View>
  );
};

export default LoginPage;

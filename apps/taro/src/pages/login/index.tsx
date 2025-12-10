import { useState } from 'react';
import { View, Input, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { apiClient } from '@shared/services/apiClient';
import './index.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('请输入账号和密码');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.auth.login({ username, password });
      await Taro.setStorage({ key: 'role', data: res.role });
      await Taro.setStorage({ key: 'username', data: username });
      // 依赖后端 Cookie/JWT，前端只存一些必要状态
      Taro.showToast({ title: '登录成功', icon: 'success' });
      Taro.redirectTo({ url: '/pages/dashboard/index' });
    } catch (err: any) {
      setError(err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="page">
      <View className="card">
        <Text className="title">Tsinglan Admin</Text>
        <Text className="subtitle">小程序 / H5 统一登录</Text>
        {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}
        <View className="form">
          <View className="form-item">
            <Text className="label">账号</Text>
            <Input
              className="input"
              placeholder="请输入账号"
              value={username}
              onInput={(e) => setUsername(e.detail.value)}
            />
          </View>
          <View className="form-item">
            <Text className="label">密码</Text>
            <Input
              className="input"
              type="password"
              placeholder="请输入密码"
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
          </View>
          <Button className="btn" loading={loading} onClick={handleLogin} type="primary">
            登录
          </Button>
        </View>
      </View>
    </View>
  );
}

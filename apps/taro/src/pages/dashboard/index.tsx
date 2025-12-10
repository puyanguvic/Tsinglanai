import { useEffect, useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { apiClient } from '@shared/services/apiClient';
import { InventoryItem, PurchaseRequest } from '@shared/types';
import '../login/index.css';

export default function DashboardPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [inv, reqs] = await Promise.all([apiClient.inventory.list(), apiClient.requests.list()]);
        setInventory(inv);
        setRequests(reqs);
      } catch (err: any) {
        setError(err?.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const go = (url: string) => Taro.navigateTo({ url });

  return (
    <View className="page">
      <View className="card">
        <Text className="title">Dashboard</Text>
        <Text className="subtitle">简版概览（小程序/H5），图表待替换为小程序可用库</Text>
        {loading && <Text>加载中...</Text>}
        {error && <Text style={{ color: 'red' }}>{error}</Text>}
        {!loading && !error && (
          <View className="list">
            <View className="list-item">
              <Text>库存项目：{inventory.length}</Text>
            </View>
            <View className="list-item">
              <Text>申请数：{requests.length}</Text>
            </View>
          </View>
        )}
      </View>

      <View className="card">
        <Text className="title">导航</Text>
        <View className="list">
          <Button onClick={() => go('/pages/requests/index')}>采购/申请</Button>
          <Button onClick={() => go('/pages/teachers/index')}>教师管理</Button>
          <Button onClick={() => go('/pages/students/index')}>学生管理</Button>
        </View>
      </View>
    </View>
  );
}

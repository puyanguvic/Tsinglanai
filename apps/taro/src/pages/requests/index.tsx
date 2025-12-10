import { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import { apiClient } from '@shared/services/apiClient';
import { PurchaseRequest } from '@shared/types';
import '../login/index.css';

export default function RequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.requests.list();
        setRequests(data);
      } catch (err: any) {
        setError(err?.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View className="page">
      <View className="card">
        <Text className="title">采购 / 申请</Text>
        <Text className="subtitle">后续可增加提交表单、小程序端审批流</Text>
        {loading && <Text>加载中...</Text>}
        {error && <Text style={{ color: 'red' }}>{error}</Text>}
        {!loading && !error && (
          <View className="list">
            {requests.map((req) => (
              <View className="list-item" key={req.id}>
                <Text>{req.itemName}</Text>
                <Text className="badge">{req.status}</Text>
                <View>
                  <Text>数量：{req.quantity}</Text>
                </View>
                <View>
                  <Text>金额：¥{req.totalAmount}</Text>
                </View>
              </View>
            ))}
            {requests.length === 0 && <Text>暂无申请</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

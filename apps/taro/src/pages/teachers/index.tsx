import { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import { apiClient } from '@shared/services/apiClient';
import { Teacher } from '@shared/types';
import '../login/index.css';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.teachers.list();
        setTeachers(data);
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
        <Text className="title">教师管理</Text>
        <Text className="subtitle">列表视图，可扩展为编辑/审批</Text>
        {loading && <Text>加载中...</Text>}
        {error && <Text style={{ color: 'red' }}>{error}</Text>}
        {!loading && !error && (
          <View className="list">
            {teachers.map((t) => (
              <View className="list-item" key={t.id}>
                <Text>{t.name}</Text>
                {t.assignedClass && <Text className="badge">{t.assignedClass}</Text>}
                <View>
                  <Text>邮箱：{t.email || '-'}</Text>
                </View>
                <View>
                  <Text>状态：{t.status || '-'}</Text>
                </View>
              </View>
            ))}
            {teachers.length === 0 && <Text>暂无教师</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

import { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import { apiClient } from '@shared/services/apiClient';
import { Student } from '@shared/types';
import '../login/index.css';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.students.list();
        setStudents(data);
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
        <Text className="title">学生管理</Text>
        <Text className="subtitle">列表视图，可扩展为编辑/考勤</Text>
        {loading && <Text>加载中...</Text>}
        {error && <Text style={{ color: 'red' }}>{error}</Text>}
        {!loading && !error && (
          <View className="list">
            {students.map((s) => (
              <View className="list-item" key={s.id}>
                <Text>{s.name}</Text>
                {s.assignedClass && <Text className="badge">{s.assignedClass}</Text>}
                <View>
                  <Text>状态：{s.status || '-'}</Text>
                </View>
                <View>
                  <Text>监护人：{s.guardian || '-'}</Text>
                </View>
              </View>
            ))}
            {students.length === 0 && <Text>暂无学生</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

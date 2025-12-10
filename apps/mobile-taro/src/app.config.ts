export default defineAppConfig({
  pages: [
    'pages/common/login/index',
    'pages/common/profile/index',
    'pages/common/settings/index',
    'pages/teacher/index',
    'pages/student/index',
    'pages/admin/index',
  ],
  window: {
    navigationBarTitleText: 'Tsinglan',
    navigationBarBackgroundColor: '#ffffff',
    backgroundTextStyle: 'dark',
  },
  tabBar: {
    color: '#666',
    selectedColor: '#0b6cff',
    list: [
      { pagePath: 'pages/common/profile/index', text: '我' },
      { pagePath: 'pages/student/index', text: '学生' },
      { pagePath: 'pages/teacher/index', text: '老师' },
    ],
  },
});

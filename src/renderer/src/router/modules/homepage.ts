import { 
  HomeIcon,
  MovieClapperIcon,
  Tv1Icon,
  CloudIcon,
  ViewInArIcon,
  DataDisplayIcon,
  Setting1Icon,
  ExtensionIcon,
  PlayCircleStrokeIcon,
} from 'tdesign-icons-vue-next';

// 导入我们的新布局
import MainLayout from '@/layouts/MainLayout.vue';

export default [
  {
    path: '/',
    name: 'home',
    redirect: '/home',
    component: MainLayout,
    meta: {
      title: {
        zh_CN: '首页',
        en_US: 'Home',
      },
      icon: HomeIcon,
    },
    children: [
      {
        path: '/home',
        name: 'HomeIndex',
        component: () => import('@/pages/home/index.vue'),
      },
    ],
  },
  {
    path: '/film',
    name: 'film',
    redirect: '/film/index',
    component: MainLayout,
    meta: {
      title: {
        zh_CN: '影视',
        en_US: 'Film',
      },
      icon: MovieClapperIcon,
    },
    children: [
      {
        path: 'index',
        name: 'FilmIndex',
        component: () => import('@/pages/film/index.vue'),
      },
    ],
  },
  {
    path: '/iptv',
    name: 'iptv',
    redirect: '/iptv/index',
    component: MainLayout,
    meta: {
      title: {
        zh_CN: '电视',
        en_US: 'Iptv',
      },
      icon: Tv1Icon,
    },
    children: [
      {
        path: 'index',
        name: 'IptvIndex',
        component: () => import('@/pages/iptv/index.vue'),
      },
    ],
  },
  {
    path: '/drive',
    name: 'drive',
    redirect: '/drive/index',
    component: MainLayout,
    meta: {
      title: {
        zh_CN: '网盘',
        en_US: 'Drive',
      },
      icon: CloudIcon,
    },
    children: [
      {
        path: 'index',
        name: 'DriveIndex',
        component: () => import('@/pages/drive/index.vue'),
      },
    ],
  },
  {
    path: '/play',
    name: 'play',
    redirect: '/play/index',
    component: MainLayout,
    meta: {
      title: {
        zh_CN: '播放',
        en_US: 'Play',
      },
      icon: PlayCircleStrokeIcon,
    },
    children: [
      {
        path: 'index',
        name: 'PlayIndex',
        component: () => import('@/pages/play/index.vue'),
      },
    ],
  },
  {
    path: '/analyze',
    name: 'Analyze',
    redirect: '/analyze/index',
    component: MainLayout,
    meta: {
      title: {
        zh_CN: '解析',
        en_US: 'Analyze',
      },
      icon: ViewInArIcon,
    },
    children: [
      {
        path: 'index',
        name: 'AnalyzeIndex',
        component: () => import('@/pages/analyze/index.vue'),
      },
    ],
  },
  {
    path: '/chase',
    name: 'Chase',
    redirect: '/chase/index',
    component: MainLayout,
    meta: {
      title: {
        zh_CN: '过刻',
        en_US: 'Moment',
      },
      icon: DataDisplayIcon,
    },
    children: [
      {
        path: 'index',
        name: 'ChaseIndex',
        component: () => import('@/pages/chase/index.vue'),
      },
    ],
  },
  {
    path: '/setting',
    name: 'setting',
    component: MainLayout,
    redirect: '/setting/index',
    meta: {
      title: {
        zh_CN: '设置',
        en_US: 'Setting',
      },
      icon: Setting1Icon,
    },
    children: [
      {
        path: 'index',
        name: 'SettingIndex',
        component: () => import('@/pages/setting/index.vue'),
      },
    ],
  },
  {
    path: '/lab',
    name: 'lab',
    component: MainLayout,
    redirect: '/lab/index',
    meta: {
      title: {
        zh_CN: '实验室',
        en_US: 'Lab',
      },
      icon: ExtensionIcon,
    },
    children: [
      {
        path: 'index',
        name: 'LabIndex',
        component: () => import('@/pages/lab/index.vue'),
      },
    ],
  },
];
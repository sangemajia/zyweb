<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="logo">
        <h1>ZYWeb</h1>
      </div>
      <nav class="nav">
        <ul>
          <li v-for="item in navItems" :key="item.name" 
              :class="{ active: activeNav === item.name }"
              @click="setActiveNav(item.name)">
            <t-icon v-if="item.icon" :name="item.icon" />
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </nav>
      <div class="user-actions">
        <t-button theme="default" variant="text">
          <t-icon name="search" />
        </t-button>
        <t-button theme="default" variant="text">
          <t-icon name="setting" />
        </t-button>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 侧边栏 -->
      <aside class="sidebar" v-if="showSidebar">
        <div class="sidebar-content">
          <div class="sidebar-item" 
               v-for="item in sidebarItems" 
               :key="item.name"
               :class="{ active: activeSidebar === item.name }"
               @click="setActiveSidebar(item.name)">
            <t-icon v-if="item.icon" :name="item.icon" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </aside>

      <!-- 页面内容 -->
      <section class="content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  HomeIcon, 
  PlayIcon, 
  FilmIcon, 
  TvIcon, 
  CloudIcon, 
  SearchIcon, 
  ExperimentIcon,
  SettingIcon
} from 'tdesign-icons-vue-next';

const router = useRouter();

// 导航项
const navItems = [
  { name: 'home', label: '首页', icon: 'home' },
  { name: 'play', label: '播放', icon: 'play-circle' },
  { name: 'film', label: '电影', icon: 'film' },
  { name: 'iptv', label: '电视', icon: 'tv' },
  { name: 'drive', label: '网盘', icon: 'cloud' },
  { name: 'chase', label: '追刻', icon: 'heart' },
  { name: 'lab', label: '实验室', icon: 'experiment' },
  { name: 'setting', label: '设置', icon: 'setting' }
];

// 侧边栏项（根据当前导航动态变化）
const sidebarItems = computed(() => {
  switch(activeNav.value) {
    case 'film':
      return [
        { name: 'hot', label: '热门', icon: 'fire' },
        { name: 'recommend', label: '推荐', icon: 'recommend' },
        { name: 'category', label: '分类', icon: 'category' },
        { name: 'history', label: '历史', icon: 'time' }
      ];
    case 'iptv':
      return [
        { name: 'live', label: '直播', icon: 'live' },
        { name: 'channel', label: '频道', icon: 'tv' },
        { name: 'epg', label: '节目单', icon: 'calendar' },
        { name: 'favorite', label: '收藏', icon: 'heart' }
      ];
    case 'drive':
      return [
        { name: 'files', label: '文件', icon: 'file' },
        { name: 'shared', label: '分享', icon: 'share' },
        { name: 'recent', label: '最近', icon: 'time' },
        { name: 'trash', label: '回收站', icon: 'delete' }
      ];
    default:
      return [];
  }
});

// 活动状态
const activeNav = ref('home');
const activeSidebar = ref('hot');
const showSidebar = computed(() => 
  ['film', 'iptv', 'drive'].includes(activeNav.value)
);

// 设置活动导航
const setActiveNav = (name: string) => {
  activeNav.value = name;
  // 导航到对应页面
  router.push(`/${name}`);
};

// 设置活动侧边栏
const setActiveSidebar = (name: string) => {
  activeSidebar.value = name;
};
</script>

<style lang="less" scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;

  .logo {
    h1 {
      margin: 0;
      font-size: 20px;
      color: #45c58b;
    }
  }

  .nav {
    flex: 1;
    margin: 0 20px;

    ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;

      li {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        margin: 0 4px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;

        &:hover {
          background-color: #f0f0f0;
        }

        &.active {
          background-color: #45c58b;
          color: white;
        }

        .t-icon {
          margin-right: 4px;
        }
      }
    }
  }

  .user-actions {
    display: flex;
    gap: 8px;
  }
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;

  .sidebar-content {
    padding: 16px 0;

    .sidebar-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: #f5f5f5;
      }

      &.active {
        background-color: #e6f7ff;
        color: #1890ff;
        border-right: 3px solid #1890ff;
      }

      .t-icon {
        margin-right: 8px;
      }
    }
  }
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>
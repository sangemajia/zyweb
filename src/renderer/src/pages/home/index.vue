<template>
  <div class="home-page">
    <!-- banner区域 -->
    <div class="banner">
      <h2>欢迎使用 ZYWeb</h2>
      <p>一站式媒体娱乐平台</p>
    </div>

    <!-- 功能卡片区域 -->
    <div class="features">
      <h3 class="section-title">主要功能</h3>
      <div class="card-grid">
        <t-card 
          v-for="feature in features" 
          :key="feature.name"
          :title="feature.title"
          :description="feature.description"
          class="feature-card"
          @click="goToFeature(feature.route)"
        >
          <template #avatar>
            <div class="card-icon" :style="{ backgroundColor: feature.color }">
              <t-icon :name="feature.icon" :style="{ color: 'white' }" size="24px" />
            </div>
          </template>
        </t-card>
      </div>
    </div>

    <!-- 推荐内容 -->
    <div class="recommend-section">
      <div class="section-header">
        <h3 class="section-title">热门推荐</h3>
        <t-button theme="default" variant="text">查看更多</t-button>
      </div>
      <div class="media-grid">
        <MediaCard
          v-for="item in recommendItems"
          :key="item.id"
          :poster="item.poster"
          :title="item.title"
          :subtitle="item.subtitle"
          :meta="item.meta"
          size="large"
          @play="playItem(item)"
          @favorite="toggleFavorite(item)"
        />
      </div>
    </div>

    <!-- 最近观看 -->
    <div class="recent-section" v-if="recentItems.length > 0">
      <div class="section-header">
        <h3 class="section-title">最近观看</h3>
        <t-button theme="default" variant="text">查看更多</t-button>
      </div>
      <div class="recent-grid">
        <MediaCard
          v-for="item in recentItems"
          :key="item.id"
          :poster="item.poster"
          :title="item.title"
          :subtitle="item.subtitle"
          :meta="item.meta"
          @play="playItem(item)"
          @favorite="toggleFavorite(item)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { MediaCard } from '@/components/shared';

const router = useRouter();

// 功能特性
const features = [
  {
    name: 'play',
    title: '视频播放',
    description: '支持多种格式的视频播放，流畅体验',
    icon: 'play-circle',
    color: '#45c58b',
    route: '/play'
  },
  {
    name: 'film',
    title: '电影',
    description: '海量电影资源，高清画质',
    icon: 'film',
    color: '#ff6b6b',
    route: '/film'
  },
  {
    name: 'iptv',
    title: '电视直播',
    description: '实时电视直播，丰富频道',
    icon: 'tv',
    color: '#4d9be6',
    route: '/iptv'
  },
  {
    name: 'drive',
    title: '网盘',
    description: '个人云存储，随时随地访问',
    icon: 'cloud',
    color: '#9b59b6',
    route: '/drive'
  },
  {
    name: 'chase',
    title: '追刻',
    description: '追剧追番，精彩不停',
    icon: 'heart',
    color: '#e74c3c',
    route: '/chase'
  },
  {
    name: 'lab',
    title: '实验室',
    description: '新功能体验区',
    icon: 'experiment',
    color: '#f39c12',
    route: '/lab'
  }
];

// 推荐项目
const recommendItems = ref([
  {
    id: 1,
    title: '复仇者联盟',
    subtitle: '动作 / 科幻',
    poster: 'https://via.placeholder.com/200x300/45c58b/ffffff?text=Movie',
    meta: ['2012', '美国'],
    type: 'movie',
    isFavorite: false
  },
  {
    id: 2,
    title: '权力的游戏',
    subtitle: '剧情 / 奇幻',
    poster: 'https://via.placeholder.com/200x300/ff6b6b/ffffff?text=TV',
    meta: ['2011', '美国'],
    type: 'tv',
    isFavorite: true
  },
  {
    id: 3,
    title: '阿凡达',
    subtitle: '动作 / 科幻',
    poster: 'https://via.placeholder.com/200x300/4d9be6/ffffff?text=Movie',
    meta: ['2009', '美国'],
    type: 'movie',
    isFavorite: false
  },
  {
    id: 4,
    title: '流浪地球',
    subtitle: '科幻 / 冒险',
    poster: 'https://via.placeholder.com/200x300/9b59b6/ffffff?text=Movie',
    meta: ['2019', '中国'],
    type: 'movie',
    isFavorite: true
  }
]);

// 最近观看项目
const recentItems = ref([
  {
    id: 5,
    title: '新闻联播',
    subtitle: '2023-10-09',
    poster: 'https://via.placeholder.com/200x300/e74c3c/ffffff?text=Live',
    meta: ['央视', '直播'],
    type: 'live',
    isFavorite: false
  },
  {
    id: 6,
    title: '个人视频',
    subtitle: '旅行记录',
    poster: 'https://via.placeholder.com/200x300/f39c12/ffffff?text=Video',
    meta: ['2023', '个人'],
    type: 'personal',
    isFavorite: false
  },
  {
    id: 7,
    title: '纪录片',
    subtitle: '自然世界',
    poster: 'https://via.placeholder.com/200x300/1abc9c/ffffff?text=Doc',
    meta: ['2020', '纪录片'],
    type: 'documentary',
    isFavorite: true
  },
  {
    id: 8,
    title: '综艺',
    subtitle: '欢乐喜剧人',
    poster: 'https://via.placeholder.com/200x300/3498db/ffffff?text=Show',
    meta: ['2023', '综艺'],
    type: 'variety',
    isFavorite: false
  }
]);

// 跳转到功能页面
const goToFeature = (route: string) => {
  router.push(route);
};

// 播放项目
const playItem = (item: any) => {
  router.push(`/play/${item.id}`);
};

// 收藏/取消收藏
const toggleFavorite = (item: any) => {
  item.isFavorite = !item.isFavorite;
  // 这里可以添加收藏逻辑
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.home-page {
  max-width: 1400px;
  margin: 0 auto;

  .section-title {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 24px;
    font-weight: 700;
    color: var(--td-text-color-primary);
    
    &::before {
      content: "";
      border: 1px solid var(--td-brand-color);
      height: 0.6rem;
      border-radius: var(--td-radius-default);
      display: inline-block;
      opacity: 1;
      transition: all 0.4s ease-in-out;
      margin-right: var(--td-comp-paddingLR-xs);
    }
  }

  .banner {
    background: linear-gradient(135deg, #45c58b, #94dab2);
    color: white;
    padding: 60px 20px;
    border-radius: var(--td-radius-default);
    margin-bottom: 30px;
    text-align: center;

    h2 {
      font-size: 36px;
      margin: 0 0 16px 0;
    }

    p {
      font-size: 20px;
      margin: 0;
      opacity: 0.9;
    }
  }

  .features {
    margin-bottom: 40px;

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;

      .feature-card {
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border-radius: var(--td-radius-default);
        background: var(--td-bg-color-container);
        border: 1px solid var(--td-border-level-1-color);

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--td-shadow-3);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
        }
      }
    }
  }

  .recommend-section,
  .recent-section {
    margin-bottom: 40px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .media-grid,
    .recent-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 24px;
    }
  }
}

:root,
:root[theme-mode='light'] {
  --td-text-color-primary: rgba(37, 38, 43, 1);
  --td-border-level-1-color: #e7e7e7;
  --td-shadow-3: 0 6px 16px rgba(0, 0, 0, 0.08);
}

:root[theme-mode='dark'] {
  --td-text-color-primary: rgba(255, 255, 255, 1);
  --td-border-level-1-color: #383838;
  --td-shadow-3: 0 6px 16px rgba(0, 0, 0, 0.2);
}
</style>
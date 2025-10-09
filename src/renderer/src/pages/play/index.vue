<template>
  <div class="player-page">
    <!-- 播放器区域 -->
    <div class="player-container">
      <div class="video-placeholder">
        <t-icon name="play-circle" size="48px" />
        <p>视频播放区域</p>
      </div>
    </div>

    <!-- 视频信息 -->
    <div class="video-info">
      <h2>视频标题</h2>
      <div class="video-meta">
        <span class="meta-item">
          <t-icon name="browse" />
          <span>播放量: 10,000</span>
        </span>
        <span class="meta-item">
          <t-icon name="time" />
          <span>时长: 01:30:00</span>
        </span>
        <span class="meta-item">
          <t-icon name="calendar" />
          <span>发布: 2023-10-09</span>
        </span>
      </div>
      <div class="video-description">
        <p>这是视频的详细描述信息。在这里可以展示视频的内容介绍、演员信息、导演等详细内容。</p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="player-actions">
      <t-button theme="primary" variant="base">
        <t-icon name="heart" />
        <span>收藏</span>
      </t-button>
      <t-button theme="default" variant="base">
        <t-icon name="share" />
        <span>分享</span>
      </t-button>
      <t-button theme="default" variant="base">
        <t-icon name="download" />
        <span>下载</span>
      </t-button>
    </div>

    <!-- 选集区域 -->
    <div class="episode-section" v-if="episodes.length > 0">
      <h3>选集</h3>
      <div class="episode-list">
        <div 
          v-for="episode in episodes" 
          :key="episode.id"
          class="episode-item"
          :class="{ active: episode.id === currentEpisode }"
          @click="selectEpisode(episode)"
        >
          <div class="episode-poster">
            <img :src="episode.poster" :alt="episode.title" />
          </div>
          <div class="episode-info">
            <h4>{{ episode.title }}</h4>
            <p>{{ episode.duration }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 当前选集
const currentEpisode = ref(1);

// 选集列表
const episodes = ref([
  {
    id: 1,
    title: '第1集',
    duration: '45:00',
    poster: 'https://via.placeholder.com/120x80/45c58b/ffffff?text=E1'
  },
  {
    id: 2,
    title: '第2集',
    duration: '42:30',
    poster: 'https://via.placeholder.com/120x80/ff6b6b/ffffff?text=E2'
  },
  {
    id: 3,
    title: '第3集',
    duration: '47:15',
    poster: 'https://via.placeholder.com/120x80/4d9be6/ffffff?text=E3'
  },
  {
    id: 4,
    title: '第4集',
    duration: '44:20',
    poster: 'https://via.placeholder.com/120x80/9b59b6/ffffff?text=E4'
  }
]);

// 选择选集
const selectEpisode = (episode: any) => {
  currentEpisode.value = episode.id;
  // 这里可以添加播放逻辑
};
</script>

<style lang="less" scoped>
.player-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .player-container {
    background-color: #000;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;

    .video-placeholder {
      height: 500px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.7);

      .t-icon {
        margin-bottom: 16px;
      }
    }
  }

  .video-info {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h2 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 24px;
    }

    .video-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #666;
        font-size: 14px;
      }
    }

    .video-description {
      color: #333;
      line-height: 1.6;
    }
  }

  .player-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 30px;

    .t-button {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .episode-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h3 {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 20px;
    }

    .episode-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;

      .episode-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid #e0e0e0;

        &:hover {
          border-color: #45c58b;
          box-shadow: 0 4px 8px rgba(69, 197, 139, 0.2);
        }

        &.active {
          border-color: #45c58b;
          background-color: rgba(69, 197, 139, 0.05);
        }

        .episode-poster {
          img {
            width: 120px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
          }
        }

        .episode-info {
          flex: 1;

          h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
          }

          p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
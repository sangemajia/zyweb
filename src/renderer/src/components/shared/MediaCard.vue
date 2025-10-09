<template>
  <div class="media-card" :class="{ 'media-card--large': size === 'large' }">
    <div class="media-card__poster">
      <img :src="poster" :alt="title" />
      <div class="media-card__overlay" v-if="showOverlay">
        <div class="media-card__actions">
          <t-button 
            v-if="showPlayButton" 
            shape="circle" 
            theme="primary" 
            @click.stop="onPlay"
          >
            <t-icon name="play" />
          </t-button>
          <t-button 
            v-if="showFavoriteButton" 
            shape="circle" 
            theme="default" 
            @click.stop="onFavorite"
          >
            <t-icon :name="isFavorite ? 'heart-filled' : 'heart'" />
          </t-button>
        </div>
      </div>
    </div>
    <div class="media-card__info">
      <h3 class="media-card__title">{{ title }}</h3>
      <p class="media-card__subtitle">{{ subtitle }}</p>
      <div class="media-card__meta" v-if="meta">
        <span v-for="(item, index) in meta" :key="index" class="meta-item">
          {{ item }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  poster: string;
  title: string;
  subtitle?: string;
  meta?: string[];
  size?: 'normal' | 'large';
  showOverlay?: boolean;
  showPlayButton?: boolean;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  meta: () => [],
  size: 'normal',
  showOverlay: true,
  showPlayButton: true,
  showFavoriteButton: true,
  isFavorite: false
});

const emit = defineEmits<{
  (e: 'play'): void;
  (e: 'favorite'): void;
}>();

const onPlay = () => {
  emit('play');
};

const onFavorite = () => {
  emit('favorite');
};
</script>

<style lang="less" scoped>
.media-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &__poster {
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      display: block;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.05);
    }
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    .media-card:hover & {
      opacity: 1;
    }

    .media-card__actions {
      display: flex;
      gap: 12px;
    }
  }

  &__info {
    padding: 16px;
  }

  &__title {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__subtitle {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    color: #999;

    .meta-item {
      &:not(:last-child)::after {
        content: "·";
        margin-left: 4px;
      }
    }
  }

  &--large {
    .media-card__poster {
      img {
        aspect-ratio: 2/3;
      }
    }

    .media-card__title {
      font-size: 18px;
    }
  }
}
</style>
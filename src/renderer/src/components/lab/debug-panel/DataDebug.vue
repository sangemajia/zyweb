<template>
  <div class="data_debug">
    <div class="item">
      <DebugInitButton
        :title="$t('pages.lab.jsEdit.action.init')"
        :status-label="$t('pages.lab.jsEdit.action.status')"
        :is-auto-mode="isAutoMode"
        :auto-text="$t('pages.lab.jsEdit.action.auto')"
        :manual-text="$t('pages.lab.jsEdit.action.manual')"
        @click="handleInitDebug"
        @toggle-auto-mode="toggleAutoMode"
      />
      <DebugButton @click="handleLogDebug">
        {{ $t('pages.lab.jsEdit.action.log') }}
      </DebugButton>
    </div>
    <div class="item">
      <DebugButton @click="handleHomeDebug">
        {{ $t('pages.lab.jsEdit.action.classify') }}
      </DebugButton>
      <DebugButton @click="handleHomeVodDebug">
        {{ $t('pages.lab.jsEdit.action.home') }}
      </DebugButton>
    </div>
    <div class="item">
      <t-input
        v-model="category.t"
        :label="$t('pages.lab.jsEdit.rule.t')"
        :placeholder="$t('pages.setting.placeholder.general')"
        class="input w-33-30%"
      />
      <t-input
        v-model="category.f"
        :label="$t('pages.lab.jsEdit.rule.f')"
        :placeholder="$t('pages.setting.placeholder.general')"
        class="input w-33-40%"
      />
      <t-input-number
        theme="column"
        :min="0"
        v-model="category.pg"
        :label="$t('pages.lab.jsEdit.rule.pg')"
        :placeholder="$t('pages.setting.placeholder.general')"
        class="input w-33-30%"
      />
      <DebugButton @click="handleCategoryDebug">
        {{ $t('pages.lab.jsEdit.action.list') }}
      </DebugButton>
    </div>
    <div class="item">
      <t-input
        v-model="detail.ids"
        :label="$t('pages.lab.jsEdit.rule.ids')"
        :placeholder="$t('pages.setting.placeholder.general')"
        class="input w-100%"
      />
      <DebugButton @click="handleDetailDebug">
        {{ $t('pages.lab.jsEdit.action.detail') }}
      </DebugButton>
    </div>
    <div class="item">
      <t-input
        v-model="search.wd"
        :label="$t('pages.lab.jsEdit.rule.wd')"
        :placeholder="$t('pages.setting.placeholder.general')"
        class="input w-50-70%"
      />
      <t-input-number
        theme="column"
        :min="0"
        v-model="search.pg"
        :label="$t('pages.lab.jsEdit.rule.pg')"
        :placeholder="$t('pages.setting.placeholder.general')"
        class="input w-50-30%"
      />
      <DebugButton @click="handleSearchDebug">
        {{ $t('pages.lab.jsEdit.action.search') }}
      </DebugButton>
    </div>
    <div class="item">
      <t-input
        v-model="play.flag"
        :label="$t('pages.lab.jsEdit.rule.flag')"
        :placeholder="$t('pages.setting.placeholder.general')"
        class="input w-50-30%"
      />
      <t-input
        v-model="play.play"
        :label="$t('pages.lab.jsEdit.rule.play')"
        :placeholder="$t('pages.setting.placeholder.general')"
        class="input w-50-70%"
      />
      <DebugButton @click="handlePlayDebug">
        {{ $t('pages.lab.jsEdit.action.play') }}
      </DebugButton>
    </div>
    <div class="item">
      <t-input
        v-model="proxy.url"
        :label="$t('pages.lab.jsEdit.rule.url')"
        :placeholder="$t('pages.setting.placeholder.general')"
        class="input w-100%"
      />
      <DebugButton @click="handleProxyDebug">
        {{ $t('pages.lab.jsEdit.action.proxy') }}
      </DebugButton>
    </div>
    <div class="item">
      <t-textarea
        v-model="proxy.upload"
        :placeholder="$t('pages.lab.jsEdit.placeholder.proxyUpload')"
        :autosize="{ minRows: 3, maxRows: 5 }"
        class="input proxy-upload-textarea"
      />
      <DebugButton class="proxy-upload-btn" @click="handleProxyUploadDebug">
        {{ $t('pages.lab.jsEdit.action.proxyUpload') }}
      </DebugButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { GestureClickIcon } from 'tdesign-icons-vue-next';
import DebugButton from './components/DebugButton.vue';
import DebugInitButton from './components/DebugInitButton.vue';

const props = defineProps({
  isAutoMode: {
    type: Boolean,
    default: false,
  },
  category: {
    type: Object,
    default: () => ({}),
  },
  detail: {
    type: Object,
    default: () => ({}),
  },
  search: {
    type: Object,
    default: () => ({}),
  },
  play: {
    type: Object,
    default: () => ({}),
  },
  proxy: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits([
  'init-debug',
  'log-debug',
  'home-debug',
  'home-vod-debug',
  'category-debug',
  'detail-debug',
  'search-debug',
  'play-debug',
  'proxy-debug',
  'proxy-upload-debug',
  'toggle-auto-mode',
]);

const handleInitDebug = () => {
  emit('init-debug');
};

const handleLogDebug = () => {
  emit('log-debug');
};

const handleHomeDebug = () => {
  emit('home-debug');
};

const handleHomeVodDebug = () => {
  emit('home-vod-debug');
};

const handleCategoryDebug = () => {
  emit('category-debug');
};

const handleDetailDebug = () => {
  emit('detail-debug');
};

const handleSearchDebug = () => {
  emit('search-debug');
};

const handlePlayDebug = () => {
  emit('play-debug');
};

const handleProxyDebug = () => {
  emit('proxy-debug');
};

const handleProxyUploadDebug = () => {
  emit('proxy-upload-debug');
};

const toggleAutoMode = () => {
  emit('toggle-auto-mode');
};
</script>

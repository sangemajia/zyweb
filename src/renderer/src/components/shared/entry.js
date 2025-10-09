import { createApp } from 'vue';
import SharedButton from './SharedButton.vue';
import SharedCard from './SharedCard.vue';
import SimpleShared from './SimpleShared.vue';

// 创建一个虚拟的应用来确保组件被正确打包
const app = createApp({
  template: `
    <div>
      <shared-button>Button</shared-button>
      <shared-card>
        <template #header>Header</template>
        <div>Content</div>
        <template #footer>Footer</template>
      </shared-card>
      <simple-shared />
    </div>
  `,
  components: {
    SharedButton,
    SharedCard,
    SimpleShared
  }
});

// 导出所有共享组件
export { 
  SharedButton,
  SharedCard,
  SimpleShared
};

// 默认导出
export default {
  SharedButton,
  SharedCard,
  SimpleShared
};
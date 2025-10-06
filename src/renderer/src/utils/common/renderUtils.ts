import lazyImg from '@/assets/lazy.png';

// 公共的renderError函数
export const renderError = () => {
  return h('div', { class: 'renderIcon', style: 'width: 100%;' }, [
    h('img', { src: lazyImg, style: 'width: 100%; object-fit: cover;' }),
  ]);
};

// 公共的renderLoading函数
export const renderLoading = () => {
  return h('div', { class: 'renderIcon', style: 'width: 100%;' }, [
    h('img', { src: lazyImg, style: 'width: 100%; object-fit: cover;' }),
  ]);
};

// 带高度参数的renderError函数
export const renderErrorWithHeight = (height: string = '100%') => {
  return h('div', { class: 'renderIcon', style: `height: ${height}` }, [
    h('img', { src: lazyImg, style: `height: ${height}; object-fit: cover;` }),
  ]);
};

// 带高度参数的renderLoading函数
export const renderLoadingWithHeight = (height: string = '100%') => {
  return h('div', { class: 'renderIcon', style: `height: ${height}` }, [
    h('img', { src: lazyImg, style: `height: ${height}; object-fit: cover;` }),
  ]);
};

import { createApp } from 'petite-vue';
import './style.css'

window.addEventListener('load', () => {
  onReady();

  async function onReady(){
    const petiteVueComponents: [string, () => any, string][] = [
      ['[data-vue-component-page-section]', () => import('./scripts/PageSection'), 'PageSection'],
      ['[data-vue-component-webgl-canvas]', () => import('./scripts/WebglCanvas'), 'WebglCanvas'],
    ]

    const componentsSet = new Set<{ name: string, fn: () => { default(): void}}>();
    petiteVueComponents.forEach(([tag, fn, name]) => {
      // @ts-ignore
      const $els = [...document.querySelectorAll(tag)];
      if ($els.length < 1) {
        return;
      }
      componentsSet.add({name, fn});
    })


    const components: {[key: string]: object} = {}
    for (const { name, fn } of componentsSet.values()) {
      components[name] = (await fn()).default;
    }
    createApp(components).mount();
  }
});

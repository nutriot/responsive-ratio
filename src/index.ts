
import { create } from 'nano-css';
import {addon as addonNesting} from 'nano-css/addon/nesting'

const defaultOptions: ResponsiveRatioOptions = {
  injectStyles: true,
  selectors: 'iframe',
  wrapperClass: 'responsive-ratio'
}

/**
 * Injects default styles
 * @param classesString
 */
function injectStylesheet(options: ResponsiveRatioOptions): void {
  const {selectors, wrapperClass} = options;

  const nano = create();
  addonNesting(nano);

  nano.put(`.${wrapperClass}`, {
    height: 0,
    position: 'relative',

    [selectors]: {
      border: 0,
      height: '100%',
      left: 0,
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      width: '100%'
    }
  });
}

/**
 * Resizes element reponsively according to its width and height
 * attributes or inline styles
 * @param customOptions
 */
function responsiveRatio(customOptions = {}): void {
  const options = {
    ...defaultOptions,
    ...customOptions
  };

  if (options.injectStyles) injectStylesheet(options);

  const iframes = <NodeListOf<HTMLCanvasElement | HTMLEmbedElement | HTMLIFrameElement | HTMLImageElement | HTMLVideoElement>>document.querySelectorAll(options.selectors);

  Array.from(iframes).map(iframe => {
      const width = parseInt(String(iframe.width)) || parseInt(iframe.style.width);
      const height = parseInt(String(iframe.height)) || parseInt(iframe.style.height);

      console.log({width, height})
      if (width || height) {
        const ratio = Math.round(height / (width / 100) * 100) / 100;
        const wrapper = document.createElement('div');

          if (options.wrapperClass) wrapper.classList.add(options.wrapperClass);
          wrapper.style.paddingBottom = `${ratio}%`;

          if (iframe.parentNode) {
            iframe.parentNode.appendChild(wrapper)
            wrapper.appendChild(iframe)
          }
      }

      return null;
  });
}

export {
  responsiveRatio
}

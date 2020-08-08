import { create } from 'nano-css';

var addon = function (renderer) {
    renderer.selector = function (parentSelectors, selector) {
        var parents = parentSelectors.split(',');
        var result = [];
        var selectors = selector.split(',');
        var len1 = parents.length;
        var len2 = selectors.length;
        var i, j, sel, pos, parent, replacedSelector;

        for (i = 0; i < len2; i++) {
            sel = selectors[i];
            pos = sel.indexOf('&');

            if (pos > -1) {
                for (j = 0; j < len1; j++) {
                    parent = parents[j];
                    replacedSelector = sel.replace(/&/g, parent);
                    result.push(replacedSelector);
                }
            } else {
                for (j = 0; j < len1; j++) {
                    parent = parents[j];

                    if (parent) {
                        result.push(parent + ' ' + sel);
                    } else {
                        result.push(sel);
                    }
                }
            }
        }

        return result.join(',');
    };
};

const defaultOptions = {
    injectStyles: true,
    selectors: 'iframe',
    wrapperClass: 'responsive-ratio'
};
/**
 * Injects default styles
 * @param classesString
 */
function injectStylesheet(options) {
    const { selectors, wrapperClass } = options;
    const nano = create();
    addon(nano);
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
 * @returns Array
 */
function responsiveRatio(customOptions = {}) {
    const options = Object.assign(Object.assign({}, defaultOptions), customOptions);
    if (options.injectStyles)
        injectStylesheet(options);
    const iframes = document.querySelectorAll(options.selectors);
    return Array.from(iframes).map(iframe => {
        var _a, _b;
        if (String(iframe.width).endsWith('%') || ((_b = (_a = iframe.style) === null || _a === void 0 ? void 0 : _a.width) === null || _b === void 0 ? void 0 : _b.endsWith('%')))
            return null;
        const width = parseInt(String(iframe.width)) || parseInt(iframe.style.width);
        const height = parseInt(String(iframe.height)) || parseInt(iframe.style.height);
        if (width || height) {
            const ratio = Math.round(height / (width / 100) * 100) / 100;
            const wrapper = document.createElement('div');
            if (options.wrapperClass)
                wrapper.classList.add(options.wrapperClass);
            wrapper.style.paddingBottom = `${ratio}%`;
            if (iframe.style.width)
                iframe.style.width = null;
            if (iframe.style.height)
                iframe.style.height = null;
            if (iframe.parentNode) {
                iframe.parentNode.appendChild(wrapper);
                wrapper.appendChild(iframe);
                return wrapper;
            }
        }
        return null;
    });
}

export { responsiveRatio };

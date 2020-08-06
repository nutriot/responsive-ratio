'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var KEBAB_REGEX = /[A-Z]/g;

var hash = function (str) {
    var hash = 5381, i = str.length;

    while (i) hash = (hash * 33) ^ str.charCodeAt(--i);

    return '_' + (hash >>> 0).toString(36);
};

var create = function (config) {
    config = config || {};
    var assign = config.assign || Object.assign;
    var client = typeof window === 'object';

    // Check if we are really in browser environment.
    if (process.env.NODE_ENV !== 'production') {
        if (client) {
            if ((typeof document !== 'object') || !document.getElementsByTagName('HTML')) {
                console.error(
                    'nano-css detected browser environment because of "window" global, but ' +
                    '"document" global seems to be defective.'
                );
            }
        }
    }

    var renderer = assign({
        raw: '',
        pfx: '_',
        client: client,
        assign: assign,
        stringify: JSON.stringify,
        kebab: function (prop) {
            return prop.replace(KEBAB_REGEX, '-$&').toLowerCase();
        },
        decl: function (key, value) {
            key = renderer.kebab(key);
            return key + ':' + value + ';';
        },
        hash: function (obj) {
            return hash(renderer.stringify(obj));
        },
        selector: function (parent, selector) {
            return parent + (selector[0] === ':' ? ''  : ' ') + selector;
        },
        putRaw: function (rawCssRule) {
            renderer.raw += rawCssRule;
        },
    }, config);

    if (renderer.client) {
        if (!renderer.sh)
            document.head.appendChild(renderer.sh = document.createElement('style'));

        if (process.env.NODE_ENV !== 'production') {
            renderer.sh.setAttribute('data-nano-css-dev', '');

            // Test style sheet used in DEV mode to test if .insetRule() would throw.
            renderer.shTest = document.createElement('style');
            renderer.shTest.setAttribute('data-nano-css-dev-tests', '');
            document.head.appendChild(renderer.shTest);
        }

        renderer.putRaw = function (rawCssRule) {
            // .insertRule() is faster than .appendChild(), that's why we use it in PROD.
            // But CSS injected using .insertRule() is not displayed in Chrome Devtools,
            // that's why we use .appendChild in DEV.
            if (process.env.NODE_ENV === 'production') {
                var sheet = renderer.sh.sheet;

                // Unknown pseudo-selectors will throw, this try/catch swallows all errors.
                try {
                    sheet.insertRule(rawCssRule, sheet.cssRules.length);
                // eslint-disable-next-line no-empty
                } catch (error) {}
            } else {
                // Test if .insertRule() works in dev mode. Unknown pseudo-selectors will throw when
                // .insertRule() is used, but .appendChild() will not throw.
                try {
                    renderer.shTest.sheet.insertRule(rawCssRule, renderer.shTest.sheet.cssRules.length);
                } catch (error) {
                    if (config.verbose) {
                        console.error(error);
                    }
                }

                // Insert pretty-printed CSS for dev mode.
                renderer.sh.appendChild(document.createTextNode(rawCssRule));
            }
        };
    }

    renderer.put = function (selector, decls, atrule) {
        var str = '';
        var prop, value;
        var postponed = [];

        for (prop in decls) {
            value = decls[prop];

            if ((value instanceof Object) && !(value instanceof Array)) {
                postponed.push(prop);
            } else {
                if ((process.env.NODE_ENV !== 'production') && !renderer.sourcemaps) {
                    str += '    ' + renderer.decl(prop, value, selector, atrule) + '\n';
                } else {
                    str += renderer.decl(prop, value, selector, atrule);
                }
            }
        }

        if (str) {
            if ((process.env.NODE_ENV !== 'production') && !renderer.sourcemaps) {
                str = '\n' + selector + ' {\n' + str + '}\n';
            } else {
                str = selector + '{' + str + '}';
            }
            renderer.putRaw(atrule ? atrule + '{' + str + '}' : str);
        }

        for (var i = 0; i < postponed.length; i++) {
            prop = postponed[i];

            if (prop[0] === "@" && prop !== "@font-face") {
                renderer.putAt(selector, decls[prop], prop);
            } else {
                renderer.put(renderer.selector(selector, prop), decls[prop], atrule);
            }
        }
    };

    renderer.putAt = renderer.put;

    return renderer;
};

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
 */
function responsiveRatio(customOptions = {}) {
    const options = Object.assign(Object.assign({}, defaultOptions), customOptions);
    if (options.injectStyles)
        injectStylesheet(options);
    const iframes = document.querySelectorAll(options.selectors);
    Array.from(iframes).map(iframe => {
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
            }
        }
    });
}

exports.responsiveRatio = responsiveRatio;

# @nutriot/responsive-ratio

> Library to adjust iFrame aspect-ratios reponsively, written in TypeScript

[![npm](https://flat.badgen.net/npm/license/@nutriot/responsive-ratio)](https://www.npmjs.org/package/@nutriot/responsive-ratio)
[![npm](https://flat.badgen.net/npm/v/@nutriot/responsive-ratio)](https://www.npmjs.org/package/@nutriot/responsive-ratio)
[![CircleCI](https://flat.badgen.net/circleci/github/nutriot/responsive-ratio)](https://circleci.com/gh/nutriot/responsive-ratio)

## Installation

`npm install --save @nutriot/responsive-ratio`

## Usage

Import and initialize the module

```ts
import { responsiveRatio } from '@nutriot/responsive-ratio';

window.addEventListener('DOMContentLoaded', event => {
  const options = {
    selectors: 'iframe, video'
  };

  responsiveRatio(options);
});
```

### Options

#### `injectStyles`

Type: `boolean`  
Default: `true`  

Specifies whether to inject default styles

#### `selectors`

Type: `string`  
Default: `iframe`  

CSS selector for elements that should be resized

#### `wrapperClass`

Type: `string`  
Default: `responsive-ratio` 

Specifies the wrapper elements default class name

## License

This work is licensed under [The MIT License](https://opensource.org/licenses/MIT)

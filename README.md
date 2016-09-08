# Selecty [![npm](https://img.shields.io/npm/v/alerty.svg?style=flat-square)](https://www.npmjs.org/package/selecty)

A simple, light and pretty pure javascript for developing `<select>` with customized style which is following Google's Material Design guidelines. Obviously, no need other library.
 
## Usage

### 1. Download Code
you can install selecty with npm

```bash
npm install selecty
```

or with bower
```bash
bower install selecty
```

or download the package manually

### 2. Include

include JavaScript and CSS files in your HTML

```html
<script src="dist/selecty.min.js"></script>
<link rel="stylesheet" type="text/css" href="dist/selecty.min.css">
```

### 3. Use
> pure javascript

```js
var a = new selecty('#id');
```
or
```js
var a = new selecty(document.getElementById('ID'));
```


> jQuery

```js
$('#ID').selecty(options);
```

## Examples
you can run example local with gulp if node has been installed:

```bash
cd selecty
npm install
gulp
```
or test it on [jsfiddle](https://jsfiddle.net/1ap1v4uc/)

## Options
|name|type|default|description|
|----|----|-------|-----------|
|separator|string|', '|separate the selected options with this separator if `<select>` is multiple|

## Browser support
Selecty is tested and works in:
- IE8+
- Latest Stable: Firefox, Chrome, Safari, Edge
- Android 4.0 and Latest
- iOS7 and Latest

## Contributing
If you have good ideas or suggestions, please issue or pull request

## License
Selecty is licensed under [MIT](http://http://opensource.org/licenses/MIT "MIT")
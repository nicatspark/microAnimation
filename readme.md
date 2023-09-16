# Micro Animation

A light wrapper around the Web Animation API to swiftly create awaitable micro animations from JS.

Often times using transitions in the CSS creates constant custom code for every animation,
prone to timing problem between CSS timing and JS. By moving the transitions from CSS to JS
the result is both cleaner code, less code and perfect timing as a result.

## Install

`npm install @foundit/microAnimation`

## Usage

Minimum is to pass an element and a transformEnd object containing the properties you want to animate to.
Transform start is picked up from the element's computed style.

```js
async function close() {
  await microAnimation({
    element,
    duration: 300,
    transformEnd: { opacity: 0 },
  })
  removeElement()
}
```

For a keyframe animation, pass an array of transformEnd objects.
The offset property is optional, and defaults to 0. In the example below,
the background color will change to orangered at 70% of the animation.

```js
...
await microAnimation({
  element,
  duration: 1000,
  easing: 'ease-out',
  transformEnd: [{
     backgroundColor: 'orangered',
     opacity: 1, offset: 0.7
   }, {
     transform: "translateX(0)",
     backgroundColor: 'blue'
   }]
 ...
```

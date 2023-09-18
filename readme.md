# Micro Animation

A light shim over the Web Animation API to swiftly create awaitable micro animations from JS.

## Why

Often times using transitions in the CSS creates constant custom code for every animation,
prone to timing problem between CSS timing and JS. By moving the transitions from CSS to JS
the result is both cleaner code, less code and perfect timing as a result.

The Web Animation API is powerfull but clunky. The microAnimation lib is all you need for your
micro animation one liners.

## Install

`npm install @foundit/micro-animation`

## Usage

### import

`import { microAnimation } from '@foundit/micro-animation'`

### Executing an animation

Minimum is to pass an element and a transformEnd object containing the properties you want to animate to.
Transform start is picked up from the element's computed style.

```js
async function closeModal() {
  await microAnimation({
    element: myModal,
    duration: 300,
    transformEnd: { opacity: 0 },
  })
  removeElement()
}
```

### Animating with several keyframes

For a keyframe animation, pass an array of keyframe objects.
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
})
 ...
```

### Start state

microAnimation does not accept a start state, instead it takes the computed styles. In most
cases this is desired to avoid jankiness. In case you need to put a start state you'd need
to do something similar to:

```js
async function openModal() {
  // set start style state
  Object.assign(myModalElement.style, {
    translate: '0 10px',
    opacity: 0,
  })
  // wait a js cycle to let it render
  await new Promise((resolve) => setTimeout(resolve, 0))
  // run you micro animation
  void microAnimation({
    element: myModal,
    duration: 300,
    easing: 'ease-in',
    transformEnd: { opacity: 0 },
  })
}
```

Use `void` instead of `await` if you don't need to wait for the promise to resolve. Handy if you
need to execute it directly inside a useEffect in React where you can't have await. It is also
thenable should you prefer that to await.

### microAnimation arguments

- `element` - a DOM element or ref element if your using React
- `duration` - duration of the total nimation in ms
- `easing` - any of the easings available in CSS, i.e 'ease-in', 'linear', etc
- `transformEnd` - a object or array of keyframe objects containg animatable CSS properties in camel case
- `fill` - same function as fillMode in CSS, defaults to 'forward'

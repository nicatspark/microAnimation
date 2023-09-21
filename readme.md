# Micro Animation Helper

A framework agnostic light shim over the Web Animation API to swiftly create awaitable micro animations from JS.

## Why

Often times using transitions in the CSS creates constant custom CSS code for every animation, hard to parse and prone to timing problem between CSS timing and JS. By moving the transitions from CSS to JS the result is both cleaner and less code and in perfect sync with other JS events as a result. It is obvious that micro animation belongs in JavaScript and not in CSS. Specially when there is a need to chain events.

The Web Animation API is powerfull but clunky. The microAnimation lib is all you need for your micro animation one liners.

## Install

`npm install @foundit/micro-animation`

## Usage

### import

`import { microAnimation } from '@foundit/micro-animation'`

### Executing an animation

Minimum is to pass an element and a transformEnd object containing the properties you want to animate to. Animation start state is then picked up from the element's computed style. There is a possibility to set an initial state by `transitionInit` argument but unless there is a special reason avoid it to avoid jankiness when the animation is canceled and restarted in quick succession.

```js
async function closeModal() {
  await microAnimation({
    element: myModalElement,
    duration: 300,
    transformEnd: { opacity: 0 },
  })
  removeElement()
}
```

### Animating with multiple keyframes

The underlying Web Animation API blurs the differences between transitions and keyframe animation. So we do too :) For a keyframe animation, pass an array of keyframe objects. The offset property is optional, and defaults to 0. In the example below, the background color will change to orangered at 70% of the animation. The keyframes will equally share the duration if the middle keyframe(s) `offset` key is omitted.

```js
...
await microAnimation({
  element: myAnimatedElement,
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

### Micro animation with a set start state (usually not needed)

In general you should not use a initial state. Having a start state might cause jankiness when the animation is interupted/restarted in quick succession. Which normally is not a problem since the start state is created dynamically from the computed style. But if you would really need a set start state you can use the `transitionInit` property.

```js
async function openModal() {
  // create and execute a micro animation with a set start style state
  // run you micro animation
  void microAnimation({
    element: myModal,
    duration: 300,
    easing: 'ease-in',
    transitionInit: {
      translate: '0 10px',
      opacity: 0,
    },
    transformEnd: { translate: '0 0'; opacity: 0 },
  })
}
```

Use `void` instead of `await` if you don't need to wait for the promise to resolve. Handy if you need to execute it directly inside a useEffect in React where you can't have await. It is also _thenable_ should you prefer that to await.

### microAnimation arguments

- `duration` - duration of the total nimation in ms
- `easing` - any of the easings available in CSS, i.e 'ease-in', 'linear', etc
- <span style="font-weight:bold">`element`</span><span style="color:red;font-weight:bold">\*</span> - a DOM element or ref element if your using React
- `fill` - same function as fillMode in CSS, defaults to 'forward'
- <span style="font-weight:bold">`transformEnd`</span><span style="color:red;font-weight:bold">\*</span> - a keyframe object or array of keyframe objects containg animatable CSS properties in camel case
- `transformInit` - Keyframe object with CSS properties to start the animation from. Recommended to omit to use computed style as starting point.

### The keyframe object

A keframe object is an object with camel cased css properties as keys with values.

### Typescript types

This little helper is built in Typescript. `MicroAnimationProps`, `TargetElement` are exported. The keyframe object is a `Keyframe` type.

---

Links: [NPM](https://www.npmjs.com/package/@foundit/micro-animations) | [Github Issues](https://github.com/nicatspark/microAnimation/issues) | [Web Animation API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) | [Codepen](https://codepen.io/nicolashervy/pen/xxmwewE)

Author: [nicolas@hervy.se](mailto:nicolas@hervy.se)

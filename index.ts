import {
  toLinear,
  easingFactory,
  EasingFactoryProduct,
} from '@foundit/motion-blur'

// =================================================================================================
// INTERFACE
// =================================================================================================

interface TargetElement extends Element {
  currentAnimation?: Animation
}

interface MicroAnimationProps {
  /** Optional -  takes 'replace', 'add' or 'accumulate'. See https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/composite for explanation. */
  composite?: KeyframeAnimationOptions['composite']

  /** Optional - Output values to console.log */
  debug?: boolean

  /** Optional - Duration in ms. Default to 300ms */
  duration?: number

  /** Optional - CSS easing. Default to 'linear' */
  easing?:
    | KeyframeAnimationOptions['easing']
    | `linear(${string})`
    | (string & {})

  /** Mandatory - The element to animate. */
  element: TargetElement | TargetElement[]

  /** Optional - CSS fillmode, defaults to 'forwards'. */
  fill?: FillMode

  /** Optional - Accepts a string with your pseudo element. E.g '::after' */
  pseudoElement?: KeyframeAnimationOptions['pseudoElement']

  /** Mandatory - Keyframe object (or array of keyframe objects if it consit of multiple keyframe) with CSS properties to animate to. */
  transformEnd: Keyframe | Keyframe[]

  /** Optional - Keyframe object with CSS properties to start the animation from. Omit to use computed style as starting point. */
  transformInit?: Keyframe
}

// =================================================================================================
// IMPLEMENTATION
// =================================================================================================

/**
 * Minimum arguments to pass in the argument object is ´element´ and a ´transformEnd´ keyframe object.
 * Transform start is then picked up from the element's computed style.
 *
 * async function close() {
 *   await microAnimation({
 *     element,
 *     duration: 300,
 *     transformEnd: { opacity: 0 },
 *   });
 *   removeElement()
 * }
 *
 * For a multiple keyframe animation, pass an array of transformEnd objects. Again, the first keyframe
 * will be picked up from the element's computed style. The offset property is optional, and is used
 * to split transitions between keyframes, defaults to splitting equally between frames.
 * In the example below, the background color will change to orangered at 70% of the animation.
 *
 * ...
 * await microAnimation({
 *   element,
 *   duration: 300,
 *   transformEnd: [{
 *      backgroundColor: 'orangered',
 *      opacity: 1, offset: 0.7
 *    }, {
 *      transform: "translateX(0)",
 *      backgroundColor: 'blue'
 *    }]
 *  ...
 *
 * Using toLinear for custom easing from easing.net
 *
 * microAnimation({
 *  element: el,
 *  easing: toLinear(easingFactory().easeInOutBounce),
 *  duration: 400,
 *  transformEnd: {translate: '0 200px'},
 * })
 */
function microAnimation({
  composite,
  debug = false,
  duration = 300,
  easing = 'linear',
  element: element,
  fill = 'forwards',
  transformEnd,
  transformInit,
  pseudoElement,
}: MicroAnimationProps) {
  const elementArr: TargetElement[] = Array.isArray(element)
    ? element
    : [element]
  if (elementArr.filter(Boolean).length === 0) {
    const err = 'No element passed to microAnimation'
    throw new Error(err)
  }
  const transformEndArr = Array.isArray(transformEnd)
    ? transformEnd
    : [transformEnd]

  // Extract the properties to animate from the transformEnd object(s)
  const targetProperties = [
    ...new Set(
      transformEndArr.reduce((acc, transformObj: Keyframe) => {
        return [...acc, ...Object.keys(transformObj)] as (keyof Keyframe)[]
      }, [] as (keyof Keyframe)[])
    ),
  ]
  debuglog('targetProps', targetProperties)

  const tasks: Promise<AnimationPlaybackEvent>[] = []

  elementArr.forEach((el) => {
    const task = new Promise<AnimationPlaybackEvent>((resolve) => {
      el.currentAnimation?.pause()
      /* Typescript believes getComputedStyle returns an array ¯\_(ツ)_/¯, workaround */
      const computedStyle = getComputedStyle(el) as unknown as Keyframe
      const transformStart =
        transformInit ??
        targetProperties.reduce((acc: Keyframe, key: keyof Keyframe) => {
          if (key !== 'offset') acc[key] = computedStyle[key]?.toString()
          return acc
        }, {})
      debuglog(transformInit, transformEndArr)

      // Handle pick up of properties from previously aborted animations
      if (el.currentAnimation) {
        const timing = el.currentAnimation.effect?.getComputedTiming()
        const activeDuration = parseInt(String(timing?.activeDuration))
        const activeProgress = timing?.progress ?? 0
        duration -= activeDuration - activeProgress * activeDuration
      }

      el.currentAnimation?.cancel()
      el.currentAnimation = el.animate([transformStart, ...transformEndArr], {
        composite: composite,
        duration: duration,
        easing: easing,
        fill: fill,
        pseudoElement: pseudoElement,
      })
      el.currentAnimation.onfinish = resolve
      el.currentAnimation.oncancel = null
    })
    tasks.push(task)
  })
  return Promise.allSettled(tasks)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function debuglog(_: unknown, ...rest: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    if (debug) console.log(arguments)
  }
}

export { microAnimation, toLinear, easingFactory }

export type { MicroAnimationProps, TargetElement, EasingFactoryProduct }

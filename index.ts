import { Properties, Property } from 'csstype'

// =================================================================================================
// INTERFACE
// =================================================================================================

type TransformEnd = Properties | {}

interface TargetElement extends HTMLElement {
  currentAnimation?: Animation
}

interface MicroAnimationProps {
  /** Output values to console.log */
  debug?: boolean

  /** Duration in ms */
  duration?: number

  /** CSS easing */
  easing?: Property.AnimationTimingFunction

  /** The element to animate */
  element: TargetElement

  /** CSS fillmode, defaults to 'forwards' */
  fill?: FillMode

  /** Object (or array of objects if keyframe animation) with CSS properties to animate to */
  transformEnd: TransformEnd | TransformEnd[]
}

// =================================================================================================
// IMPLEMENTATION
// =================================================================================================

/**
 * Minimum is to pass an element and a transformEnd object.
 * Transform start is picked up from the element's computed style.
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
 * For a keyframe animation, pass an array of transformEnd objects.
 * The offset property is optional, and defaults to 0. In the example below,
 * the background color will change to orangered at 70% of the animation.
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
 */
export function microAnimation({
  debug = false,
  duration = 300,
  easing = 'linear',
  element: element,
  fill = 'forwards',
  transformEnd,
}: MicroAnimationProps) {
  const transformEndArr = Array.isArray(transformEnd)
    ? transformEnd
    : [transformEnd]

  // Extract the properties to animate from the transformEnd object(s)
  const targetProperties = transformEndArr.reduce(
    (acc, transformObj: TransformEnd) => {
      return [...acc, ...Object.keys(transformObj)] as (keyof Properties)[]
    },
    [] as (keyof Properties)[]
  )
  debuglog('targetProps', targetProperties)

  return new Promise((resolve) => {
    element.currentAnimation?.pause()

    /* Typescript believes getComputedStyle returns an array ¯\_(ツ)_/¯, workaround */
    const computedStyle = getComputedStyle(element) as unknown as Record<
      string,
      string
    >
    const transformStart = targetProperties.reduce(
      (acc: Record<string, string>, key: string) => {
        if (key !== 'offset') acc[key] = computedStyle[key]?.toString()!
        return acc as TransformEnd
      },
      {}
    )
    debuglog(transformStart, transformEndArr)

    // Handle pick up of properties from previously aborted animations
    if (element.currentAnimation) {
      const timing = element.currentAnimation.effect?.getComputedTiming()
      const activeDuration = parseInt(String(timing?.activeDuration))
      const activeProgress = timing?.progress!
      duration -= activeDuration - activeProgress * activeDuration
    }

    element.currentAnimation?.cancel()
    element.currentAnimation = element.animate(
      [transformStart, ...transformEndArr],
      {
        duration: duration,
        easing: easing as string | undefined,
        fill: fill,
      }
    )
    element.currentAnimation.onfinish = resolve
    element.currentAnimation.oncancel = null
  })

  function debuglog(_: unknown, ...rest: unknown[]) {
    if (debug) console.log(arguments)
  }
}

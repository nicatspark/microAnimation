import { Properties, Property } from 'csstype'

// =================================================================================================
// INTERFACE
// =================================================================================================

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
  transformEnd: Keyframe | Keyframe[]
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
function microAnimation({
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
    (acc, transformObj: Keyframe) => {
      return [...acc, ...Object.keys(transformObj)] as (keyof Properties)[]
    },
    [] as (keyof Properties)[]
  )
  debuglog('targetProps', targetProperties)

  if (!element) {
    return
  }

  return new Promise((resolve) => {
    element.currentAnimation?.pause()
    /* Typescript believes getComputedStyle returns an array ¯\_(ツ)_/¯, workaround */
    const computedStyle = getComputedStyle(element) as unknown as Keyframe
    const transformStart = targetProperties.reduce(
      (acc: Keyframe, key: string) => {
        if (key !== 'offset') acc[key] = computedStyle[key]?.toString()
        return acc
      },
      {}
    )
    debuglog(transformStart, transformEndArr)

    // Handle pick up of properties from previously aborted animations
    if (element.currentAnimation) {
      const timing = element.currentAnimation.effect?.getComputedTiming()
      const activeDuration = parseInt(String(timing?.activeDuration))
      const activeProgress = timing?.progress ?? 0
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function debuglog(_: unknown, ...rest: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    if (debug) console.log(arguments)
  }
}

export { microAnimation }

export type { MicroAnimationProps, TargetElement }

/*
 * Workflow:
 * pnpm changeset - create a new changeset
 *
 * Release sequence:
 * pnpm run build - builds the package
 * pnpm changeset version - bumps the version in the changeset/package json
 * pnpm changeset publish - publishes the package to npm
 * git push --follow-tags origin main
 */

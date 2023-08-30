type TransformEnd = Record<string, string | number>

type TargetElement = Record<'currentAnimation', Animation> & Element

interface MicroAnimationProps {
  debug: boolean
  duration?: number
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | (String & {})
  element: TargetElement
  fill?: 'forwards' | 'backwards' | 'both' | 'none'
  transformEnd: TransformEnd | TransformEnd[]
}

function microAnimation({
  debug = false,
  duration = 2000,
  easing = 'linear',
  element: element,
  fill = 'forwards',
  transformEnd,
}: MicroAnimationProps) {
  const transformEndArr = Array.isArray(transformEnd)
    ? transformEnd
    : [transformEnd]
  const targetProperties = transformEndArr.reduce(
    (acc, keyframe) => [...acc, ...Object.keys(keyframe)],
    [] as String[]
  )
  debuglog('targetProps', targetProperties)

  return new Promise((resolve) => {
    element.currentAnimation?.pause()
    const computedStyle = getComputedStyle(element)
    const transformStart = targetProperties.reduce((acc, key) => {
      if (key !== 'offset') acc[key] = computedStyle[key]
      return acc
    }, {})
    debuglog(transformStart, transformEndArr)
    // Handle pik up of properties from previously aborted animations
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

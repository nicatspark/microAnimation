type TransformEnd = Record<string, string | number>

type TargetElement = Record<'currentAnimation', Animation> & Element

interface MicroAnimationProps {
  transformEnd: TransformEnd | TransformEnd[]
  duration?: number
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  fill?: 'forwards' | 'backwards' | 'both' | 'none'
}

function microAnimation(
  el: TargetElement,
  {
    transformEnd,
    duration = 2000,
    easing = 'linear',
    fill = 'forwards',
  }: MicroAnimationProps
) {
  const transformEndArr = Array.isArray(transformEnd)
    ? transformEnd
    : [transformEnd]
  return new Promise((resolve) => {
    const targetProperties = transformEndArr.reduce(
      (acc, keyframe) => [...acc, ...Object.keys(keyframe)],
      [] as String[]
    )
    // console.log('targetProps', targetProperties)
    el.currentAnimation?.pause()
    const computedStyle = getComputedStyle(el)
    const transformStart = targetProperties.reduce((acc, key) => {
      if (key !== 'offset') acc[key] = computedStyle[key]
      return acc
    }, {})
    // console.log(transformStart, transformEndArr)
    if (el.currentAnimation) {
      const timing = el.currentAnimation.effect?.getComputedTiming()

      // duration of the running animation
      const activeDuration = parseInt(String(timing?.activeDuration))

      // progress between 0 and 1 of the running animation
      const activeProgress = timing?.progress!

      // calculate duration so that velocity is constant
      duration -= activeDuration - activeProgress * activeDuration
    }
    el.currentAnimation?.cancel()
    el.currentAnimation = el.animate([transformStart, ...transformEndArr], {
      duration: duration,
      easing: easing,
      fill: fill,
    })
    el.currentAnimation.onfinish = resolve
    el.currentAnimation.oncancel = null
  })
}

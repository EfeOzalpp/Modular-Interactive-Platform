export async function loadRockEscapadeTutorial(isRealMobile: boolean) {
  const animationModule = isRealMobile
    ? await import('../../json-assets/mobile-onboarding.json')
    : await import('../../json-assets/desktop-onboarding.json');

  return animationModule.default;
}

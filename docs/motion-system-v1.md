# Motion System v1

## Goal
Keep the site warm and fun while still feeling premium and trustworthy.

## Principles
- Motion should guide decisions, not distract from checkout.
- Animation should communicate quality and confidence.
- Every motion effect must have reduced-motion accessibility fallback.

## Active in Prototype
- Hero load-in: fade + rise entry sequence.
- Mascot presence: gentle floating loop in hero panel.
- Card interaction: subtle lift and shadow on hover.
- Section rhythm: staggered reveal timing across major sections.

## Planned for Customizer
- Step transitions between customizer stages.
- Etched-in text effect for engraving preview updates.
- Validation feedback pulses for warning and success states.
- Draft save confirmation micro-animation.

## Performance Guardrails
- Keep transitions primarily on `opacity` and `transform`.
- Cap animation duration to short, intentional moments.
- Avoid heavy runtime 3D on non-customizer pages.

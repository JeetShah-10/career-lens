# Career platform UI quality bar

CareerLens is a private career-coaching workspace for job seekers reviewing resumes on a phone or laptop. The product should feel calm, candid, and practical. Users should understand what the system found, what evidence supports it, and what to do next.

Use a readable light interface with tinted neutral surfaces, clear text contrast, and one deliberate accent. Build hierarchy from typography, spacing, and purposeful color. Avoid generic AI imagery, neon gradients, and dashboard clichés.

## 34 prohibited UI flaws

1. No generic hero followed by three identical feature cards as the app's main screen.
2. No gradient text.
3. No decorative glassmorphism or blurred panels.
4. No thick colored side stripes on cards or alerts.
5. No oversized score used as a vanity headline.
6. No score without a breakdown and plain-language explanation.
7. No false precision in fit percentages or unsupported scoring claims.
8. No vague advice such as “learn more” without a skill, reason, and next action.
9. No stock AI brain, robot, floating orb, circuit, or sparkle imagery.
10. No typewriter effects, pulsing loaders, or fake progress indicators.
11. No modal as the first choice for the main analysis flow.
12. No nested cards where a heading and list are clearer.
13. No repeated modules with identical size and visual weight.
14. No chart or KPI overload on the first screen.
15. No unlabeled icons for core actions.
16. No vague CTA copy when “Analyze resume” or “Save profile” is clearer.
17. No important instructions hidden in placeholder text.
18. No silently discarded resume, upload, filter, or unsaved profile changes.
19. No blank panels, endless spinners, or unexplained errors.
20. No messages that blame users for provider failures.
21. No raw JSON, prompt text, or internal errors in the interface.
22. No model response rendered as trusted HTML.
23. No claim that analysis predicts hiring or guarantees a job.
24. No inference about protected or sensitive personal traits.
25. No shaming labels such as “weak candidate”; explain gaps respectfully.
26. No invented market statistics, salaries, course links, or citations.
27. No hidden filter state or filters without a clear reset action.
28. No reliance on color alone for score, priority, or error state.
29. No low-contrast body text, tiny labels, or hover-only controls.
30. No broken mobile flow or horizontal scrolling at 360px.
31. No motion that blocks reading or ignores reduced-motion preferences.
32. No unnecessary requests for personal information.
33. No suggestion that resumes are public; explain storage and deletion.
34. No screen shipped without loading, empty, error, and success states.

## Screen requirements

### Resume analysis

Use one focused form with resume paste, target role, optional job description, and a clearly named “Analyze resume” action. If PDF upload is implemented, show file type and size limits beside the control. Preserve inputs after validation or provider failures. Briefly explain private storage and provider processing.

### Analysis results

Lead with a concise summary and a visible note that this is career coaching, not a hiring decision. Explain each score dimension. Present strengths, gaps, missing skills, skill recommendations with reasons, and career suggestions in readable sections. Add the roadmap and job-description match when those P1 features are implemented. Tie suggestions to resume evidence, target role, or the supplied job description. Keep job-description match distinct from overall assessment.

### History

Show date, target role, score, and concise outcome for each saved analysis. Filters are visible, keyboard accessible, combinable, and resettable. Empty history leads to analysis. A trend chart may supplement the list but must not replace it.

### Profile, account, and messages

Use short labeled fields, inline validation, and visible saved state. Error messages say what happened and what to do. Preserve user input when a recoverable request fails.

## Accessibility and completion

- Meet WCAG 2.1 AA contrast; support keyboard navigation, visible focus, semantic headings, associated labels/errors, and announced status changes.
- Keep the experience usable at 360px without horizontal scrolling. Use readable type and practical touch targets.
- Respect `prefers-reduced-motion`; keep motion brief and purposeful.
- A screen is complete when a new user can identify its purpose quickly, finish its main task without hidden knowledge, recover from errors, and use it on mobile and keyboard.

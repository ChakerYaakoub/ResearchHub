/** Home page copy. */

export const home = {
  hero: {
    brand: 'ResearchHub',
    headline: 'Manage proposals, experiments, and publications in one place',
    support:
      'Create a scientific project, submit it for review, schedule experiments, and invite collaborators.',
    ctaRegister: 'Get started',
    ctaHowItWorks: 'How it works',
  },
  stepsHeading: 'From proposal to publication',
  stepLabel: (n: number) => `Step ${n}`,
  steps: [
    {
      title: 'Propose',
      body: 'Draft your project and proposal with clear scientific objectives.',
    },
    {
      title: 'Review',
      body: 'Submit for scientific review and track approval status.',
    },
    {
      title: 'Experiment',
      body: 'Schedule instrument time and record experiment notes.',
    },
    {
      title: 'Publish',
      body: 'Link publications and mark the project complete.',
    },
  ],
} as const

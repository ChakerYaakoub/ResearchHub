/** How it works page copy. */

export const howItWorksPage = {
  title: 'How it works',
  intro:
    'ResearchHub follows a simple project lifecycle. Invalid status jumps are blocked on the server.',
  steps: [
    {
      status: 'DRAFT',
      title: 'Create a project',
      body: 'Describe the science case and prepare a proposal while the project is still a draft.',
    },
    {
      status: 'UNDER_REVIEW',
      title: 'Submit for review',
      body: 'Editors submit the proposal. Platform admins approve or reject from the admin app.',
    },
    {
      status: 'APPROVED',
      title: 'Plan experiments',
      body: 'After approval, schedule instruments and start experimental work.',
    },
    {
      status: 'COMPLETED',
      title: 'Publish and close',
      body: 'Attach publications and mark the project complete when the campaign is done.',
    },
  ],
} as const

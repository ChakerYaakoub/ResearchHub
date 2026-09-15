/** Documentation page copy. */

export const documentationPage = {
  title: 'Documentation',
  intro:
    'Public overview of ResearchHub concepts. Detailed API docs live with the backend team; this page is for researchers discovering the platform.',
  sections: [
    {
      title: 'Accounts',
      body: 'Register with email and password. Sessions use JWT access and refresh tokens stored in this browser origin only.',
    },
    {
      title: 'Projects & roles',
      body: 'Owners manage invitations and collaborators. Editors can edit content; viewers have read-only access.',
    },
    {
      title: 'Invitations',
      body: 'Owners invite by email. Access is granted only after the invitee accepts with a matching account email.',
    },
    {
      title: 'Admin review',
      body: 'Platform admins approve or reject proposals from a separate admin application.',
    },
  ],
} as const

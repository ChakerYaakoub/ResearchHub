/** Instruments page copy. */

export const instrumentsPage = {
  title: 'Instruments',
  intro:
    'Instruments below are fictional stand-ins for beamlines and end-stations used when drafting experiment plans.',
  items: [
    {
      name: 'XR-Alpha',
      energy: 'Soft X-ray',
      use: 'Absorption spectroscopy and dichroism',
    },
    {
      name: 'IMG-Beta',
      energy: 'Hard X-ray',
      use: 'Microscopy and tomography',
    },
    {
      name: 'IR-Gamma',
      energy: 'Infrared',
      use: 'Vibrational spectroscopy of materials',
    },
    {
      name: 'UV-Delta',
      energy: 'VUV',
      use: 'Gas-phase and surface photochemistry',
    },
  ],
} as const

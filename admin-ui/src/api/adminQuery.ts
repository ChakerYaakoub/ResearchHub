/** Build `?a=1&b=2` from defined non-empty values. */
export function adminQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    q.set(key, String(value))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export type UserListParams = {
  search?: string
  is_active?: boolean | ''
}

export type ProjectListParams = {
  status?: string
  search?: string
}

export type ProposalListParams = {
  status?: string
  search?: string
}

export type InvitationListParams = {
  status?: string
  search?: string
  project?: number | string
}

export type PublicationListParams = {
  search?: string
  kind?: string
}

export type InstallationListParams = {
  status?: string
  search?: string
}

export type InstrumentListParams = {
  installation?: number | string
  status?: string
  search?: string
}

import { authClient } from '@web/lib/auth-client'

export const SpacesHeader = () => {
  const { data } = authClient.useSession()
  return (
    <div className="flex items-center gap-2 px-4">
      <h2 className="font-semibold text-3xl leading-normal">
        Hey {data?.user.displayUsername || data?.user.name} 👋
      </h2>
    </div>
  )
}

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'

const UserInfo = ({ name, image }: { name: string; image: string }) => (
  <div className="flex items-center gap-2">
    <Avatar className="h-6 w-6 overflow-hidden">
      <AvatarImage
        alt={name}
        className="h-full w-full object-cover"
        src={image}
      />
      <AvatarFallback className="flex h-full w-full items-center justify-center font-medium text-xs">
        {name?.[0]?.toUpperCase() ?? 'U'}
      </AvatarFallback>
    </Avatar>
    <span className="text-muted-foreground text-sm">{name}</span>
  </div>
)

export default UserInfo

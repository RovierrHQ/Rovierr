import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'

const UserInfo = ({ name, image }: { name: string; image: string }) => (
  <div className="flex items-center gap-2">
    <Avatar className="h-6 w-6 overflow-hidden">
      <div className="relative h-full w-full">
        <AvatarImage
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          src={image || '/user-avatar.png'}
        />
      </div>
      <AvatarFallback>{name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
    </Avatar>
    <span className="text-muted-foreground text-sm">{name}</span>
  </div>
)

export default UserInfo

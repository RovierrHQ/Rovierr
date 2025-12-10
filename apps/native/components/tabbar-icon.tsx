import FontAwesome from '@expo/vector-icons/FontAwesome'

export const TabBarIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
}) => <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />

// import AnimatedView from '@rov/components/AnimatedView'
import Icon, { type IconName } from '@rov/components/Icon'
import ThemedText from '@rov/components/ThemedText'
import ThemedScroller from '@rov/components/ThemeScroller'
import { type ReactNode, useMemo, useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const categories: Array<{ id: string; label: string; icon: IconName }> = [
  { id: 'groups', label: 'Groups', icon: 'Users' },
  { id: 'people', label: 'People', icon: 'User' },
  { id: 'posts', label: 'Posts', icon: 'FileText' },
  { id: 'events', label: 'Events', icon: 'Calendar' }
]

const groupResults = [
  { id: 'g1', title: 'Design Society', meta: '12.4k members' },
  { id: 'g2', title: 'Startup Lagos', meta: '7.8k members' },
  { id: 'g3', title: 'Rovers FC', meta: '4.1k members' }
]

const peopleResults = [
  { id: 'p1', title: 'Rex Adewale', meta: 'Product · 2 mutuals' },
  { id: 'p2', title: 'Maya Mensah', meta: 'Founder · 6 mutuals' },
  { id: 'p3', title: 'Chidi Okoro', meta: 'Designer · 1 mutual' }
]

const postResults = [
  {
    id: 'post1',
    title: 'Looking for a frontend dev for a small NGO project.',
    meta: 'Rex · 2h · 34 reactions'
  },
  {
    id: 'post2',
    title: 'New meetup photos are up from last night.',
    meta: 'Design Society · 6h · 120 reactions'
  }
]

const eventResults = [
  { id: 'e1', title: 'Founders Coffee', meta: 'Sat · Ikeja · 10:00 AM' },
  { id: 'e2', title: 'Design Sprint 101', meta: 'Mon · Online · 6:00 PM' }
]

type SectionProps = {
  title: string
  showSeeAll: boolean
  onSeeAll: () => void
  children: ReactNode
}

const Section = ({ title, showSeeAll, onSeeAll, children }: SectionProps) => (
  <View className="mb-6">
    <View className="flex-row items-center justify-between mb-3">
      <ThemedText className="text-text text-lg font-semibold">
        {title}
      </ThemedText>
      {showSeeAll && (
        <Pressable onPress={onSeeAll}>
          <ThemedText className="text-text/60 text-sm">See all</ThemedText>
        </Pressable>
      )}
    </View>
    {children}
  </View>
)

export default function SearchScreen() {
  const insets = useSafeAreaInsets()
  const [inputValue, setInputValue] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const query = submittedQuery.trim().toLowerCase()
  const hasQuery = query.length > 0
  const showAllSections = activeCategory === null
  const showSeeAll = !hasQuery && activeCategory === null
  const showGroups = showAllSections || activeCategory === 'groups'
  const showPeople = showAllSections || activeCategory === 'people'
  const showPosts = showAllSections || activeCategory === 'posts'
  const showEvents = showAllSections || activeCategory === 'events'

  const filteredGroups = useMemo(() => {
    if (!hasQuery) return groupResults
    return groupResults.filter((group) =>
      group.title.toLowerCase().includes(query)
    )
  }, [hasQuery, query])

  const filteredPeople = useMemo(() => {
    if (!hasQuery) return peopleResults
    return peopleResults.filter((person) =>
      person.title.toLowerCase().includes(query)
    )
  }, [hasQuery, query])

  const filteredPosts = useMemo(() => {
    if (!hasQuery) return postResults
    return postResults.filter((post) =>
      post.title.toLowerCase().includes(query)
    )
  }, [hasQuery, query])

  const filteredEvents = useMemo(() => {
    if (!hasQuery) return eventResults
    return eventResults.filter((event) =>
      event.title.toLowerCase().includes(query)
    )
  }, [hasQuery, query])

  const emptyAll =
    hasQuery &&
    showAllSections &&
    filteredGroups.length === 0 &&
    filteredPeople.length === 0 &&
    filteredPosts.length === 0 &&
    filteredEvents.length === 0

  const emptyActive =
    hasQuery &&
    activeCategory &&
    ((activeCategory === 'groups' && filteredGroups.length === 0) ||
      (activeCategory === 'people' && filteredPeople.length === 0) ||
      (activeCategory === 'posts' && filteredPosts.length === 0) ||
      (activeCategory === 'events' && filteredEvents.length === 0))

  const toggleCategory = (categoryId: string) => {
    setActiveCategory((current) => (current === categoryId ? null : categoryId))
  }

  const handleSubmit = () => {
    setSubmittedQuery(inputValue.trim())
  }

  const handleClear = () => {
    setInputValue('')
    setSubmittedQuery('')
  }

  return (
    // <AnimatedView
    //   animation="fadeIn"
    //   className="flex-1 bg-background"
    //   duration={100}
    // >
    <ThemedScroller className="pt-8 !px-2">
      <View
        className="w-full bg-background px-global"
        style={{ paddingTop: insets.top }}
      >
        <View className="mb-4">
          <View className="flex-row items-center rounded-2xl border border-border bg-card px-4 py-3">
            <Icon className="mr-3" name="Search" size={20} />
            <TextInput
              className="flex-1 text-text text-base"
              onChangeText={setInputValue}
              onSubmitEditing={handleSubmit}
              placeholder="Search people, posts, groups, or events"
              returnKeyType="search"
              value={inputValue}
            />
            <Pressable onPress={handleClear}>
              <Icon
                className={inputValue ? '' : 'opacity-30'}
                name="X"
                size={20}
              />
            </Pressable>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2 mb-4">
          {categories.map((category) => {
            const isActive = activeCategory === category.id
            return (
              <Pressable
                className={`flex-row items-center rounded-full border px-4 py-2 ${isActive ? 'bg-card border-text' : 'bg-muted border-border'}`}
                key={category.id}
                onPress={() => toggleCategory(category.id)}
              >
                <Icon className="mr-2" name={category.icon} size={16} />
                <ThemedText className="text-sm font-medium text-text">
                  {category.label}
                </ThemedText>
              </Pressable>
            )
          })}
        </View>

        <View className="mb-5">
          <ThemedText className="text-text/60 text-sm">
            {hasQuery ? `Results for "${submittedQuery}"` : 'Browse categories'}
          </ThemedText>
        </View>

        {(emptyAll || emptyActive) && (
          <View className="rounded-2xl border border-border bg-card px-4 py-4 mb-6">
            <ThemedText className="text-text text-base font-semibold">
              No results
            </ThemedText>
            <ThemedText className="text-text/60 text-sm mt-2">
              Try a different keyword or switch category.
            </ThemedText>
          </View>
        )}

        {showGroups && (
          <Section
            onSeeAll={() => setActiveCategory('groups')}
            showSeeAll={showSeeAll}
            title="Groups"
          >
            <View className="gap-3">
              {filteredGroups.map((group) => (
                <Pressable
                  className="flex-row items-center justify-between rounded-2xl border border-border bg-card px-4 py-4"
                  key={group.id}
                >
                  <View className="flex-row items-center">
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-muted">
                      <Icon name="Users" size={18} />
                    </View>
                    <View>
                      <ThemedText className="text-text text-base font-semibold">
                        {group.title}
                      </ThemedText>
                      <ThemedText className="text-text/60 text-sm">
                        {group.meta}
                      </ThemedText>
                    </View>
                  </View>
                  <Icon name="ChevronRight" size={18} />
                </Pressable>
              ))}
            </View>
          </Section>
        )}

        {showPeople && (
          <Section
            onSeeAll={() => setActiveCategory('people')}
            showSeeAll={showSeeAll}
            title="People"
          >
            <View className="gap-3">
              {filteredPeople.map((person) => (
                <Pressable
                  className="flex-row items-center justify-between rounded-2xl border border-border bg-card px-4 py-4"
                  key={person.id}
                >
                  <View className="flex-row items-center">
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-muted">
                      <Icon name="User" size={18} />
                    </View>
                    <View>
                      <ThemedText className="text-text text-base font-semibold">
                        {person.title}
                      </ThemedText>
                      <ThemedText className="text-text/60 text-sm">
                        {person.meta}
                      </ThemedText>
                    </View>
                  </View>
                  <Icon name="UserPlus" size={18} />
                </Pressable>
              ))}
            </View>
          </Section>
        )}

        {showPosts && (
          <Section
            onSeeAll={() => setActiveCategory('posts')}
            showSeeAll={showSeeAll}
            title="Posts"
          >
            <View className="gap-3">
              {filteredPosts.map((post) => (
                <Pressable
                  className="rounded-2xl border border-border bg-card px-4 py-4"
                  key={post.id}
                >
                  <View className="flex-row items-start">
                    <View className="mr-3 mt-1 h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                      <Icon name="FileText" size={18} />
                    </View>
                    <View className="flex-1">
                      <ThemedText className="text-text text-base font-semibold">
                        {post.title}
                      </ThemedText>
                      <ThemedText className="text-text/60 text-sm mt-1">
                        {post.meta}
                      </ThemedText>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </Section>
        )}

        {showEvents && (
          <View className="mb-10">
            <Section
              onSeeAll={() => setActiveCategory('events')}
              showSeeAll={showSeeAll}
              title="Events"
            >
              <View className="gap-3">
                {filteredEvents.map((event) => (
                  <Pressable
                    className="flex-row items-center justify-between rounded-2xl border border-border bg-card px-4 py-4"
                    key={event.id}
                  >
                    <View className="flex-row items-center">
                      <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-muted">
                        <Icon name="Calendar" size={18} />
                      </View>
                      <View>
                        <ThemedText className="text-text text-base font-semibold">
                          {event.title}
                        </ThemedText>
                        <ThemedText className="text-text/60 text-sm">
                          {event.meta}
                        </ThemedText>
                      </View>
                    </View>
                    <Icon name="ChevronRight" size={18} />
                  </Pressable>
                ))}
              </View>
            </Section>
          </View>
        )}
      </View>
    </ThemedScroller>
    // </AnimatedView>
  )
}

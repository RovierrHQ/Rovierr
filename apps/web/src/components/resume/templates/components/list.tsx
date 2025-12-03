'use client'
import { Circle, StyleSheet, Svg, Text, View } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  list: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 10,
    marginLeft: 10
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    width: '100%'
  },
  bullet: {
    marginTop: 6
  },
  text: {
    fontSize: 12,
    flex: 1,
    paddingBottom: 0,
    marginBottom: 0
  }
})

const List = ({
  items,
  ordered = false
}: {
  items: string[]
  ordered?: boolean
}) => (
  <View style={styles.list}>
    {items.map((item, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: n>
      <View key={index} style={styles.listItem}>
        <View style={{ marginTop: ordered ? 0 : styles.bullet.marginTop }}>
          {ordered ? (
            <Text style={{ padding: 0, margin: 0 }}>{index + 1}.</Text>
          ) : (
            <Svg height={4} width={4}>
              <Circle cx="2" cy="2" fill="black" r="2" />
            </Svg>
          )}
        </View>
        <Text style={styles.text}>{item}</Text>
      </View>
    ))}
  </View>
)

export default List

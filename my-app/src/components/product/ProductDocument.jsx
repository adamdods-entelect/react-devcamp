import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

// Product details as a downloadable PDF (Milestone 7 — sharing deliverable).
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: '#1f2937', lineHeight: 1.5 },
  title: { fontSize: 22, fontWeight: 'bold' },
  price: { marginTop: 6, fontSize: 14, fontWeight: 'bold', color: '#2f6bff' },
  section: { marginTop: 20 },
  heading: { fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
  body: { color: '#374151' },
  bullet: { flexDirection: 'row', marginBottom: 3 },
  dot: { width: 12 },
})

export default function ProductDocument({ product }) {
  const { name, price, description, benefits = [], requirements = [] } = product

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{name}</Text>
        {typeof price === 'number' && <Text style={styles.price}>R {price.toFixed(2)} per month</Text>}

        {description ? (
          <View style={styles.section}>
            <Text style={styles.heading}>Description</Text>
            <Text style={styles.body}>{description}</Text>
          </View>
        ) : null}

        {benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Benefits</Text>
            {benefits.map((item) => (
              <View key={item} style={styles.bullet}>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.body}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Requirements</Text>
            {requirements.map((item) => (
              <View key={item} style={styles.bullet}>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.body}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}

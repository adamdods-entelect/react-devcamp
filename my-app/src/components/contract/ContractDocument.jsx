import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 11, color: '#1f2937', lineHeight: 1.5 },
    title: { fontSize: 20, fontWeight: 'bold' },
    meta: { marginTop: 4, color: '#6b7280' },
    section: { marginTop: 24 },
    heading: { fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottom: '1 solid #e5e7eb' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, fontWeight: 'bold' },
    terms: { marginTop: 8, color: '#374151' },
})

export default function ContractDocument({ customer, products, totals, date }) {
    const fullName = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ')

    return (
        <Document>
            <Page size="A4" style= {styles.page}>
                <Text style={styles.title}>Product Take-Up Contract</Text>
                <Text style={styles.meta}>Generated {date}</Text>

                <View style={styles.section}>
                    <Text style={styles.heading}>Customer</Text>
                    <Text>{fullName}</Text>
                    {customer?.idNumber ? <Text>ID: {customer.idNumber}</Text> : null}
                    {customer?.username ? <Text>{customer.username}</Text> : null}
                    {customer?.customerType?.name ? <Text>Customer type: {customer.customerType.name}</Text> : null}
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>Products</Text>
                    {products.map((p) => (
                        <View key={p.id} style={styles.row}>
                            <Text>{p.name}</Text>
                            <Text>R {Number(p.price).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.totalRow}>
                        <Text>Total payable now</Text>
                        <Text>R {totals.payNow.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>Terms</Text>
                    <Text style={styles.terms}>
                        By taking up the products listed above, the customer agrees to the
                        applicable product terms and pricing. This contract is generated from
                        the customer profile and product information held by the product shop,
                        following successful verification checks.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}
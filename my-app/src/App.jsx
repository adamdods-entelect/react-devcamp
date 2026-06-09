import './App.css'
import TopBar from './components/TopBar'
import ProductImage from './components/ProductImage'
import ProductInfo from './components/ProductInfo'
import RelatedProducts from './components/RelatedProducts'
import PriceBar from './components/PriceBar'

const product = {
  id: 1,
  name: 'Islamic Investment Product',
  description: 'Our comprehensive coverage ensures that your devices are protected against a wide range of mishaps.',
  price: 350.00,
  discount: 25,
  imageUrl: 'https://picsum.photos/400/300',
  benefits: [
    'Theft and loss recovery',
    'Comprehensive coverage',
    'Hardware malfunction coverage',
  ],
  requirements: [
    'Minimum age of 18 years old',
    'South African resident',
    'Have an account with us in good standing',
  ],
}

const relatedProducts = [
  { id: 2, name: 'Home Insurance', price: 220, imageUrl: 'https://picsum.photos/id/1060/200/150' },
  { id: 3, name: 'Car Insurance',  price: 480, imageUrl: 'https://picsum.photos/id/1071/200/150' },
  { id: 4, name: 'Travel Cover',   price: 150, imageUrl: 'https://picsum.photos/id/1011/200/150' },
]

function App() {
  return (
    <main>
      <TopBar name={product.name} />
      <ProductImage imageUrl={product.imageUrl} discount={product.discount} />
      <ProductInfo 
        name={product.name} 
        description={product.description} 
        benefits={product.benefits}
        requirements={product.requirements}
        />
      <RelatedProducts products={relatedProducts} />
      <PriceBar price={product.price} />
    </main>
  )
}

export default App

import '@/styles/globals.css'
import Layout from '@/components/Layout'
import ShopProvider from '@/context/context'

export default function App({ Component, pageProps }) {
  return (
    <ShopProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ShopProvider>
  )
}

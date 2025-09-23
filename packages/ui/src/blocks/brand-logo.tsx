import { SparklesText } from '@/components/text-animations/sparkles'

function BrandLogo() {
  return (
    <a href="/">
      <SparklesText className="text-xl lg:text-3xl" sparklesCount={3}>
        Rovierr
      </SparklesText>
    </a>
  )
}

export default BrandLogo

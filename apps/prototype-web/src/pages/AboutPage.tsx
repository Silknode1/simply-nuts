import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Leaf, Award, Users } from 'lucide-react'
import { SHOP_URL } from '../config'

export default function AboutPage() {
  return (
    <div className="pt-16 pb-16 min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-wood-900 text-cream py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            className="font-display text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Our Story
          </motion.h1>
          <motion.p
            className="text-wood-300 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            A family business roasting premium nuts, mixes, and chocolates in
            Chanhassen, Minnesota since 1986.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/brand/state-fair-booth.jpeg"
                alt="Our Minnesota State Fair booth"
                className="rounded-2xl w-full h-80 object-cover shadow-lg"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-wood-900 mb-4">
                40 Years of Small-Batch Roasting
              </h2>
              <p className="text-wood-600 mb-4">
                Simply Nuts &amp; More started as a family business in 1986, and we still
                roast and hand-mix everything in small batches right here in Chanhassen,
                Minnesota. Nothing sits around getting stale.
              </p>
              <p className="text-wood-600 mb-4">
                If you've wandered the Minnesota State Fair, there's a good chance you've
                followed your nose to our booth. We've been a fair favorite for nearly
                four decades, and we still get a little giddy when someone says it's the
                freshest nut they've ever had.
              </p>
              <p className="text-wood-600">
                Today we ship our treats by the pound all across the country, and come
                the holidays, we laser-engrave custom gift boxes for companies who want
                to send something people actually remember.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-wood-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center text-wood-900 mb-12">
            What Drives Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: 'Family-Run', desc: 'Three generations of roasting, tasting, and bagging by hand.' },
              { icon: Award, title: 'State Fair Famous', desc: 'A Minnesota tradition that keeps the line moving every August.' },
              { icon: Leaf, title: 'Small-Batch Fresh', desc: 'Roasted and mixed to order so nothing ships stale.' },
              { icon: Users, title: 'Community First', desc: 'Proudly made in Chanhassen and shipped with Minnesota care.' },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                className="text-center p-6 bg-white rounded-xl border border-wood-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-burn/10 text-burn mb-4">
                  <v.icon size={24} />
                </div>
                <h3 className="font-display font-semibold text-wood-900 mb-2">{v.title}</h3>
                <p className="text-sm text-wood-500">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '1986', label: 'Family-Run Since' },
              { num: '40', label: 'Years Roasting' },
              { num: '19+', label: 'Treats By The Pound' },
              { num: 'MN', label: 'Made in Minnesota' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-bold text-burn">{s.num}</div>
                <div className="text-sm text-wood-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-wood-900 text-cream text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold mb-4">
            Taste the Difference Fresh Makes
          </h2>
          <p className="text-wood-400 mb-8">
            Shop our freshly roasted treats by the pound, or reach out about custom
            corporate gifts for your team and clients.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={SHOP_URL}
              className="inline-flex items-center gap-2 px-8 py-4 bg-burn hover:bg-burn-light text-white font-semibold rounded-lg transition-colors no-underline"
            >
              Shop Our Treats
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-wood-400 hover:border-gold-400 text-cream font-semibold rounded-lg transition-colors no-underline"
            >
              Corporate Gifting
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

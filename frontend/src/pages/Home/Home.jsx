import Hero from '../../Hero/Hero';
import VoiceAssistant from '../../VoiceAssistant/VoiceAssistant';
import FeaturedDishes from '../../components/FeaturedDishes/FeaturedDishes';
import Categories from '../../components/Categories/Categories';
import DealsSection from '../../components/DealsSection/DealsSection';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import Reviews from '../../components/Reviews/Reviews';
import Newsletter from '../../components/Newsletter/Newsletter';

function Home() {
  return (
    <div>
      <Hero />
      <VoiceAssistant />
      <FeaturedDishes />
      <Categories />
      <DealsSection />
      <WhyChooseUs />
      <Reviews />
      <Newsletter />
    </div>
  );
}

export default Home;

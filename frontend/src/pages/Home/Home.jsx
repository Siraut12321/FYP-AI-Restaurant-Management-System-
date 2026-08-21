import Hero from '../../Hero/Hero';
import VoiceAssistant from '../../VoiceAssistant/VoiceAssistant';
import FeaturedDishes from '../../components/FeaturedDishes/FeaturedDishes';
import Categories from '../../components/Categories/Categories';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import Reviews from '../../components/Reviews/Reviews';

function Home() {
  return (
    <div>
      <Hero />
      <VoiceAssistant />
      <FeaturedDishes />
      <Categories />
      <WhyChooseUs />
      <Reviews />
    </div>
  );
}

export default Home;

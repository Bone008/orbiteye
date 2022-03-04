import './OrbitExplainer.css'
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper";


// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function OrbitExplainer() {
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={0}
      loop={true}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Pagination, Navigation]}
      className="OrbitExplainerSwiper"
    >
      <SwiperSlide className='OrbitExplainerSlide'>Overview</SwiperSlide>
      <SwiperSlide className='OrbitExplainerSlide'>LEO</SwiperSlide>
      <SwiperSlide className='OrbitExplainerSlide'>MEO</SwiperSlide>
      <SwiperSlide className='OrbitExplainerSlide'>GEO</SwiperSlide>
      <SwiperSlide className='OrbitExplainerSlide'>Elliptical</SwiperSlide>
    </Swiper>
  );
}
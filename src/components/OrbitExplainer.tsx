import './OrbitExplainer.css'
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper";

import OverviewImg from '../assets/orbits.png';
import EllipticalImg from '../assets/Ellip.png';
import GEOImg from '../assets/Geo.png';
import LEOImg from '../assets/Leo.png';
import MEOImg from '../assets/Meo.png';


// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function OrbitExplainer() {
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={0}
      loop={false}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Pagination, Navigation]}
      className="OrbitExplainerSwiper"
    >
      <SwiperSlide className='OrbitExplainerSlide'>
        <h1>Orbit Types Overview</h1>
        <p>
          Satellites can travel in many different orbits around Earth. The shape, size, and orientation of
          the orbit determines a lot about what the satellite may be good for! Below is a diagram of the most
          broad categories of orbits. Click through the slides to learn more about each one.
        </p>
        <img src={OverviewImg} />
      </SwiperSlide>
      <SwiperSlide className='OrbitExplainerSlide'>
        <h1>Elliptical Orbits</h1>
        <p>
          We often picture orbits as circles, but they are in fact <i>elliptical</i>. Most satellites follow <i>nearly
            circular</i> orbits, but not all! Elliptical orbits come close to the Earth at one end and stretch far
          out on the other. This allows them to have unique <i>ground tracks</i>, which is the path they travel over
          the Earth's surface.
        </p>
        <img src={EllipticalImg} />
      </SwiperSlide>
      <SwiperSlide className='OrbitExplainerSlide'>
        <h1>Low Earth Orbits</h1>
        <p>
          Circular orbits are most commonly categorized by their altitude, or distance from Earth. Low Earth
          orbits are the cheapest to launch and keep satellites in quick communication distance. However, since
          they are so close, these satellites have a limited field of view of the Earth.
        </p>
        <img src={LEOImg} />
      </SwiperSlide>
      <SwiperSlide className='OrbitExplainerSlide'>
        <h1>Medium Earth Orbits</h1>
        <p>
          Medium Earth orbit is more vaguely defined. It strikes a balance between cost of launch and view of Earth.
          Most notably, GPS satellites use MEO with a 12 hour orbital period around the equator. This means that
          they pass over the same two spots on Earth every day.
        </p>
        <img src={MEOImg} />
      </SwiperSlide>
      <SwiperSlide className='OrbitExplainerSlide'>
        <h1>Geosynchronous Orbits</h1>
        <p>
          Geosynchronous orbits have an orbital period of 24 hours. This means that they rotate around Earth just as fast
          as Earth rotates on its axis. The result is a ground track which focuses on a small region of Earth in a figure-eight.
          When the satellite is rotating exactly around the equator, the ground track is just a single spot! This special case
          is called a <i>geostationary</i> orbit.
        </p>
        <img src={GEOImg} />
      </SwiperSlide>
    </Swiper>
  );
}
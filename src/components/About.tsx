import './About.css';

import { NavLink, Navigate, Route, Routes, Link } from 'react-router-dom';

import AvelinImg from "../assets/AvelinPic.jpg";
import BorjaImg from "../assets/borjaPic.jpg";
import LukasImg from "../assets/Geo.png"; // TODO: replace with actual image
import OctaveImg from "../assets/octavePic.jpg";
import SahilImg from "../assets/Sahil.jpg";
import { GitHubIcon, LinkedInIcon } from './Icons';
import { ReactElement } from 'react';

export function AboutNav() {
  const navClass = ({ isActive }: { isActive: boolean }) => isActive ? "selected" : "";

  return (
    <div className="nav nav-horizontal nav-shadow">
      <NavLink to="/" title="Home" className={navClass}><h1>OrbitEye</h1></NavLink>
      <NavLink to="/about/overview" className={navClass}>Project Overview</NavLink>
      <NavLink to="/about/demo" className={navClass}>Demo Video</NavLink>
      <NavLink to="/about/team" className={navClass}>Team Members</NavLink>
    </div>
  );
}

export default function About() {
  const navClass = ({ isActive }: { isActive: boolean }) => isActive ? "selected" : "";

  return (
    <div className="About">
      <AboutNav />
      <Routes>
        <Route path="/overview" element={
          <div className='ProjectOverview content'>
            <h2>Project Overview</h2>
            <p>
              OrbitEye is a satellite visualizer created for the KTH course DT2212: Information Visualization. There are 3 modes:
              Orbits view, Ground Tracks view, and Origins view. The first two focus on the spatial position of satellites and the
              different orbit types they can take. Orbits view shows the 3D position of satellites around Earth while Ground Tracks
              view shows what parts of the Earth's surface a satellite flies over. Origins view is a statistical view showing which
              countries/organizations own different satellites.
            </p>
            <p>
              OrbitEye is made to be exploratory, so go ahead and <Link to="/">try it out</Link>! If you want an overview first,
              check out our <Link to="../demo">demo video</Link>. Our source code is <a href="https://github.com/bone008/orbiteye">
                available on GitHub</a>.
            </p>
            <p>
              Our data comes from the <a href="https://www.ucsusa.org/resources/satellite-database">Union of Concerned Scientists
              </a>, <a href="https://celestrak.com/satcat/search.php">CelesTrak's SATCAT</a>, and <a href="https://celestrak.com/NORAD/elements/">
                CelesTrak's TLE data</a>. The data used is <i>not</i> automatically updated &mdash; it is stored statically for simplicity.
            </p>

            <h2>Learning Objectives</h2>
            <p>
              Through the course of this project we had a few key learning objectives:
            </p>
            <ul>
              <li>Data processing with Pandas</li>
              <li>Data visualization with D3 and ThreeJS</li>
              <li>UI development with React</li>
              <li>UX evaluation techniques (user testing)</li>
              <li>Project management with GitHub Projects</li>
            </ul>
            <p>
              Not all of us participated fully in every objective, but we each had the opportunity to take ownership over different
              aspects of the project. You can read more about our individual contributes in the <Link to="../team">Team Members
                page</Link>.
            </p>
          </div>
        } />
        <Route path="/demo" element={
          <div className="DemoVideo content">
            <h2>Demo Video</h2>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/FUG2TbvaDvs" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        } />
        <Route path="/team/*" element={
          <div className="TeamMembers content">
            <div className="nav nav-vertical nav-shadow">
              {teamMemberData.map(data => <NavLink key={data.link} to={data.link} className={navClass}>{data.shortName}</NavLink>)}
            </div>
            <div className="content">
              <Routes>
                {teamMemberData.map(data => <Route key={data.path} path={data.path} element={
                  <>
                    <h2>
                      <span style={(data.githubURL || data.linkedInURL) ? { marginRight: "0.5em" } : {}}>{data.name}</span>
                      {data.githubURL ? <a className="social" href={data.githubURL}><GitHubIcon /></a> : null}
                      {data.linkedInURL ? <a className="social" href={data.linkedInURL}><LinkedInIcon /></a> : null}
                    </h2>
                    <div className="memberInfo">
                      <img src={data.img} alt={data.shortName} />
                      {data.description}
                    </div>
                  </>
                } />)}

                <Route path="/" element={<Navigate to={teamMemberData[0].link} replace />} />
              </Routes>
            </div>
          </div>}
        />


        <Route path="/" element={<Navigate to="./overview" replace />} />
        {/* TODO: Make 404 */}
        <Route path="*" element={<Navigate to="./overview" replace />} />
      </Routes>
    </div>
  );
}


type TeamMemberData = {
  // Data for nav links
  link: string;
  shortName: string;

  // Data for full page
  path: string; // Should always be same as link but without relative path AFAIK
  name: string;
  img: string; // Should be from an import statement!
  description: ReactElement | string;
  githubURL?: string;
  linkedInURL?: string;
}
const teamMemberData: TeamMemberData[] = [
  {
    link: "./Avelin",
    shortName: "Ävelin",

    path: "Avelin",
    name: "Ävelin Pantigoso",
    img: AvelinImg,
    description: <>I am currently working towards a Msc in Interactive Media technology at KTH, and have a Bsc in Computer science and engineering. Creating art and graphic design are some of my hobbies, and I always enjoy creativity. Before this project I had explored computer visualization and done some web development projects in Typesript, but never worked with information visualization.

      <p>In this project, I initially worked with ideation and creating a low-fi prototype from our ideas. Later, I worked with the UI for some of our components, and graphic design for the educational content. I also worked with UX evaluation, where I conducted some of our user tests and analyzed feedback. In this project I have developed my knowledge in React and Typescript and their respective powers. This class and the project also taught me a lot about the visualization pipeline and how to implement it in a project. </p></>,
    githubURL: "https://github.com/avelinpv",
    linkedInURL: "https://www.linkedin.com/in/avelin-pantigoso/"
  },
  {
    link: "./Borja",
    shortName: "Borja",

    path: "Borja",
    name: "Borja Javierre",
    img: BorjaImg,
    description: <>

    I am a first year ICT Innovation Master student at KTH Royal Intitute of Technology. 
    Previously I've studied Audiovisual Systems engineering. However, I started these studies in KTH
    because I wanted to get more experience in software development while also learning concepts in innovation and entrepreneurship.
    Thanks to it, I'm learning to program in languages like C++, Javascript, CSS, HTML or TypeScript, as it has been done in this project.
    However, I worked in several projects in my Bachelor's degree in Matlab, Python and Java. 
    
    <p>My contribution to this project has been more on the User Experience evaluation, mapping of names of variables using 
    in the datasets used, implementing buttons in the interface using HTML as well as the decision-making of the appearance of the interface 
    given by the CSS files. To sum up, the combination of all the different programming languages, both in backend and frontend web developlemt
    has been very challenging, as the use of D3 was the first time to be seen for me.</p>

    </>,

    githubURL: "https://github.com/jakifasty",
    linkedInURL: "https://www.linkedin.com/in/borja-javierre/"
  },
  {
    link: "./Lukas",
    shortName: "Lukas",

    path: "Lukas",
    name: "Lukas Bonauer",
    img: LukasImg,
    description: "Description here.",
    githubURL: ""
  },
  {
    link: "./Octave",
    shortName: "Octave",

    path: "Octave",
    name: "Octave Le Tullier",
    img: OctaveImg,
    description:
      <>
        <p>I am currently finishing a double-degree in Computer Science at KTH &amp; Telecom Paris (2022). I enjoy doing sports and creating websites in my free time. I discovered information informalization a year ago and I really liked it. That is the reason why I decided to take this course and to work on this amazing project. I have also done computer visualization
          and human computer interaction courses before and I felt like this project was a nice continuation. I have worked before with classic web dev tools, however this was the first time I used TypeScript with React.
        </p>
        <p>At the beginning, I chose to work on UX and initial designs. I also built 'Origins' tab using D3.js. Finally, I conducted user-testing evaluations to get feedback of the UX of our project.
          This project significantly enhanced my knowledge of D3.js, React, and TypeScript. All in all, OrbitEye allowed me to deepen my information visualization skills and carry out a team project. I hope you'll enjoy it and discover lots of things about satellites!
        </p>
      </>,
    githubURL: "https://github.com/OctaveLT",
    linkedInURL: "https://www.linkedin.com/in/octave-le-tullier-10b9141b3"
  },
  {
    link: "./Sahil",
    shortName: "Sahil",

    path: "Sahil",
    name: "Sahil Patel",
    img: SahilImg,
    githubURL: "https://github.com/sahilshahpatel",
    linkedInURL: "https://linkedin.com/in/sahilshahpatel",
    description: <>
      I am a Computer Engineering student at the University of Illinois currently doing an exchange semester at KTH.
      Computer graphics has long been an interest of mine, but I had not dabbled in information visualization much before this project.
      Satellites and astronomy in general are a side interest of mine, so building a tool which I myself was interested in was just a treat!

      <p>
        In this project, I contributed most to the Orbits view which was built with ThreeJS through react-three-fiber. I also built the navigation
        for both the views and the about pages. This was my first big React project, and I learned a lot about the framework and how to combine my
        existing HTML/CSS skills with the power of React. Through other portions of this class and some work in this project I was also able to
        learn about D3 and how to use it for powerful data-driven design.
      </p>
    </>,
  },
]

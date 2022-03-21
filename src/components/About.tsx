import './About.css';

import { NavLink, Navigate, Route, Routes } from 'react-router-dom';

// TODO: replace with all team member images
import PlaceholderImage1 from "../assets/AvelinPic.jpg";
import PlaceholderImage2 from "../assets/Geo.png";
import PlaceholderImage3 from "../assets/Geo.png";
import PlaceholderImage4 from "../assets/Geo.png";
import PlaceholderImage5 from "../assets/Geo.png";
import GitImage from "../assets/GitHubLight.png";

export default function About() {
  const navClass = ({ isActive }: { isActive: boolean }) => isActive ? "selected" : "";

  return (
    <div className="About">
      <div className="nav">
        <NavLink to="/" title="Back to the visualization"><h1>OrbitEye</h1></NavLink>
        <NavLink to="./overview" className={navClass}>Project Overview</NavLink>
        <NavLink to="./demo" className={navClass}>Demo Video</NavLink>
        <NavLink to="./team" className={navClass}>Team Members</NavLink>
      </div>
      <Routes>
        <Route path="/overview" element={
          <div className='ProjectOverview content'>
            <h2>Project Overview</h2>
            <p>Basic summary here</p>
            <h2>Learning Objectives</h2>
            <p>More stuff here</p>
          </div>
        } />
        <Route path="/demo" element={
          <div className="DemoVideo content">
            <h2>Demo Video</h2>
            <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ScMzIvxBSi4" title="Demo video on Youtube" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        } />
        <Route path="/team/*" element={
          <div className="TeamMembers content">
            <div className="nav">
              {teamMemberData.map(data => <NavLink key={data.link} to={data.link} className={navClass}>{data.shortName}</NavLink>)}
            </div>
            <div className="content">
              <Routes>
                {teamMemberData.map(data => <Route key={data.path} path={data.path} element={
                  <>
                    <h2>{data.name}</h2>
                    <div className="memberInfo">
                      <img style={{ float: "left", width: '40vw' }} src={data.img} alt={data.shortName} />
                      <div>
                        <div style={{ padding: '0 1em 0 1em' }}>{data.description}</div>
                        <a href={data.githubURL}>
                          <img style={{ margin: '1em', cursor: 'pointer' }} src={GitImage} />
                        </a></div>
                    </div>
                  </>
                } />)}

                <Route path="/" element={<Navigate to={teamMemberData[0].link} />} />
              </Routes>
            </div>
          </div>}
        />


        <Route path="/" element={<Navigate to="./overview" />} />
        {/* TODO: Make 404 */}
        <Route path="*" element={<Navigate to="./overview" />} />
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
  description: string;
  githubURL: string;
}
const teamMemberData: TeamMemberData[] = [
  {
    link: "./Avelin",
    shortName: "Ävelin",

    path: "Avelin",
    name: "Ävelin Pantigoso",
    img: PlaceholderImage1,
    description: "I am currently working towards a Msc in Interactive Media technology at KTH, and have a Bsc in Computer science and engineering. Creating art and graphic design are some of my hobbies, and I always enjoy creativity. In this project, I initially worked with ideation and creating a low-fi prototype from our ideas. Later, I worked with the UI for some of our components, and graphic design for the educational content. I also worked with UX evaluation, where I conducted some of our user tests and analyzed feedback.",
    githubURL: "https://github.com/avelinpv"
  },
  {
    link: "./Borja",
    shortName: "Borja",

    path: "Borja",
    name: "Borja Javierre",
    img: PlaceholderImage2,
    description: "Borja is a beginner in programming in JavaScript, CSS, HTML or TextScript. However, he worked in several projects in Matlab, C++ and Python. Thanks to this project, he could learn about other technolgies of the current market.",
    githubURL: "https://github.com/jakifasty"
  },
  {
    link: "./Lukas",
    shortName: "Lukas",

    path: "Lukas",
    name: "Lukas Bonauer",
    img: PlaceholderImage3,
    description: "Description here.",
    githubURL: ""
  },
  {
    link: "./Octave",
    shortName: "Octave",

    path: "Octave",
    name: "Octave Le Tullier",
    img: PlaceholderImage4,
    description: "Interested by data and visualization, this project Orbiteye was amazing for me. I learnt a lot about d3 and TypeScript. I hope you'll enjoy our team work and discover lots of things about satellites!",
    githubURL: "https://github.com/OctaveLT"
  },
  {
    link: "./Sahil",
    shortName: "Sahil",

    path: "Sahil",
    name: "Sahil Patel",
    img: PlaceholderImage5,
    description: "Description here.",
    githubURL: ""
  },
]

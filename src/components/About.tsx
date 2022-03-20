import './About.css';

import { NavLink, Navigate, Route, Routes } from 'react-router-dom';

// TODO: replace with all team member images
import PlaceholderImage from "../assets/Geo.png";

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
                      <img style={{ float: "left" }} src={data.img} alt={data.shortName} />
                      <p>{data.description}</p>
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
}
const teamMemberData: TeamMemberData[] = [
  {
    link: "./Avelin",
    shortName: "Ävelin",

    path: "Avelin",
    name: "Ävelin Pantigoso",
    img: PlaceholderImage,
    description: "Description here."
  },
  {
    link: "./Borja",
    shortName: "Borja",

    path: "Borja",
    name: "Borja Javierre",
    img: PlaceholderImage,
    description: "Description here."
  },
  {
    link: "./Lukas",
    shortName: "Lukas",

    path: "Lukas",
    name: "Lukas Bonauer",
    img: PlaceholderImage,
    description: "Description here."
  },
  {
    link: "./Octave",
    shortName: "Octave",

    path: "Octave",
    name: "Octave Le Tuiller",
    img: PlaceholderImage,
    description: "Description here."
  },
  {
    link: "./Sahil",
    shortName: "Sahil",

    path: "Sahil",
    name: "Sahil Patel",
    img: PlaceholderImage,
    description: "Description here."
  },
]